const { EmbedBuilder } = require("discord.js");
const pool = require("../../../database/db-promise");
const { or } = require("sequelize");
async function prizes(interaction) {





  const [all] = await pool.execute("SELECT PRIZES FROM TEAMS WHERE LINE = 1");
  let white = new Map();
  let green = new Map();
  let blue = new Map();
  let orange = new Map();
  let red = new Map();

  const prizesData = all[0].PRIZES;

  // White Map
  if (prizesData.EGG) {
    white.set("EGG", prizesData.EGG);
  }
  white.set("COIN100", prizesData.COIN100);
  white.set("COIN500", prizesData.COIN500);
  white.set("RETURN1", prizesData.RETURN1);
  white.set("CUT1", prizesData.CUT1);
  white.set("MESSAGE", prizesData.MESSAGE);

  // Green Map
  if (prizesData.ROSE) {
    green.set("ROSE", prizesData.ROSE);
  }
  if (prizesData.COUPON5) {
    green.set("COUPON5", prizesData.COUPON5);
  }
  if (prizesData.BEER) {
    green.set("BEER", prizesData.BEER);
  }
  green.set("COIN1000", prizesData.COIN1000);
  green.set("COIN5000", prizesData.COIN5000);
  green.set("CUT2", prizesData.CUT2);
  green.set("RETURN2", prizesData.RETURN2);

  // Blue Map
  if (prizesData.CHRISTMAS2) {
    blue.set("CHRISTMAS2", prizesData.CHRISTMAS2);
  }
  if (prizesData.CHRISTMAS1) {
    blue.set("CHRISTMAS1", prizesData.CHRISTMAS1);
  }
  if (prizesData.COUPON10) {
    blue.set("COUPON10", prizesData.COUPON10);
  }
  if (prizesData.Discord_Nitro) {
    blue.set("Discord_Nitro", prizesData.Discord_Nitro);
  }
  blue.set("CUT3", prizesData.CUT3);
  blue.set("RETURN3", prizesData.RETURN3);
  if (prizesData.SOLO_ORDER) {
    blue.set("SOLO_ORDER", prizesData.SOLO_ORDER);
  }

  // Orange Map
  if (prizesData.NECTAR) {
    orange.set("NECTAR", prizesData.NECTAR);
  }
  if (prizesData.CAKE) {
    orange.set("CAKE", prizesData.CAKE);
  }
  if (prizesData.LHASA) {
    orange.set("LHASA", prizesData.LHASA);
  }
  orange.set("COIN10000", prizesData.COIN10000);
  orange.set("CUT4", prizesData.CUT4);
  orange.set("RETURN4", prizesData.RETURN4);
  if (prizesData.CHECK50) {
    orange.set("CHECK50", prizesData.CHECK50);
  }
  // Red Map
  if (prizesData.TEQUILA) {
    red.set("TEQUILA", prizesData.TEQUILA);
  }
  if (prizesData.FLOWER_WINE) {
    red.set("FLOWER_WINE", prizesData.FLOWER_WINE);
  }
  red.set("CUT5", prizesData.CUT5);
  red.set("RETURN5", prizesData.RETURN5);
  red.set("GEMS300", prizesData.GEMS300);
  if (prizesData.CHECK100) {
    red.set("CHECK100", prizesData.CHECK100);
  }

let translation = new Map();
translation.set("EGG", "🥚 臭鸡蛋");
translation.set("COIN100", "🪙 金币 100枚");
translation.set("COIN500", "🪙 金币 500枚");
translation.set("RETURN1", "📜 1%返利券");
translation.set("CUT1", "📜 1%陪玩分成一周");
translation.set("MESSAGE", "❤️ 温馨信息");

translation.set("ROSE", "🌹 玫瑰");
translation.set("COUPON5", "💸 5刀优惠券");
translation.set("BEER", "🍺 啤酒");
translation.set("COIN1000", "🪙 金币 1000枚");
translation.set("COIN5000", "🪙 金币 5000枚");
translation.set("CUT2", "📜 2%陪玩分成一周");
translation.set("RETURN2", "📜 2%返利券");

translation.set("CHRISTMAS2", "🎁 圣诞礼物第二个");
translation.set("CHRISTMAS1", "🎁 圣诞礼物第一个");
translation.set("COUPON10", "💸 10刀优惠券");
translation.set("Discord_Nitro", "🚀 Discord Nitro会员");
translation.set("CUT3", "📜 3%陪玩分成一周 最高积累8张");
translation.set("RETURN3", "📜 3%返利券");
translation.set("SOLO_ORDER", "🚶‍♀️ 独立下单区一月");

translation.set("NECTAR", "💮 琼华露");
translation.set("CAKE", "🍰 星座蛋糕");
translation.set("LHASA", "🍾 洛桑酒");
translation.set("COIN10000", "🪙 金币 10000枚");
translation.set("CUT4", "📜 4%陪玩分成一周");
translation.set("RETURN4", "📜 4%返利券");
translation.set("CHECK50", "💸 50代金券");

translation.set("TEQUILA", "🍹 龙舌兰");
translation.set("FLOWER_WINE", "🍷 百花酿");
translation.set("CUT5", "📜 5%陪玩分成一周");
translation.set("RETURN5", "📜 5%返利券");
translation.set("GEMS300", "💎 300宝石");
translation.set("CHECK100", "💸 100代金券");


  let white_disp = "\n⚪ **__白色奖品__**\n";
  for (const [key, value] of white) {
    let v = "无限";
    if (value) {
      v = value;
    }
    
    white_disp += `- ${translation.get(key)} (${v})\n`
  }


  let green_disp = "\n🟢 **__绿色奖品__**\n";
  for (const [key, value] of green) {
    let v = "无限";
    if (value) {
      v = value;
    }

    green_disp += `- ${translation.get(key)} (${v})\n`;
  }

  let blue_disp = "\n🔵 **__蓝色奖品__**\n";
  for (const [key, value] of blue) {
    let v = "无限";
    if (value) {
      v = value;
    }

    blue_disp += `- ${translation.get(key)} (${v})\n`;
  }

  let orange_disp = "\n🟠 **__橙色奖品__**\n";
  for (const [key, value] of orange) {
    let v = "无限";
    if (value) {
      v = value;
    }

    orange_disp += `- ${translation.get(key)} (${v})\n`;
  }

   let red_disp = "\n🔴 **__红色奖品__**\n";
   for (const [key, value] of red) {
     let v = "无限";
     if (value) {
        v = value;
     }
     red_disp += `- ${translation.get(key)} (${v})\n`;
   }

  const embed = new EmbedBuilder()
    .setDescription(
      `每有队伍前进5000步,根据内人的步数和道具使用判定贡献值，根据贡献值抽取奖池算节后个人贡献步数归零\n${white_disp}${green_disp}${blue_disp}${orange_disp}${red_disp}

.................................⚪...................🟢.....................🔵................🟠.....................🔴           

        **300步以内**...........**60%**..................**30%**...................**10%**................**0%**......................**0%**

        **600步以内**...........**45%**..................**35%**...................**15%**................**5%**......................**0%**

        **900步以内**...........**40%**..................**30%**...................**20%**................**5%**.....................**1%**

        **1200步以内**..........**35%**..................**25%**...................**20%**................**17%**......................**3%**

        **1200步以上**..........**25%**..................**20%**...................**25%**................**25%**....................**5%**

        `
    )
    .setColor("#FFD700")
    .setTitle(
      "礼物池: 总价值 $4881.6 (未计算金币宝石，返利券，陪玩分成，礼物池有数量计算的礼物抽完即算）"
    );
  await interaction.reply({ embeds: [embed],  });
}

module.exports = prizes;
