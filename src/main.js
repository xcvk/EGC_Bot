const { Client, Events, GatewayIntentBits } = require('discord.js');

const { token } = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});



client.once(Events.ClientReady, client => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
  // Your bot's message handling code goes here
  if (message.content === '!ping') {
    message.reply('Pong!');
  }
});

client.login(token);

