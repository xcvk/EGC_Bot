const {ActionRowBuilder,ButtonBuilder, ButtonStyle} = require('discord.js');




function make_items() {
    const items = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
           .setDisabled(true)
           .setLabel('物品指令')
           .setCustomId('物品指令')
           .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
            .setCustomId('道具')
            .setLabel('我的道具')
            .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
            .setCustomId('道具记录')
            .setLabel('道具记录')
            .setStyle(ButtonStyle.Primary),
        );
    return items;
}

module.exports = make_items;