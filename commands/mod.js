import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { readJSON, writeJSON } from '../utils/jsonStore.js';
import { parseDuration, formatDuration } from '../utils/timeParser.js';
import { log } from '../utils/logger.js';

export default {
  data: new SlashCommandBuilder().setName('mod').setDescription('Moderation tools')
    .addSubcommand(sub=>sub.setName('warn').setDescription('Warn a user')
      .addUserOption(o=>o.setName('user').setDescription('Target user').setRequired(true))
      .addStringOption(o=>o.setName('reason').setDescription('Reason').setRequired(true)))
    .addSubcommand(sub=>sub.setName('warnings').setDescription('List user warnings')
      .addUserOption(o=>o.setName('user').setDescription('Target user').setRequired(true)))
    .addSubcommand(sub=>sub.setName('clearwarnings').setDescription('Clear warnings for user')
      .addUserOption(o=>o.setName('user').setDescription('Target user').setRequired(true)))
    .addSubcommand(sub=>sub.setName('timeout').setDescription('Timeout a user')
      .addUserOption(o=>o.setName('user').setDescription('Target user').setRequired(true))
      .addStringOption(o=>o.setName('duration').setDescription('Duration e.g. 10m').setRequired(true))
      .addStringOption(o=>o.setName('reason').setDescription('Reason').setRequired(true)))
    .addSubcommand(sub=>sub.setName('purge').setDescription('Delete recent messages')
      .addIntegerOption(o=>o.setName('amount').setDescription('Amount 1-100').setRequired(true))),
  async execute(interaction){
    if(!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)){
      return interaction.reply({ content: 'Manage Guild permission required.', ephemeral: true });
    }
    const sub = interaction.options.getSubcommand();
    if(sub === 'warn'){
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');
      const warnings = await readJSON('warnings.json', {});
      if(!warnings[user.id]) warnings[user.id] = [];
      warnings[user.id].push({ moderatorId: interaction.user.id, reason, timestamp: Date.now() });
      await writeJSON('warnings.json', warnings);
      await log('mod.warn', { userId: user.id, moderatorId: interaction.user.id, reason });
      return interaction.reply({ content: `Warned ${user.tag}.`, ephemeral: true });
    }
    if(sub === 'warnings'){
      const user = interaction.options.getUser('user');
      const warnings = await readJSON('warnings.json', {});
      const list = warnings[user.id] || [];
      if(!list.length) return interaction.reply({ content: 'No warnings.', ephemeral: true });
      const lines = list.map((w,i)=>`${i+1}. ${w.reason} (<@${w.moderatorId}> <t:${Math.floor(w.timestamp/1000)}:R>)`);
      return interaction.reply({ content: lines.join('\n'), ephemeral: true });
    }
    if(sub === 'clearwarnings'){
      const user = interaction.options.getUser('user');
      const warnings = await readJSON('warnings.json', {});
      warnings[user.id] = [];
      await writeJSON('warnings.json', warnings);
      await log('mod.clearwarnings', { userId: user.id, moderatorId: interaction.user.id });
      return interaction.reply({ content: 'Warnings cleared.', ephemeral: true });
    }
    if(sub === 'timeout'){
      const user = interaction.options.getUser('user');
      const member = await interaction.guild.members.fetch(user.id).catch(()=>null);
      if(!member) return interaction.reply({ content: 'Member not found.', ephemeral: true });
      const durationStr = interaction.options.getString('duration');
      const reason = interaction.options.getString('reason');
      const ms = parseDuration(durationStr);
      if(!ms) return interaction.reply({ content: 'Invalid duration.', ephemeral: true });
      try {
        await member.timeout(ms, reason);
      } catch(e){ return interaction.reply({ content: 'Failed to timeout user.', ephemeral: true }); }
      await log('mod.timeout', { userId: user.id, moderatorId: interaction.user.id, duration: ms, reason });
      return interaction.reply({ content: `Timed out ${user.tag} for ${formatDuration(ms)}.`, ephemeral: true });
    }
    if(sub === 'purge'){
      const amount = interaction.options.getInteger('amount');
      if(amount < 1 || amount > 100) return interaction.reply({ content: 'Amount must be 1-100.', ephemeral: true });
      const channel = interaction.channel;
      try {
        await channel.bulkDelete(amount, true);
      } catch(e){ return interaction.reply({ content: 'Failed to delete messages.', ephemeral: true }); }
      await log('mod.purge', { moderatorId: interaction.user.id, amount });
      return interaction.reply({ content: `Deleted ${amount} messages.`, ephemeral: true });
    }
  }
};
