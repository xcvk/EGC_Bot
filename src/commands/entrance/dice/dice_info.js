const { EmbedBuilder} = require("discord.js");

async function dice_info(interaction) {
    const embed = new EmbedBuilder()
      .setDescription(
        `
1.每天0点赠送骰子

年度接单/下单 600内赠送 10颗

年度接单/下单 3500内赠送 20颗

年度接单/下单 10000内赠送 30颗

年度接单/下单 30000内赠送 40颗

年度接单/下单 30000以上 10颗

本月荣耀酒家 加赠20颗

2.每充值10刀获得1颗骰子 请联系 <@729115193107546165> 领取

3.全套礼物 每人赠送50颗骰子 请联系 <@729115193107546165> 领取

4.宝石兑换 100宝石=>10颗骰子 请联系 <@729115193107546165> 领取
第一条 年度接单/下单 只选取最高发放  不重复发放
荣耀酒加 手动发放`
      )
      .setColor("White");
    await interaction.reply({embeds: [embed]});

    
}

module.exports = dice_info;