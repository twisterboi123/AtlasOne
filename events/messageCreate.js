import { readJSON, writeJSON } from '../utils/jsonStore.js';
import { log } from '../utils/logger.js';

export default {
  name: 'messageCreate',
  async execute(client, message){
    if(message.author.bot || !message.guild) return;
    const auto = await readJSON('autoresponses.json', []);
    for(const entry of auto){
      if(message.content.toLowerCase().includes(entry.trigger.toLowerCase())){
        message.reply(entry.response).catch(()=>{});
        await log('auto.trigger', { trigger: entry.trigger, userId: message.author.id });
        break;
      }
    }
    // leveling cooldown
    const cooldownMs = 60000;
    client._lastXp = client._lastXp || new Map();
    const last = client._lastXp.get(message.author.id) || 0;
    if(Date.now() - last >= cooldownMs){
      const levels = client.context.levels;
      if(!levels[message.author.id]) levels[message.author.id] = { xp:0, level:0 };
      levels[message.author.id].xp += 25;
      const next = (levels[message.author.id].level + 1) * (levels[message.author.id].level + 1) * 100;
      if(levels[message.author.id].xp >= next){
        levels[message.author.id].level++;
        message.channel.send(`${message.author} leveled up to ${levels[message.author.id].level}!`).catch(()=>{});
        await log('level.up', { userId: message.author.id, level: levels[message.author.id].level });
      }
      client._lastXp.set(message.author.id, Date.now());
      await writeJSON('levels.json', levels);
    }
  }
};
