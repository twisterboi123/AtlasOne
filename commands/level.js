import { SlashCommandBuilder } from 'discord.js';
import { readJSON } from '../utils/jsonStore.js';

export default {
  data: new SlashCommandBuilder().setName('level').setDescription('Leveling commands')
    .addSubcommand(sub=>sub.setName('rank').setDescription('Show user rank')
      .addUserOption(o=>o.setName('user').setDescription('Target user').setRequired(false)))
    .addSubcommand(sub=>sub.setName('leaderboard').setDescription('Show top XP users')),
  async execute(interaction){
    const sub = interaction.options.getSubcommand();
    const levels = await readJSON('levels.json', {});
    if(sub === 'rank'){
      const user = interaction.options.getUser('user') || interaction.user;
      const data = levels[user.id] || { xp:0, level:0 };
      return interaction.reply({ content: `${user.tag}: Level ${data.level}, XP ${data.xp}`, ephemeral: false });
    }
    if(sub === 'leaderboard'){
      const entries = Object.entries(levels).map(([id,v])=>({ id, xp:v.xp, level:v.level }));
      entries.sort((a,b)=>b.xp - a.xp);
      const top = entries.slice(0,10);
      if(!top.length) return interaction.reply({ content: 'No data.', flags: 64 });
      const lines = top.map((e,i)=>`#${i+1} <@${e.id}> — L${e.level} (${e.xp} XP)`);
      return interaction.reply({ content: lines.join('\n'), ephemeral: false });
    }
  }
};
