import { SlashCommandBuilder } from 'discord.js';
import { readJSON, writeJSON } from '../utils/jsonStore.js';
import { parseDuration, formatDuration } from '../utils/timeParser.js';
import { log } from '../utils/logger.js';
import { scheduleReminder } from '../index.js';

export default {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set or manage reminders')
    .addSubcommand(sub=>sub
      .setName('set')
      .setDescription('Set a reminder')
      .addStringOption(o=>o.setName('message').setDescription('Reminder text').setRequired(true))
      .addStringOption(o=>o.setName('time').setDescription('Time e.g. 10m,2h').setRequired(true)))
    .addSubcommand(sub=>sub
      .setName('list')
      .setDescription('List your reminders'))
    .addSubcommand(sub=>sub
      .setName('cancel')
      .setDescription('Cancel a reminder by id')
      .addIntegerOption(o=>o.setName('id').setDescription('Reminder id').setRequired(true))),
  async execute(interaction){
    const sub = interaction.options.getSubcommand();
    let reminders = await readJSON('reminders.json', []);
    if(sub === 'set'){
      const msg = interaction.options.getString('message');
      const timeStr = interaction.options.getString('time');
      const ms = parseDuration(timeStr);
      if(!ms) return interaction.reply({ content: 'Invalid time format.', ephemeral: true });
      const id = reminders.length ? Math.max(...reminders.map(r=>r.id)) + 1 : 1;
      const rem = { id, userId: interaction.user.id, message: msg, time: timeStr, timestampDue: Date.now() + ms };
      reminders.push(rem);
      await writeJSON('reminders.json', reminders);
      scheduleReminder(rem);
      await log('reminder.set', { userId: interaction.user.id, id });
      return interaction.reply({ content: `Reminder set (id ${id}) in ${formatDuration(ms)}.`, ephemeral: true });
    }
    if(sub === 'list'){
      const mine = reminders.filter(r=>r.userId === interaction.user.id);
      if(!mine.length) return interaction.reply({ content: 'No reminders.', ephemeral: true });
      const lines = mine.map(r=>`ID ${r.id}: in ${formatDuration(r.timestampDue - Date.now())} - ${r.message}`);
      return interaction.reply({ content: lines.join('\n'), ephemeral: true });
    }
    if(sub === 'cancel'){
      const id = interaction.options.getInteger('id');
      const rem = reminders.find(r=>r.id === id && r.userId === interaction.user.id);
      if(!rem) return interaction.reply({ content: 'Reminder not found.', ephemeral: true });
      reminders = reminders.filter(r=>r !== rem);
      await writeJSON('reminders.json', reminders);
      await log('reminder.cancel', { userId: interaction.user.id, id });
      return interaction.reply({ content: 'Reminder cancelled.', ephemeral: true });
    }
  }
};
