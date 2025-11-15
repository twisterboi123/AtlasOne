import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('role').setDescription('Role info')
    .addSubcommand(sub=>sub.setName('info').setDescription('Show role info').addRoleOption(o=>o.setName('role').setDescription('Target role').setRequired(true))),
  async execute(interaction){
    const sub = interaction.options.getSubcommand();
    if(sub === 'info'){
      const role = interaction.options.getRole('role');
      const embed = new EmbedBuilder()
        .setTitle(`Role Info: ${role.name}`)
        .addFields(
          { name: 'ID', value: role.id, inline: true },
          { name: 'Color', value: role.color ? `#${role.color.toString(16)}` : 'None', inline: true },
          { name: 'Members', value: String(role.members.size), inline: true },
          { name: 'Created', value: `<t:${Math.floor(role.createdTimestamp/1000)}:R>`, inline: true }
        )
        .setColor(role.color || 0x5865F2);
      return interaction.reply({ embeds:[embed] });
    }
  }
};
