import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { parseHex } from '../utils/colorUtils.js';

export default {
  data: new SlashCommandBuilder().setName('color').setDescription('Color info')
    .addSubcommand(sub=>sub.setName('info').setDescription('Get color info')
      .addStringOption(o=>o.setName('hex').setDescription('Hex color e.g. #ff0000').setRequired(true))),
  async execute(interaction){
    const sub = interaction.options.getSubcommand();
    if(sub === 'info'){
      let hex = interaction.options.getString('hex');
      const parsed = parseHex(hex);
      if(!parsed) return interaction.reply({ content: 'Invalid hex format.', ephemeral: true });
      const { r,g,b, decimal } = parsed;
      const embed = new EmbedBuilder()
        .setTitle(`#${hex.replace(/^#/,'').toUpperCase()}`)
        .setDescription(`RGB(${r}, ${g}, ${b})\nDecimal: ${decimal}`)
        .setColor(decimal);
      return interaction.reply({ embeds:[embed] });
    }
  }
};
