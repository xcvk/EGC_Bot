const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

const { token } = require('./config.json');

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
  // Your bot's message handling code goes here
  if (message.content === '!ping') {
    message.reply('Pong!');
  }
});

client.login(token);

