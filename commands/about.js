import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

function formatUptime(){
  const s = Math.floor(process.uptime());
  const d = Math.floor(s/86400);
  const h = Math.floor((s%86400)/3600);
  const m = Math.floor((s%3600)/60);
  const sec = s%60;
  const parts = [];
  if(d) parts.push(`${d}d`); if(h) parts.push(`${h}h`); if(m) parts.push(`${m}m`); if(sec) parts.push(`${sec}s`);
  return parts.join(' ');
}

export default {
  data: new SlashCommandBuilder().setName('about').setDescription('About the bot'),
  async execute(interaction){
    const client = interaction.client;
    const embed = new EmbedBuilder()
      .setTitle('About AtlasOne')
      .setColor(0x5865F2)
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: 'Servers', value: String(client.guilds.cache.size), inline: true },
        { name: 'Users (cached)', value: String(client.users.cache.size), inline: true },
        { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
        { name: 'Uptime', value: formatUptime(), inline: true },
        { name: 'Commands', value: String(client.commands?.size || 0), inline: true }
      )
      .setFooter({ text: 'Built with discord.js v14' })
      .setTimestamp();
    return interaction.reply({ embeds: [embed] });
  }
};
