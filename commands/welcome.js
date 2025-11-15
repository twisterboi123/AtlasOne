import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { readJSON, writeJSON } from '../utils/jsonStore.js';

export default {
  data: new SlashCommandBuilder().setName('welcome').setDescription('Configure welcome message')
    .addSubcommand(sub=>sub.setName('set').setDescription('Set welcome channel & message')
      .addChannelOption(o=>o.setName('channel').setDescription('Welcome channel').setRequired(true))
      .addStringOption(o=>o.setName('message').setDescription('Message (use {user})').setRequired(true))),
  async execute(interaction){
    if(!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)){
      return interaction.reply({ content: 'Manage Guild required.', flags: 64 });
    }
    const sub = interaction.options.getSubcommand();
    if(sub === 'set'){
      const channel = interaction.options.getChannel('channel');
      const message = interaction.options.getString('message');
      const config = await readJSON('config.json', { welcome:{}, goodbye:{} });
      config.welcome = { channelId: channel.id, message };
      await writeJSON('config.json', config);
      return interaction.reply({ content: 'Welcome configuration saved.', flags: 64 });
    }
  }
};
