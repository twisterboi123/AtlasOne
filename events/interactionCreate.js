import { writeJSON } from '../utils/jsonStore.js';
import { log } from '../utils/logger.js';

export default {
  name: 'interactionCreate',
  async execute(client, interaction){
    if(interaction.isChatInputCommand()){
      const command = client.commands.get(interaction.commandName);
      if(!command) return;
      try {
        await command.execute(interaction, client);
      } catch(e){
        console.error(`Error in command ${interaction.commandName}:`, e);
        const errorMsg = { content: `Error: ${e.message}`, ephemeral: true };
        if(interaction.replied || interaction.deferred){
          interaction.followUp(errorMsg);
        } else {
          interaction.reply(errorMsg);
        }
      }
    } else if(interaction.isButton()){
      const idMatch = interaction.customId.match(/^poll_vote_(\d+)_(\d+)$/);
      if(idMatch){
        const pollId = parseInt(idMatch[1],10);
        const optIndex = parseInt(idMatch[2],10);
        const poll = client.context.polls.find(p=>p.id === pollId);
        if(!poll) return interaction.reply({ content: 'Poll not found.', ephemeral: true });
        if(poll.closed) return interaction.reply({ content: 'Poll closed.', ephemeral: true });
        poll.votes = poll.votes || {};
        poll.votes[interaction.user.id] = optIndex;
        await writeJSON('polls.json', client.context.polls);
        await interaction.reply({ content: `Vote recorded for option ${optIndex+1}.`, ephemeral: true });
        await log('poll.vote', { pollId, userId: interaction.user.id, optionIndex: optIndex });
      }
    }
  }
};
