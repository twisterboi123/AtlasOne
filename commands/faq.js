import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { readJSON, writeJSON } from '../utils/jsonStore.js';
import { log } from '../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('faq')
    .setDescription('Manage or view FAQs')
    .addSubcommand(sub=>sub
      .setName('add')
      .setDescription('Add an FAQ entry')
      .addStringOption(o=>o.setName('question').setDescription('Question').setRequired(true))
      .addStringOption(o=>o.setName('answer').setDescription('Answer').setRequired(true)))
    .addSubcommand(sub=>sub
      .setName('list')
      .setDescription('List all FAQs'))
    .addSubcommand(sub=>sub
      .setName('get')
      .setDescription('Search FAQ by query')
      .addStringOption(o=>o.setName('query').setDescription('Search text').setRequired(true))),
  async execute(interaction){
    const sub = interaction.options.getSubcommand();
    const faqs = await readJSON('faq.json', []);
    if(sub === 'add'){
      if(!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)){
        return interaction.reply({ content: 'You need Manage Guild to add FAQs.', ephemeral: true });
      }
      const question = interaction.options.getString('question');
      const answer = interaction.options.getString('answer');
      faqs.push({ id: faqs.length+1, question, answer });
      await writeJSON('faq.json', faqs);
      await log('faq.add', { userId: interaction.user.id, question });
      return interaction.reply({ content: 'FAQ added.', ephemeral: true });
    }
    if(sub === 'list'){
      if(!faqs.length) return interaction.reply({ content: 'No FAQs yet.', ephemeral: true });
      const embed = new EmbedBuilder().setTitle('FAQs').setColor(0x5865F2);
      for(const f of faqs){
        embed.addFields({ name: `${f.id}. ${f.question}`, value: f.answer });
      }
      return interaction.reply({ embeds:[embed] });
    }
    if(sub === 'get'){
      const q = interaction.options.getString('query').toLowerCase();
      const found = faqs.find(f=>f.question.toLowerCase().includes(q));
      if(!found) return interaction.reply({ content: 'No match found.', ephemeral: true });
      return interaction.reply({ embeds:[ new EmbedBuilder().setTitle(found.question).setDescription(found.answer).setColor(0x5865F2) ] });
    }
  }
};
