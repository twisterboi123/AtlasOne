import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('ping').setDescription('Show bot latency'),
  async execute(interaction){
    const ws = interaction.client.ws.ping;
    const sent = Date.now();
    const reply = await interaction.reply({ content: 'Pinging...', flags: 64 });
    const rt = Date.now() - sent;
    return interaction.editReply({ content: `Pong! WebSocket: ${ws}ms | Round-trip: ${rt}ms` });
  }
};
