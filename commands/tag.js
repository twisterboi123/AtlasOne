import { SlashCommandBuilder } from 'discord.js';
import { readJSON, writeJSON } from '../utils/jsonStore.js';

export default {
  data: new SlashCommandBuilder().setName('tag').setDescription('Tag shortcuts')
    .addSubcommand(sub=>sub.setName('add').setDescription('Add a tag')
      .addStringOption(o=>o.setName('name').setDescription('Tag name').setRequired(true))
      .addStringOption(o=>o.setName('content').setDescription('Tag content').setRequired(true)))
    .addSubcommand(sub=>sub.setName('get').setDescription('Get tag')
      .addStringOption(o=>o.setName('name').setDescription('Tag name').setRequired(true)))
    .addSubcommand(sub=>sub.setName('list').setDescription('List tags'))
    .addSubcommand(sub=>sub.setName('remove').setDescription('Remove tag')
      .addStringOption(o=>o.setName('name').setDescription('Tag name').setRequired(true))),
  async execute(interaction){
    const sub = interaction.options.getSubcommand();
    let tags = await readJSON('tags.json', {});
    if(sub === 'add'){
      const name = interaction.options.getString('name').toLowerCase();
      const content = interaction.options.getString('content');
      if(tags[name]) return interaction.reply({ content: 'Tag exists.', flags: 64 });
      tags[name] = content;
      await writeJSON('tags.json', tags);
      return interaction.reply({ content: 'Tag added.', flags: 64 });
    }
    if(sub === 'get'){
      const name = interaction.options.getString('name').toLowerCase();
      if(!tags[name]) return interaction.reply({ content: 'Tag not found.', flags: 64 });
      return interaction.reply({ content: tags[name], ephemeral: false });
    }
    if(sub === 'list'){
      const names = Object.keys(tags);
      if(!names.length) return interaction.reply({ content: 'No tags.', flags: 64 });
      return interaction.reply({ content: names.join(', '), flags: 64 });
    }
    if(sub === 'remove'){
      const name = interaction.options.getString('name').toLowerCase();
      if(!tags[name]) return interaction.reply({ content: 'Tag not found.', flags: 64 });
      delete tags[name];
      await writeJSON('tags.json', tags);
      return interaction.reply({ content: 'Tag removed.', flags: 64 });
    }
  }
};
