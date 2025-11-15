import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),
  async execute(interaction){
    const embed = new EmbedBuilder()
      .setTitle('🤖 AtlasOne Bot Commands')
      .setColor(0x5865F2)
      .setDescription('Here are all available commands:')
      .addFields(
        { name: '📚 FAQ System', value: '`/faq add` `/faq list` `/faq get`', inline: false },
        { name: '⏰ Reminders', value: '`/remind set` `/remind list` `/remind cancel`', inline: false },
        { name: '📊 Polls', value: '`/poll create` `/poll close`', inline: false },
        { name: 'ℹ️ Server Info', value: '`/server stats` `/user info` `/role info` `/channel info`', inline: false },
        { name: '🛡️ Moderation', value: '`/mod warn` `/mod warnings` `/mod clearwarnings` `/mod timeout` `/mod purge`', inline: false },
        { name: '🤖 Auto-Responder', value: '`/auto add` `/auto list` `/auto remove`', inline: false },
        { name: '👋 Welcome/Goodbye', value: '`/welcome set` `/goodbye set`', inline: false },
        { name: '⭐ Leveling', value: '`/level rank` `/level leaderboard`', inline: false },
        { name: '🏷️ Tags', value: '`/tag add` `/tag get` `/tag list` `/tag remove`', inline: false },
        { name: '🔧 Utilities', value: '`/math evaluate` `/convert units` `/color info`', inline: false }
      )
      .setFooter({ text: 'AtlasOne Bot • Made with Discord.js v14' })
      .setTimestamp();
    
    return interaction.reply({ embeds: [embed], flags: 64 });
  }
};
