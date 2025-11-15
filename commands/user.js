import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('user').setDescription('User info')
    .addSubcommand(sub=>sub.setName('info').setDescription('Show user info').addUserOption(o=>o.setName('target').setDescription('Target user').setRequired(true))),
  async execute(interaction){
    const sub = interaction.options.getSubcommand();
    if(sub === 'info'){
      const user = interaction.options.getUser('target');
      const member = await interaction.guild.members.fetch(user.id).catch(()=>null);
      const embed = new EmbedBuilder()
        .setTitle(`User Info: ${user.tag}`)
        .addFields(
          { name: 'ID', value: user.id, inline: true },
          { name: 'Created', value: `<t:${Math.floor(user.createdTimestamp/1000)}:R>`, inline: true },
          { name: 'Joined', value: member ? `<t:${Math.floor(member.joinedTimestamp/1000)}:R>` : 'N/A', inline: true }
        )
        .setColor(0x5865F2);
      return interaction.reply({ embeds:[embed], ephemeral: false });
    }
  }
};
