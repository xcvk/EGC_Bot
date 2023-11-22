const {ActionRowBuilder,ButtonBuilder, ButtonStyle} = require('discord.js');

function make_other() {
    const pool = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
           .setDisabled(true)
           .setLabel('其他指令')
           .setCustomId('其他指令')
           .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
            .setCustomId('兑换')
            .setLabel('兑换')
            .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
            .setCustomId('兑换记录')
            .setLabel('兑换记录')
            .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
            .setCustomId('奖池')
            .setLabel('  奖池  ')
            .setStyle(ButtonStyle.Primary),
        );
    return pool;
}
module.exports = make_other;