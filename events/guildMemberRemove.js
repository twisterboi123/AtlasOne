import { readJSON } from '../utils/jsonStore.js';

export default {
  name: 'guildMemberRemove',
  async execute(client, member){
    const config = await readJSON('config.json', { welcome:{}, goodbye:{} });
    if(config.goodbye?.channelId && config.goodbye.message){
      const ch = member.guild.channels.cache.get(config.goodbye.channelId);
      if(ch?.isTextBased()) ch.send(config.goodbye.message.replace(/\{user\}/g, `${member.user.tag}`));
    }
  }
};
