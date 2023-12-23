const { EmbedBuilder} = require("discord.js");

async function dice_info(interaction) {
    const embed = new EmbedBuilder()
      .setDescription(
        `
每充值200刀获得3颗骰子(由<@729115193107546165>添加)
全套礼物赠送者获得20颗骰子
宝石兑换100宝石5颗

每天0点赠送骰子

独家 +5
挂名 +3
v6及以上+5
v13及以上+10`)
    .setColor("White");
    await interaction.reply({embeds: [embed]})
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`,
      });
}

module.exports = dice_info;