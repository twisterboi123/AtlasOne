import { SlashCommandBuilder } from 'discord.js';
import { isOwner } from '../utils/owner.js';
import { setCustomStatus, setPresenceStatus, setCustomActivity } from '../utils/presence.js';

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Bot profile settings (owner only)')
    .addSubcommand(s=>s.setName('setname').setDescription('Set bot username').addStringOption(o=>o.setName('name').setDescription('New username').setRequired(true)))
    .addSubcommand(s=>s.setName('setavatar').setDescription('Set bot avatar from image URL').addStringOption(o=>o.setName('url').setDescription('Image URL (png/jpg)').setRequired(true)))
    .addSubcommand(s=>s.setName('status').setDescription('Set bot presence status')
      .addStringOption(o=>o.setName('state').setDescription('online/idle/dnd/invisible').setRequired(true)
        .addChoices(
          { name: 'online (green)', value: 'online' },
          { name: 'idle (yellow)', value: 'idle' },
          { name: 'dnd (red)', value: 'dnd' },
          { name: 'invisible (grey)', value: 'invisible' }
        )))
    .addSubcommand(s=>s.setName('activity').setDescription('Set custom activity text')
      .addStringOption(o=>o.setName('type').setDescription('Activity type').setRequired(true)
        .addChoices(
          { name: 'Playing', value: 'playing' },
          { name: 'Listening', value: 'listening' },
          { name: 'Watching', value: 'watching' },
          { name: 'Streaming (purple LIVE)', value: 'streaming' }
        ))
      .addStringOption(o=>o.setName('text').setDescription('Activity text').setRequired(true))
      .addStringOption(o=>o.setName('url').setDescription('Streaming URL (Twitch/YouTube, required if streaming)')))
    .addSubcommand(s=>s.setName('clearactivity').setDescription('Clear custom activity'))
    .addSubcommand(s=>s.setName('setstatus').setDescription('Set rotating status text').addStringOption(o=>o.setName('text').setDescription('Custom status text').setRequired(true)))
    .addSubcommand(s=>s.setName('clearstatus').setDescription('Clear rotating status text')),
  async execute(interaction, client){
    if(!isOwner(interaction.user.id)){
      return interaction.reply({ content: 'Owner only. Set BOT_OWNER_ID env var.', flags: 64 });
    }
    const sub = interaction.options.getSubcommand();
    if(sub === 'setname'){
      const name = interaction.options.getString('name');
      try {
        await client.user.setUsername(name);
        return interaction.reply({ content: `Username updated to ${name}.`, flags: 64 });
      } catch(e){
        return interaction.reply({ content: `Failed: ${e.message}`, flags: 64 });
      }
    }
    if(sub === 'setavatar'){
      const url = interaction.options.getString('url');
      try {
        const res = await fetch(url);
        if(!res.ok) throw new Error('Could not fetch image');
        const ab = await res.arrayBuffer();
        const buf = Buffer.from(ab);
        await client.user.setAvatar(buf);
        return interaction.reply({ content: 'Avatar updated.', flags: 64 });
      } catch(e){
        return interaction.reply({ content: `Failed: ${e.message}`, flags: 64 });
      }
    }
    if(sub === 'status'){
      const state = interaction.options.getString('state');
      setPresenceStatus(client, state);
      return interaction.reply({ content: `Status set to ${state}.`, flags: 64 });
    }
    if(sub === 'activity'){
      const type = interaction.options.getString('type');
      const text = interaction.options.getString('text');
      const url = interaction.options.getString('url');
      if(type === 'streaming' && !url){
        return interaction.reply({ content: 'Streaming requires a valid Twitch or YouTube URL.', flags: 64 });
      }
      setCustomActivity(client, type, text, url);
      return interaction.reply({ content: 'Activity updated.', flags: 64 });
    }
    if(sub === 'clearactivity'){
      setCustomActivity(client, 'playing', '/help for commands');
      return interaction.reply({ content: 'Custom activity cleared.', flags: 64 });
    }
    if(sub === 'setstatus'){
      const text = interaction.options.getString('text');
      setCustomStatus(client, text);
      return interaction.reply({ content: 'Custom status set.', flags: 64 });
    }
    if(sub === 'clearstatus'){
      setCustomStatus(client, undefined);
      return interaction.reply({ content: 'Custom status cleared.', flags: 64 });
    }
  }
};
