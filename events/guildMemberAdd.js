import { readJSON } from '../utils/jsonStore.js';

export default {
  name: 'guildMemberAdd',
  async execute(client, member){
    const config = await readJSON('config.json', { welcome:{}, goodbye:{} });
    if(config.welcome?.channelId && config.welcome.message){
      const ch = member.guild.channels.cache.get(config.welcome.channelId);
      if(ch?.isTextBased()) ch.send(config.welcome.message.replace(/\{user\}/g, `${member}`));
    }
  }
};
