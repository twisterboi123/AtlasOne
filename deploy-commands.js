// Registers slash commands using Discord REST API.
import { REST, Routes } from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';

const token = process.env.DISCORD_TOKEN;
const appId = process.env.DISCORD_APP_ID; // Application (client) ID

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
    const filePath = path.join(commandsDir, f);
    const fileUrl = new URL(`file:///${filePath.replace(/\\/g, '/')}`);
    const mod = await import(fileUrl.href);
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
    console.log(`Registering ${cmds.length} global commands (available on all servers)...`);
    await rest.put(Routes.applicationCommands(appId), { body: cmds });
    console.log(`Successfully registered ${cmds.length} global commands.`);
    console.log('Note: Global commands may take up to 1 hour to propagate across all servers.');
  } catch(e){
    console.error('Failed to register commands', e);
  }
})();
