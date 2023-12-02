const { SlashCommandBuilder ,
        ComponentType} = require("discord.js");

const make_dice = require('./dice/dice.js');
const make_items = require('./item/item.js');
const make_other = require('./other/other.js');
const make_embed = require('./embed/embeds.js');
const checkValueExist = require('../../database/exist.js');
const insert = require('../../database/insert.js');
const mysql = require('mysql2/promise.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('小鹿向前冲')
    .setDescription('向前冲！！'),
    

    
    async execute(interaction)
    {
        
        checkValueExist('player','id',`${interaction.user.username}`, (err, exists) => {
            console.log(1);
            console.log(exists);
            if (err) {
                console.error('Error in checkValueExist function:', err);
                // Handle the error, possibly return or log it
            } else {
                if (!exists)
                {
                    console.log(2);
                    console.log(exists);
                    insert(`${interaction.user.username}`);
                }
            }
        });
        const embed = await make_embed(interaction);
        console.log(3);
        const reply = await interaction.reply({embeds: [embed], components: [make_dice(),make_items(),make_other()],});
        console.log(4);
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