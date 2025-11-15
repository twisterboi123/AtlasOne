import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('server').setDescription('Server tools')
    .addSubcommand(sub=>sub.setName('stats').setDescription('Show server stats')),
  async execute(interaction){
    const sub = interaction.options.getSubcommand();
    if(sub === 'stats'){
      const g = interaction.guild;
      const embed = new EmbedBuilder()
        .setTitle('Server Stats')
        .addFields(
          { name: 'Name', value: g.name, inline: true },
          { name: 'Members', value: String(g.memberCount), inline: true },
          { name: 'Channels', value: String(g.channels.cache.size), inline: true }
        )
        .setColor(0x5865F2);
      return interaction.reply({ embeds:[embed] });
    }
  }
};
