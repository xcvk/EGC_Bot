const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require("discord.js");

const pool = require("../../../database/db-promise");
const item_disp = require("./item_disp");

async function action(origin,interaction) {
    let [results] = await pool.execute(
      `SELECT SWAP, TEAM FROM PLAYER WHERE id = ?`,
      [interaction.user.id]
    );

    if (results[0].SWAP[0] <= 0) {
      const insufficent = new EmbedBuilder()
        .setDescription("交换生道具不足")
        .setColor("Red");
      await origin.followUp({ embeds: [insufficent], ephemeral: true });
      return;
    }

    try {
        const collected = await message.channel.awaitMessages({
          filter,
          max: 1,
          time: 10000,
          errors: ["time"],
        });

        if (collected.first().content === "随机") {
            if (results[0].TEAM === "红") {
                await pool.execute(
                  `UPDATE PLAYER SET TEAM = 蓝 WHERE id = ?`,
                  [interaction.user.id]
                );
                if (results[0].SWAP[1] === 0) {
                    await pool.execute(
                      `UPDATE PLAYER
                        SET SWAP = JSON_SET(SWAP, '$[1]', 红)
                        WHERE ID = ?;`,
                      [interaction.user.id]
                    );
                }

                const [members] = await pool.execute(
                  `SELECT BLUE_MEMBERS FROM TEAM WHERE LINE = 1`);

                const unlucky = members[0].BLUE_MEMBERS[Math.floor(Math.random() * members[0].BLUE_MEMBERS.length)];
                const [check] = await pool.execute(
                  `SELECT JSON_UNQUOTE(JSON_EXTRACT(BUFFS, '$.SPELL_SHIELD')) AS SPELL_SHIELD FROM TEAMS WHERE ID = ?`,
                  [unlucky]
                );
                if (check[0].SPELL_SHIELD > 0) {
                    await pool.execute(
                      `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.SPELL_SHIELD', ${
                        check[0].SPELL_SHIELD - 1
                      }) WHERE ID = ?;`,
                      [unlucky]
                    );
                    const canceled = new EmbedBuilder()
                    .setDescription(`交换生已被<@${unlucky}>格挡了`)
                    .setColor("Red");
                    await interaction.followUp({embeds:[canceled]});
                } else {
                    await pool.execute(
                      `UPDATE PLAYER SET TEAM = 红 WHERE id = ?`,
                      [unlucky]
                    );
                    const accept = new EmbedBuilder()
                      .setDescription(`已成功和<@${unlucky}>交换了队伍！`)
                      .setColor("Green");
                    await interaction.followUp({ embeds: [accept] });
                    return;
                }
            } else {
                await pool.execute(`UPDATE PLAYER SET TEAM = 蓝 WHERE id = ?`, [
                  interaction.user.id,
                ]);
                if (results[0].SWAP[1] === 0) {
                  await pool.execute(
                    `UPDATE PLAYER
                        SET SWAP = JSON_SET(SWAP, '$[1]', 蓝)
                        WHERE ID = ?;`,
                    [interaction.user.id]
                  );
                }

                const [members] = await pool.execute(
                  `SELECT RED_MEMBERS FROM TEAM WHERE LINE = 1`
                );

                const unlucky =
                  members[0].RED_MEMBERS[
                    Math.floor(Math.random() * members[0].RED_MEMBERS.length)
                  ];
                const [check] = await pool.execute(
                  `SELECT JSON_UNQUOTE(JSON_EXTRACT(BUFFS, '$.SPELL_SHIELD')) AS SPELL_SHIELD FROM TEAMS WHERE ID = ?`,
                  [unlucky]
                );
                if (check[0].SPELL_SHIELD > 0) {
                  await pool.execute(
                    `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.SPELL_SHIELD', ${
                      check[0].SPELL_SHIELD - 1
                    }) WHERE ID = ?;`,
                    [unlucky]
                  );
                  const canceled = new EmbedBuilder()
                    .setDescription(`交换生已被<@${unlucky}>格挡了`)
                    .setColor("Red");
                  await interaction.followUp({ embeds: [canceled] });
                } else {
                  await pool.execute(
                    `UPDATE PLAYER SET TEAM = 红 WHERE id = ?`,
                    [unlucky]
                  );
                  const accept = new EmbedBuilder()
                    .setDescription(`已成功和<@${unlucky}>交换了队伍！`)
                    .setColor("Green");
                  await interaction.followUp({ embeds: [accept] });
                }
            }

        } else {

        }








        await pool.execute(
          `UPDATE PLAYER
            SET SWAP = JSON_SET(SWAP, '$[0]', ${results[0].SWAP[0] - 1})
            WHERE ID = ?;`,
          [interaction.user.id]
        );
    } catch (error) {
        const embed = new EmbedBuilder().setDescription("操作已超时").setColor("Yellow");
        await origin.editReply({embeds: [embed]})
    }
    
}

async function make_swap(origin, interaction) {
  let [results] = await pool.execute(
    `SELECT SWAP, TEAM FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].SWAP[0] <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("交换生道具不足")
      .setColor("Red");
    await interaction.reply({ embeds: [insufficent], ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });
  const embed = new EmbedBuilder()
    .setDescription(
      "确定要使用🔄__交换生__\n本道具会使30秒内对方获取的道具分配给己方队伍成员,使用者获得第一个"
    )
    .setColor("Yellow");

  const Buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("确认")
      .setLabel("确认")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("取消")
      .setLabel("取消")
      .setStyle(ButtonStyle.Danger)
  );

  const reply = await interaction.editReply({
    embeds: [embed],
    components: [Buttons],
    ephemeral: true,
  });

  const filter = (i) => i.user.id === interaction.member.id;
  const collector = reply.createMessageComponentCollector({
    ComponentType: ComponentType.Button,
    filter,
  });

  collector.on("collect", (i) => {
    if (i.customId === "取消") {
      const cancel = new EmbedBuilder()
        .setDescription("行动已被取消")
        .setColor("Red");

      interaction.editReply({
        embeds: [cancel],
        components: [],
        ephemeral: true,
      });
    }
    if (i.customId === "确认") {
      const embed = new EmbedBuilder()
      .setDescription("在10秒内输入敌对的一名人员或者随机")
      .setColor("Yellow");
      interaction.editReply({embeds: [embed],
        components: [],
      });
      action(origin, i);
    }
  });
}

module.exports = make_swap;