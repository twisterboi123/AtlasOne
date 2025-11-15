import { SlashCommandBuilder } from 'discord.js';
import { safeEvaluate } from '../utils/mathEvaluator.js';

export default {
  data: new SlashCommandBuilder().setName('math').setDescription('Math utilities')
    .addSubcommand(sub=>sub.setName('evaluate').setDescription('Evaluate expression')
      .addStringOption(o=>o.setName('expression').setDescription('Expression').setRequired(true))),
  async execute(interaction){
    const sub = interaction.options.getSubcommand();
    if(sub === 'evaluate'){
      const expr = interaction.options.getString('expression');
      const { result, error } = safeEvaluate(expr);
      if(error) return interaction.reply({ content: `Error: ${error}`, flags: 64 });
      return interaction.reply({ content: `${expr} = ${result}`, ephemeral: false });
    }
  }
};
