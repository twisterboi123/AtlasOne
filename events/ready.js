export default {
  name: 'ready',
    name: 'clientReady',
    once: true,
    async execute(client){
      console.log(`✅ Logged in as ${client.user.tag}`);
      console.log(`📊 Serving ${client.guilds.cache.size} servers`);
      console.log(`👥 Monitoring ${client.users.cache.size} users`);
    
      // Set bot status
      const activities = [
        { name: '/help for commands', type: 3 }, // Watching
        { name: `${client.guilds.cache.size} servers`, type: 3 },
        { name: 'Discord bots', type: 0 }, // Playing
      ];
      let i = 0;
      const updateActivity = () => {
        client.user.setPresence({
          activities: [activities[i]],
          status: 'online'
        });
        i = (i + 1) % activities.length;
      };
      updateActivity();
      setInterval(updateActivity, 15000); // Rotate every 15s
    }
  };
