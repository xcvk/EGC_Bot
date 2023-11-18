const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('骰子')
    .setDescription('向前冲！！'),
    
    async execute(interaction)
    {
        interaction.reply(interaction.user.username);
    },
};