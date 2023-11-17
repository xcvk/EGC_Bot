const {Client, IntentsBitField,EmbedBuilder } = require('discord.js');
const { token } = require('./config.json')
const client = new Client ({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMembers,
  ],
});

client.on('ready', (c) => {
  console.log(`${c.user.tag}`);
});

client.on('interactionCreate', (interaction) => {
  if (interaction.isChatInputCommand())
  {
    if (interaction.commandName === '骰子')
    {

    }

    if (interaction.commandName === '礼物池')
    {

    }

    if (interaction.commandName === '道具')
    {

    }
  }
});

client.login(token);