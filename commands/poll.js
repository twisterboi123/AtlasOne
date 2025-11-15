import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { readJSON, writeJSON } from '../utils/jsonStore.js';
import { log } from '../utils/logger.js';

function buildButtons(poll){
  const row = new ActionRowBuilder();
  poll.options.forEach((opt, idx)=>{
    row.addComponents(new ButtonBuilder().setCustomId(`poll_vote_${poll.id}_${idx}`).setLabel(opt).setStyle(ButtonStyle.Primary));
  });
  return [row];
}

export default {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create or manage polls')
    .addSubcommand(sub=>sub
      .setName('create')
      .setDescription('Create a poll')
      .addStringOption(o=>o.setName('question').setDescription('Poll question').setRequired(true))
      .addStringOption(o=>o.setName('options').setDescription('Comma-separated options').setRequired(true)))
    .addSubcommand(sub=>sub
      .setName('close')
      .setDescription('Close a poll by id')
      .addIntegerOption(o=>o.setName('id').setDescription('Poll id').setRequired(true))),
  async execute(interaction){
    const sub = interaction.options.getSubcommand();
    let polls = await readJSON('polls.json', []);
    if(sub === 'create'){
      const question = interaction.options.getString('question');
      const optionsStr = interaction.options.getString('options');
      const opts = optionsStr.split(',').map(s=>s.trim()).filter(Boolean);
      if(opts.length < 2 || opts.length > 10) return interaction.reply({ content: 'Provide 2-10 options.', ephemeral: true });
      const id = polls.length ? Math.max(...polls.map(p=>p.id)) + 1 : 1;
      const poll = { id, question, options: opts, creatorId: interaction.user.id, votes: {}, closed:false };
      polls.push(poll);
      await writeJSON('polls.json', polls);
      await interaction.reply({ content: `Poll #${id} created.` });
      await interaction.channel.send({ content: `Poll #${id}: **${question}**`, components: buildButtons(poll) });
      await log('poll.create', { pollId: id, userId: interaction.user.id });
      return;
    }
    if(sub === 'close'){
      const id = interaction.options.getInteger('id');
      const poll = polls.find(p=>p.id === id);
      if(!poll) return interaction.reply({ content: 'Poll not found.', ephemeral: true });
      if(poll.closed) return interaction.reply({ content: 'Already closed.', ephemeral: true });
      poll.closed = true;
      await writeJSON('polls.json', polls);
      const counts = {};
      for(const uid in poll.votes){
        const idx = poll.votes[uid];
        counts[idx] = (counts[idx]||0)+1;
      }
      const lines = poll.options.map((o,i)=>`Option ${i+1} (${o}): ${counts[i]||0} votes`);
      await interaction.reply({ content: `Results for poll #${id}:\n${lines.join('\n')}` });
      await log('poll.close', { pollId: id, userId: interaction.user.id });
      return;
    }
  }
};
