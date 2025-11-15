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
    const filePath = path.join(commandsPath, file);
    const fileUrl = new URL(`file:///${filePath.replace(/\\/g, '/')}`);
    const mod = await import(fileUrl.href);
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
    const filePath = path.join(eventsPath, file);
    const fileUrl = new URL(`file:///${filePath.replace(/\\/g, '/')}`);
    const mod = await import(fileUrl.href);
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

// Events moved to /events/*.js

(async () => {
  await loadCommands();
  await loadEvents();
  await restoreData();

  const token = process.env.DISCORD_TOKEN;
  if(!token){
    console.error('Missing DISCORD_TOKEN env variable.');
    process.exit(1);
  }
  client.login(token);
})();

export { scheduleReminder, parseDuration, formatDuration };
