const { EmbedBuilder} = require("discord.js");

async function dice_info(interaction) {
    const embed = new EmbedBuilder().setDescription(`
    1.每天0点赠送骰子\n
    2.年度接单/下单 600内赠送    10颗\n
      年度接单/下单 3500内赠送   20颗\n
      年度接单/下单 10000内赠送  30颗\n
      年度接单/下单 30000内赠送  40颗\n
      年度接单/下单 30000以上    10颗\n
      荣耀酒家 加赠20颗\n
      (找客服要)\n
    3.每充值10刀获得1颗骰子 (找客服要)\n
    4.全套礼物 每人赠送50颗骰子 (找客服要)\n
    5.宝石兑换 100宝石=>10颗骰子 (找客服要)`)
    .setColor("White");
    await interaction.reply({embeds: [embed], ephemeral: true});

    
}

module.exports = dice_info;