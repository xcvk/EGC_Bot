const {Client, IntentsBitField } = require('discord.js');
const { token } = require('./config.json')
const client = new Client ({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
  ],
})

client.login(token);