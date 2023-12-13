const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require("discord.js");

const pool = require("../../../database/db-promise");
const item_disp = require("./item_disp");

async function action(origin, interaction) {
  let [results] = await pool.execute(
    `SELECT EFFECT_DOUBLE FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].EFFECT_DOUBLE <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("双份体验道具不足")
      .setColor("Red");
    await interaction.reply({ embeds: [insufficent], ephemeral: true });
    return;
  }

  const [buffz] = await pool.execute(`SELECT BUFFS FROM PLAYER WHERE ID = ?`, [
    interaction.user.id,
  ]);
  if (buffz[0].BUFFS.EFFECT_DOUBLE > 0) {
    await pool.execute(
      `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.EFFECT_DOUBLE', ${
        Number(buffz[0].BUFFS.EFFECT_DOUBLE) - 1
      }) WHERE ID = ?;`,
      [interaction.user.id]
    );
    const embed = new EmbedBuilder()
    .setColor("DarkRed")
    .setDescription("无效果，提示（这么贪心是不对的)双份体验依旧扣除。。");

    await interaction.reply({embeds: [embed],ephemeral: true});
    await item_disp(origin);
    return;
  }
  const updateQuery = `UPDATE PLAYER SET EFFECT_DOUBLE = EFFECT_DOUBLE - 1 WHERE id = ?`;
  await pool.execute(updateQuery, [interaction.user.id]);

  const [buffs] = await pool.execute(`SELECT BUFFS FROM PLAYER WHERE ID = ?`,[interaction.user.id]);
  await pool.execute(
    `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.EFFECT_DOUBLE', ${
      Number(buffs[0].BUFFS.EFFECT_DOUBLE) + 1
    }) WHERE ID = ?;`,[interaction.user.id]
  );
  const confirm = new EmbedBuilder()
    .setDescription(`已使用⬆️__双份体验__道具！`)
    .setColor("Green")
    .setAuthor({
      name: `${interaction.user.username}`,
      iconURL: `${interaction.user.avatarURL()}`,
    });
  await interaction.reply({
    embeds: [confirm],
    components: [],
    ephemeral: true,
  });
  await item_disp(origin);
}

async function make_effect_double(origin, interaction) {
  let [results] = await pool.execute(
    `SELECT EFFECT_DOUBLE FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].EFFECT_DOUBLE <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("双份体验道具不足")
      .setColor("Red");
    await interaction.reply({ embeds: [insufficent], ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });
  const embed = new EmbedBuilder()
    .setDescription(
      "确定要使用⬆️__双份体验__\n本道具会使下一次使用的道具效果双倍"
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
      interaction.editReply({
        components: [],
      });
      action(origin, i);
    }
  });
}

module.exports = make_effect_double;
