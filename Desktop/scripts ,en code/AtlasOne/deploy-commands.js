// Registers slash commands using Discord REST API.
import { REST, Routes } from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';

const token = process.env.DISCORD_TOKEN;
const appId = process.env.DISCORD_APP_ID; // Application (client) ID
const guildId = process.env.DISCORD_GUILD_ID; // Optional for guild-scope

if(!token || !appId){
  console.error('DISCORD_TOKEN and DISCORD_APP_ID required.');
  process.exit(1);
}

async function collect(){
  const commandsDir = path.resolve('commands');
  const files = await fs.readdir(commandsDir);
  const data = [];
  for(const f of files){
    if(!f.endsWith('.js')) continue;
    const mod = await import(path.join(commandsDir, f));
    const cmd = mod.default;
    if(cmd?.data){
      data.push(cmd.data.toJSON());
    }
  }
  return data;
}

const rest = new REST({ version: '10' }).setToken(token);

(async ()=>{
  const cmds = await collect();
  try {
    if(guildId){
      await rest.put(Routes.applicationGuildCommands(appId, guildId), { body: cmds });
      console.log(`Registered ${cmds.length} guild commands.`);
    } else {
      await rest.put(Routes.applicationCommands(appId), { body: cmds });
      console.log(`Registered ${cmds.length} global commands.`);
    }
  } catch(e){
    console.error('Failed to register commands', e);
  }
})();
