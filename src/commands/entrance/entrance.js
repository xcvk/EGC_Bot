const { SlashCommandBuilder ,
        ActionRowBuilder,
        ButtonBuilder,
        ButtonStyle,
        EmbedBuilder} = require("discord.js");

const make_dice = require('./dice/dice.js');
const make_items = require('./item/item.js');
const make_other = require('./other/other.js');
const make_embed = require('./embed/embeds.js');
module.exports = {
    data: new SlashCommandBuilder()
    .setName('小鹿向前冲')
    .setDescription('向前冲！！'),
    

    
    async execute(interaction)
    {

        await interaction.reply({embeds: [make_embed(interaction)], components: [make_dice(),make_items(),make_other()], emphemeral: true});
    },
};