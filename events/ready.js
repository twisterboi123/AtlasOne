export default {
  name: 'ready',
  once: true,
  async execute(client){
    console.log(`Logged in as ${client.user.tag}`);
    // restore data after login
    // Data restoration handled in index.js via restoreData exposed on client? Simpler: re-read here.
    // Reminders and levels already loaded before events.
  }
};
