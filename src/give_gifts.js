const { SlashCommandBuilder, PermissionFlagsBits,EmbedBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("赠送礼物")
    .setDescription("赠予一个玩家礼物")
    .addStringOption((player) =>
      player
      .setName("玩家")
      .setDescription("选择一名玩家")
      .setRequired(true)
    )
    .addStringOption((type) =>
      action
        .setName("礼物种类")
        .setDescription("选择一件已有的礼物")
        .setRequired(true)
        .addChoices(
          { name: "🥚 臭鸡蛋", value: "🥚 臭鸡蛋" },
          { name: "🌹 玫瑰", value: "🌹 玫瑰" },
          { name: "🍺 啤酒", value: "🍺 啤酒" },
          { name: "💸 5刀优惠券", value: "💸 5刀优惠券" },
          { name: "🎁 圣诞礼物第二个", value: "🎁 圣诞礼物第二个" },
          { name: "🎁 圣诞礼物第一个", value: "🎁 圣诞礼物第一个" },
          { name: "💸 10刀优惠券", value: "💸 10刀优惠券" },
          { name: "🚀 Discord Nitro会员", value: "🚀 Discord Nitro会员" },
          { name: "🚶‍♀️ 独立下单区一月", value: "🚶‍♀️ 独立下单区一月" },
          { name: "💮 琼华露", value: "💮 琼华露" },
          { name: "🍰 星座蛋糕", value: "🍰 星座蛋糕" },
          { name: "🍾 洛桑酒", value: "🍾 洛桑酒" },
          { name: "💸 50代金券", value: "💸 50代金券" },
          { name: "🍹 龙舌兰", value: "🍹 龙舌兰" },
          { name: "🍷 百花酿", value: "🍷 百花酿" },
          { name: "💸 100代金券", value: "💸 100代金券" },
        )
    )
    .addIntegerOption((quantity) =>
      quantity
        .setName("数量")
        .setDescription("送多少这品种的礼物")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({});
    const type = interaction.options.getString("礼物种类");
    let player = interaction.options.getString("玩家");
    player = player.substring(2, player.length - 1);
    const quantity = interaction.options.getInteger("数量");

    const gifts = new Set([
        "🥚 臭鸡蛋",
        "🌹 玫瑰",
        "🍺 啤酒",
        "💸 5刀优惠券",
        "🎁 圣诞礼物第二个",
        "🎁 圣诞礼物第一个",
        "💸 10刀优惠券",
        "🚀 Discord Nitro会员",
        "🚶‍♀️ 独立下单区一月",
        "💮 琼华露",
        "🍰 星座蛋糕",
        "🍾 洛桑酒",
        "💸 50代金券",
        "🍹 龙舌兰",
        "🍷 百花酿",
        "💸 100代金券"
      ]);
    
    if (!gifts.has(type)) {
        const embed = new EmbedBuilder()
        .setDescription(`这种${type}礼物不存在或者不允许赠送，请再选择另外一种礼物吧！`)
        .setColor("Red")
        .setAuthor({
            name: `${interaction.user.username}`,
            iconURL: `${interaction.user.avatarURL()}`,
        });
        await interaction.editReply({embeds: [embed]});
        return;
    }
    

  },
};
