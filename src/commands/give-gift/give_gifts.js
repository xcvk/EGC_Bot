const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const pool = require("../../database/db-promise");

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
      type
        .setName("礼物种类")
        .setDescription("选择一件已有的礼物")
        .setRequired(true)
        .addChoices(
          { name: "🥚 臭鸡蛋", value: "🥚 臭鸡蛋" },
          { name: "🌹 玫瑰", value: "🌹 玫瑰" },
          { name: "🍺 啤酒", value: "🍺 啤酒" },
          { name: "💸 5刀优惠券", value: "💸 5刀优惠券" },
          { name: "🦌圣诞小鹿", value: "🦌圣诞小鹿" },
          { name: "🍪姜饼人", value: "🍪姜饼人" },
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
    ),
  async execute(interaction) {
    await interaction.deferReply({});
    const type = interaction.options.getString("礼物种类");
    let player = interaction.options.getString("玩家");
    player = player.substring(2, player.length - 1);

    const gifts = new Set([
      "🥚 臭鸡蛋",
      "🌹 玫瑰",
      "🍺 啤酒",
      "💸 5刀优惠券",
      "🦌圣诞小鹿",
      "🍪姜饼人",
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

    const [inventory] = await pool.execute(`SELECT PRIZES FROM PLAYER WHERE ID = ?`, [interaction.user.id]);
    if (!gifts.has(type) || !inventory[0].PRIZES.includes(type)) {
      const embed = new EmbedBuilder()
        .setDescription(`这种${type}礼物不存在,没有或者不允许赠送，请再选择另外一种礼物吧！`)
        .setColor("Red")
        .setAuthor({
          name: `${interaction.user.username}`,
          iconURL: `${interaction.user.avatarURL()}`,
        });
      await interaction.editReply({ embeds: [embed] });
      return;
    }


    if (inventory[0].PRIZES.includes(type)) {
      const [victim] = await pool.execute(`SELECT PRIZES FROM PLAYER WHERE ID = ?`, [player]);
      if (victim.length === 0) {
        const existant = new EmbedBuilder()
          .setDescription(`这个玩家<@${player}>不存在或者没注册，请看看有没有打错字`)
          .setColor("Red")
          .setAuthor({
            name: `${interaction.user.username}`,
            iconURL: `${interaction.user.avatarURL()}`,
          });
        await interaction.editReply({ embeds: [existant] });
        return;
      }

      const [rich] = await pool.execute("SELECT PRIZES FROM PLAYER WHERE ID = ?", [interaction.user.id]);

      // Add the new element to the array
      await pool.execute(
        `UPDATE PLAYER
        SET PRIZES = JSON_ARRAY_APPEND(IFNULL(PRIZES, '[]'), '$', ?)
        WHERE ID = ?;`,
        [type, player]
      );

      // Remove the element from the array
      const indexToRemove = rich[0].PRIZES.indexOf(type);
      rich[0].PRIZES.splice(indexToRemove, 1);

      // Update the database with the updated array
      await pool.execute(
        'UPDATE PLAYER SET PRIZES = ? WHERE ID = ?',
        [JSON.stringify(rich[0].PRIZES), interaction.user.id]
      );
      const sucess = new EmbedBuilder()
        .setDescription(`已成功将${type}赠给了<@${player}>`)
        .setColor("Green")
        .setAuthor({
          name: `${interaction.user.username}`,
          iconURL: `${interaction.user.avatarURL()}`,
        });
      await interaction.editReply({ embeds: [sucess] });
      return;
    }
  },
};