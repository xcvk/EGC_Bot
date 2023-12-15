const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.on('interactionCreate', async interaction => {
			if (!interaction.isChatInputCommand()) return;
		  
			const command = interaction.client.commands.get(interaction.commandName);
		  
			  if (!command) {
				  console.error(`No command matching ${interaction.commandName} was found.`);
				  return;
			  }
		  
			  try {
				  await command.execute(interaction);
			  } catch (error) {
				  console.error(error);
				  if (interaction.replied || interaction.deferred) {
					  await interaction.followUp({ content: 'There was an error while executing this command!',  });
				  } else {
					  await interaction.reply({ content: 'There was an error while executing this command!',  });
				  }
			  }
			
		  });
	},
};