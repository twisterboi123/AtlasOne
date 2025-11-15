import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('channel').setDescription('Channel info')
    .addSubcommand(sub=>sub.setName('info').setDescription('Show channel info').addChannelOption(o=>o.setName('channel').setDescription('Target channel').setRequired(true))),
  async execute(interaction){
    const sub = interaction.options.getSubcommand();
    if(sub === 'info'){
      const channel = interaction.options.getChannel('channel');
      const typeMap = {
        [ChannelType.GuildText]: 'Text',
        [ChannelType.GuildVoice]: 'Voice',
        [ChannelType.GuildCategory]: 'Category',
        [ChannelType.GuildAnnouncement]: 'Announcement',
        [ChannelType.PublicThread]: 'Public Thread',
        [ChannelType.PrivateThread]: 'Private Thread'
      };
      const embed = new EmbedBuilder()
        .setTitle(`Channel Info: ${channel.name}`)
        .addFields(
          { name: 'ID', value: channel.id, inline: true },
          { name: 'Type', value: typeMap[channel.type] || String(channel.type), inline: true },
          { name: 'Created', value: `<t:${Math.floor(channel.createdTimestamp/1000)}:R>`, inline: true },
          { name: 'Topic', value: channel.topic || 'None' }
        )
        .setColor(0x5865F2);
      return interaction.reply({ embeds:[embed] });
    }
  }
};
