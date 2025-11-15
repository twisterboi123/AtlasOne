import { SlashCommandBuilder } from 'discord.js';
import { readJSON, writeJSON } from '../utils/jsonStore.js';
import { log } from '../utils/logger.js';

export default {
  data: new SlashCommandBuilder().setName('auto').setDescription('Auto-responder config')
    .addSubcommand(sub=>sub.setName('add').setDescription('Add auto-response')
      .addStringOption(o=>o.setName('trigger').setDescription('Trigger text').setRequired(true))
      .addStringOption(o=>o.setName('response').setDescription('Response text').setRequired(true)))
    .addSubcommand(sub=>sub.setName('list').setDescription('List auto-responses'))
    .addSubcommand(sub=>sub.setName('remove').setDescription('Remove auto-response by trigger')
      .addStringOption(o=>o.setName('trigger').setDescription('Trigger text').setRequired(true))),
  async execute(interaction){
    const sub = interaction.options.getSubcommand();
    let entries = await readJSON('autoresponses.json', []);
    if(sub === 'add'){
      const trigger = interaction.options.getString('trigger');
      const response = interaction.options.getString('response');
      if(entries.find(e=>e.trigger.toLowerCase() === trigger.toLowerCase())){
        return interaction.reply({ content: 'Trigger already exists.', flags: 64 });
      }
      entries.push({ trigger, response });
      await writeJSON('autoresponses.json', entries);
      await log('auto.add', { userId: interaction.user.id, trigger });
      return interaction.reply({ content: 'Auto-response added.', flags: 64 });
    }
    if(sub === 'list'){
      if(!entries.length) return interaction.reply({ content: 'No auto-responses.', flags: 64 });
      const lines = entries.map(e=>`Trigger: ${e.trigger} => ${e.response}`);
      return interaction.reply({ content: lines.join('\n'), flags: 64 });
    }
    if(sub === 'remove'){
      const trigger = interaction.options.getString('trigger');
      const before = entries.length;
      entries = entries.filter(e=>e.trigger.toLowerCase() !== trigger.toLowerCase());
      if(entries.length === before) return interaction.reply({ content: 'Trigger not found.', flags: 64 });
      await writeJSON('autoresponses.json', entries);
      await log('auto.remove', { userId: interaction.user.id, trigger });
      return interaction.reply({ content: 'Auto-response removed.', flags: 64 });
    }
  }
};
