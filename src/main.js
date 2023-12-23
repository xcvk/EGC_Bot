const award = require("./commands/entrance/other/awards");
const fs = require('node:fs');
const path = require('node:path');
const pool = require("././database/db-promise");
const daily = require("./commands/entrance/other/daily");

const {
  Client,
  Collection,
  IntentsBitField
} = require("discord.js");
const { token } = require('./config.json')



const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMembers,
	
  ],
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}


client.on('ready', (c) => {

  
  setInterval(async () => {
    
  const currentDate = new Date();

  // Get the current time
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  

  if (hours === 0 && minutes === 0) {
	  await daily();
  }

  }, 40000);

  let debounced = false;
  setInterval(async () => {
  
	if (!debounced) {
        debounced = true;

        const [blue] = await pool.execute("SELECT BLUE_STEPS FROM TEAMS WHERE LINE = 1");
        const [red] = await pool.execute("SELECT RED_STEPS FROM TEAMS WHERE LINE = 1");

        if (blue[0] && blue[0].BLUE_STEPS >= 5000) {
            await award("蓝", c);
        }

        if (red[0] && red[0].RED_STEPS >= 5000) {
          await award("红", c);
        }

        debounced = false;
    }
  }, 1100);
});



client.login(token);
