const {EmbedBuilder} = require('discord.js');

function make_embed(interaction) {

    const embed = new EmbedBuilder()
    .setTitle('你的小鹿在这')
    .setDescription(`嘿， 亲爱的 ${interaction.user.username} 我们冲吧！！`)
    .addFields(
        {name: '骰子', value: '5',inline: true,},
        {name: '步数', value: '14',inline: true,},
        {name: '队伍', value: '蓝',inline: true}
    )
    .setColor('Random')
    .setAuthor({name: `${interaction.user.username}`,});
    return embed;


}

module.exports = make_embed;