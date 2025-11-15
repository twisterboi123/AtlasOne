// Entry point: loads commands/events, restores reminders, starts client.
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';
import { readJSON, writeJSON } from './utils/jsonStore.js';
import { parseDuration, formatDuration } from './utils/timeParser.js';
import { log } from './utils/logger.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();
client.context = {
  reminders: [],
  reminderTimeouts: new Map(),
  polls: [],
  levels: {},
};

const commandsPath = path.resolve('commands');
const eventsPath = path.resolve('events');

async function loadCommands(){
  const files = await fs.readdir(commandsPath);
  for(const file of files){
    if(!file.endsWith('.js')) continue;
    const mod = await import(path.join(commandsPath, file));
    const command = mod.default;
    if(command?.data?.name){
      client.commands.set(command.data.name, command);
    }
  }
  console.log(`Loaded ${client.commands.size} commands.`);
}

async function loadEvents(){
  const files = await fs.readdir(eventsPath);
  for(const file of files){
    if(!file.endsWith('.js')) continue;
    const mod = await import(path.join(eventsPath, file));
    const ev = mod.default;
    if(ev?.name && typeof ev.execute === 'function'){
      if(ev.once){
        client.once(ev.name, (...args)=>ev.execute(client, ...args));
      } else {
        client.on(ev.name, (...args)=>ev.execute(client, ...args));
      }
    }
  }
}

async function restoreData(){
  client.context.reminders = await readJSON('reminders.json', []);
  client.context.polls = await readJSON('polls.json', []);
  client.context.levels = await readJSON('levels.json', {});
  // schedule reminders
  const now = Date.now();
  for(const r of client.context.reminders){
    const remaining = r.timestampDue - now;
    if(remaining > 0){
      scheduleReminder(r);
    }
  }
}

function scheduleReminder(rem){
  const delay = rem.timestampDue - Date.now();
  if(delay <= 0) return; // will be handled by restore skip
  const key = rem.id;
  if(client.context.reminderTimeouts.has(key)) clearTimeout(client.context.reminderTimeouts.get(key));
  const to = setTimeout(async ()=>{
    try {
      const user = await client.users.fetch(rem.userId);
      user.send(`⏰ Reminder: ${rem.message}`);
    } catch(e){ console.error('Failed to DM reminder', e); }
    // remove after fire
    client.context.reminders = client.context.reminders.filter(r=>r.id !== rem.id);
    await writeJSON('reminders.json', client.context.reminders);
  }, delay);
  client.context.reminderTimeouts.set(key, to);
}

client.on('interactionCreate', async interaction => {
  if(interaction.isChatInputCommand()){
    const command = client.commands.get(interaction.commandName);
    if(!command) return;
    try {
      await command.execute(interaction, client);
    } catch(e){
      console.error(e);
      if(interaction.replied || interaction.deferred){
        interaction.followUp({ content: 'Error executing command.', ephemeral: true });
      } else {
        interaction.reply({ content: 'Error executing command.', ephemeral: true });
      }
    }
  } else if(interaction.isButton()){
    // Poll vote buttons poll_vote_<id>_<index>
    const idMatch = interaction.customId.match(/^poll_vote_(\d+)_(\d+)$/);
    if(idMatch){
      const pollId = parseInt(idMatch[1],10);
      const optIndex = parseInt(idMatch[2],10);
      const poll = client.context.polls.find(p=>p.id === pollId);
      if(!poll) return interaction.reply({ content: 'Poll not found.', ephemeral: true });
      if(poll.closed) return interaction.reply({ content: 'Poll closed.', ephemeral: true });
      // track votes per user
      poll.votes = poll.votes || {}; // userId -> optionIndex
      poll.votes[interaction.user.id] = optIndex;
      await writeJSON('polls.json', client.context.polls);
      await interaction.reply({ content: `Vote recorded for option ${optIndex+1}.`, ephemeral: true });
      await log('poll.vote', { pollId, userId: interaction.user.id, optionIndex: optIndex });
    }
  }
});

client.on('messageCreate', async message => {
  if(message.author.bot || !message.guild) return;
  // autoresponder
  const auto = await readJSON('autoresponses.json', []);
  for(const entry of auto){
    if(message.content.toLowerCase().includes(entry.trigger.toLowerCase())){
      message.reply(entry.response).catch(()=>{});
      await log('auto.trigger', { trigger: entry.trigger, userId: message.author.id });
      break;
    }
  }
  // leveling with cooldown per user
  const cooldownMs = 60000; // 1 min
  client._lastXp = client._lastXp || new Map();
  const last = client._lastXp.get(message.author.id) || 0;
  if(Date.now() - last >= cooldownMs){
    const levels = client.context.levels;
    if(!levels[message.author.id]) levels[message.author.id] = { xp:0, level:0 };
    levels[message.author.id].xp += 25;
    // simple level up check
    const next = (levels[message.author.id].level + 1) * (levels[message.author.id].level + 1) * 100;
    if(levels[message.author.id].xp >= next){
      levels[message.author.id].level++;
      message.channel.send(`${message.author} leveled up to ${levels[message.author.id].level}!`).catch(()=>{});
    }
    client._lastXp.set(message.author.id, Date.now());
    await writeJSON('levels.json', levels);
  }
});

client.on('guildMemberAdd', async member => {
  const config = await readJSON('config.json', { welcome:{}, goodbye:{} });
  if(config.welcome?.channelId && config.welcome.message){
    const ch = member.guild.channels.cache.get(config.welcome.channelId);
    if(ch?.isTextBased()) ch.send(config.welcome.message.replace(/\{user\}/g, `${member}`));
  }
});

client.on('guildMemberRemove', async member => {
  const config = await readJSON('config.json', { welcome:{}, goodbye:{} });
  if(config.goodbye?.channelId && config.goodbye.message){
    const ch = member.guild.channels.cache.get(config.goodbye.channelId);
    if(ch?.isTextBased()) ch.send(config.goodbye.message.replace(/\{user\}/g, `${member.user.tag}`));
  }
});

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await restoreData();
});

await loadCommands();
await loadEvents();

const token = process.env.DISCORD_TOKEN; // set this env var or use .env with dotenv
if(!token){
  console.error('Missing DISCORD_TOKEN env variable.');
  process.exit(1);
}
client.login(token);

export { scheduleReminder, parseDuration, formatDuration };
