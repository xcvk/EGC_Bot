const { SlashCommandBuilder ,
        ComponentType} = require("discord.js");

const make_dice = require('./dice/dice.js');
const make_items = require('./item/item.js');
const make_other = require('./other/other.js');
const make_embed = require('./embed/embeds.js');
const checkValueExist = require('../../database/exist.js');
const insert = require('../../database/insert.js');
const pool = require('../../database/db.js');
module.exports = {
    data: new SlashCommandBuilder()
    .setName('小鹿向前冲')
    .setDescription('向前冲！！'),
    

    
    async execute(interaction)
    {

        if (checkValueExist('player','id',`${interaction.user.username}`, (err, exists) => {
            if (err) {
                console.error('Error in checkValueExist function:', err);
                // Handle the error, possibly return or log it
            }
            console.log(exists);
            return exists;
        }) === false)
        {
            insert(`${interaction.user.username}`);
        }

        const reply = await interaction.reply({embeds: [make_embed(interaction)], components: [make_dice(),make_items(),make_other()], emphemeral: true});
        
        const filter = (i) => i.user.id === interaction.member.id;
        const collector = reply.createMessageComponentCollector({
            ComponentType: ComponentType.Button,
            filter,
        });

        collector.on('collect', (i) => {
            if (i.customId === '单颗使用')
            {
                i.reply('yo');
                return;
            }
        });
        

    },
};