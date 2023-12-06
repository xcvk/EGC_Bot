const { EmbedBuilder } = require("discord.js");
const pool = require("../../../database/db-promise");

async function item_disp(interaction) {
  const [results] = await pool.execute(
    `SELECT OBSTACLE, STUDENT, CANT_PASS, TELEPORTER, MAGNET, BOOTS, SPELL_SHIELD, SWAP,
       EXPLORER, EFFECT_DOUBLE FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${interaction.user.username}的道具`,
      iconURL: `${interaction.user.avatarURL()}`,
    })
    .setColor("Green")
    .addFields(
      {
        name: "🚧__路障__\n-本道具会使对方队伍停滞一次",
        value: `数量:${results[0].OBSTACLE}`,
        inline: true,
      },
      {
        name: "🎓__大学生__\n-向对面队伍随机要取一个道具",
        value: `数量:${results[0].STUDENT}`,
        inline: true,
      },
      {
        name: "❌__此路不通__\n-本道具会使对方队伍倒退1~12步",
        value: `数量:${results[0].CANT_PASS}`,
        inline: true,
      },
      {
        name: "🌀__传送门__\n-使用本道具交换红蓝两队前进步数",
        value: `数量:${results[0].TELEPORTER}`,
        inline: true,
      },
      {
        name: "🧲__磁铁__\n-五分钟内对方队伍获取的道具随机分配给己方队伍队员使用者获得第一个",
        value: `数量:${results[0].MAGNET}`,
        inline: true,
      },
      {
        name: "👟__跑鞋__\n-使用本道具下次扔骰子会将在1~12中随机选",
        value: `数量:${results[0].BOOTS}`,
        inline: true,
      },
      {
        name: "🛡️__无懈可击__\n-使用本道具免疫下次陷阱",
        value: `数量:${results[0].SPELL_SHIELD}`,
        inline: true,
      },
      {
        name: "🔄__交换生__\n-变更所属队伍,如目前为红队的话变更为蓝队,变更后抵达结算点进行结算后,回归原本队伍",
        value: `数量:${results[0].SWAP}`,
        inline: true,
      },
      {
        name: "🔦__探宝专家__\n-本道具下次骰子落地点,必定为奖励道具",
        value: `数量:${results[0].EXPLORER}`,
        inline: true,
      },
      {
        name: "⬆️__双份体验__\n-除传送门和交换生外的道具效果翻倍",
        value: `数量:${results[0].EFFECT_DOUBLE}`,
        inline: true,
      }
    );

  await interaction.editReply({ embeds: [embed] });
}

module.exports = item_disp;
