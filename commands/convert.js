import { SlashCommandBuilder } from 'discord.js';
import { convertUnits } from '../utils/unitConverter.js';

export default {
  data: new SlashCommandBuilder().setName('convert').setDescription('Unit conversion')
    .addSubcommand(sub=>sub.setName('units').setDescription('Convert units')
      .addNumberOption(o=>o.setName('value').setDescription('Numeric value').setRequired(true))
      .addStringOption(o=>o.setName('from').setDescription('From unit').setRequired(true))
      .addStringOption(o=>o.setName('to').setDescription('To unit').setRequired(true))),
  async execute(interaction){
    const sub = interaction.options.getSubcommand();
    if(sub === 'units'){
      const value = interaction.options.getNumber('value');
      const from = interaction.options.getString('from');
      const to = interaction.options.getString('to');
      const { result, error } = convertUnits(value, from, to);
      if(error) return interaction.reply({ content: `Error: ${error}`, ephemeral: true });
      return interaction.reply({ content: `${value} ${from} = ${result} ${to}`, ephemeral: false });
    }
  }
};
