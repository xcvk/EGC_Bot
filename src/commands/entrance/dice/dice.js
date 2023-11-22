const {ActionRowBuilder,ButtonBuilder, ButtonStyle} = require('discord.js');




function make_dice() {
    const dice = new ActionRowBuilder()
    .addComponents(
       new ButtonBuilder()
       .setDisabled(true)
       .setLabel('骰子指令')
       .setCustomId('骰子指令')
       .setStyle(ButtonStyle.Primary),
       new ButtonBuilder()
        .setCustomId('批量使用')
        .setLabel('批量使用')
        .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
        .setCustomId('单颗使用')
        .setLabel('单颗使用')
        .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
        .setCustomId('获取方法')
        .setLabel('获取方法')
        .setStyle(ButtonStyle.Primary),);
    return dice;
}

module.exports = make_dice;