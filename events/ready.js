import { startPresence } from '../utils/presence.js';

export default {
  name: 'clientReady',
  once: true,
  async execute(client){
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} servers`);
    console.log(`👥 Monitoring ${client.users.cache.size} users`);
    startPresence(client);
  }
};
