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
    `SELECT OBSTACLE FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].OBSTACLE <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("路障道具不足")
      .setColor("Red");
    await interaction.reply({ embeds: [insufficent], ephemeral: true });
    return;
  }

  const updateQuery = `UPDATE player SET OBSTACLE = OBSTACLE - 1 WHERE id = ?`;
  await pool.execute(updateQuery, [interaction.user.id]);


  

  
  const [curr_team] = await pool.execute(
    `SELECT TEAM FROM PLAYER WHERE ID = ?`,
    [interaction.user.id]
  );
  if (curr_team[0].TEAM === "红") {
    const [test] =
      await pool.execute(`SELECT JSON_UNQUOTE(JSON_EXTRACT(BLUE_DEBUFFS, '$.OBSTACLE')) AS OBSTACLE
      FROM TEAMS
      WHERE LINE = 1;`);
    await pool.execute(`UPDATE TEAMS
          SET BLUE_DEBUFFS = JSON_SET(BLUE_DEBUFFS, '$.OBSTACLE', ${
            Number(test[0].OBSTACLE) + 1
          })
          WHERE LINE = 1;`);

  } else {
    const [test] =
      await pool.execute(`SELECT JSON_UNQUOTE(JSON_EXTRACT(RED_DEBUFFS, '$.OBSTACLE')) AS OBSTACLE
      FROM TEAMS
      WHERE LINE = 1;`);
    await pool.execute(`UPDATE TEAMS
          SET RED_DEBUFFS = JSON_SET(RED_DEBUFFS, '$.OBSTACLE', ${
            Number(test[0].OBSTACLE) + 1
          })
          WHERE LINE = 1;`);

  }

  await item_disp(origin);
}

async function canceld(interaction) {
  const cancel = new EmbedBuilder()
    .setDescription("行动已被取消")
    .setColor("Red");

  await interaction.editReply({
    embeds: [cancel],
    components: [],
    ephemeral: true,
  });
}

async function make_obstacles(origin, interaction) {
  let [results] = await pool.execute(
    `SELECT OBSTACLE, TEAM FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].OBSTACLE <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("路障道具不足")
      .setColor("Red");
    await interaction.reply({ embeds: [insufficent], ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });
  const embed = new EmbedBuilder()
    .setDescription("确定要使用🚧__路障__\n本道具会使对方队伍停滞一次")
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

  let flag = null;
  if (results[0].TEAM == "蓝") {
    flag = "🟦";
  } else {
    flag = "🟥";
  }

  collector.on("collect", (i) => {
    if (i.customId === "取消") {
      canceld(interaction);
    }
    if (i.customId === "确认") {
      interaction.editReply({
        components: [],
      });
      const confirm = new EmbedBuilder()
        .setDescription("已对敌队添加路障")
        .setColor("Green")
        .setAuthor({
          name: `${interaction.user.username} ${flag}`,
          iconURL: `${interaction.user.avatarURL()}`,
        });
      i.reply({
        embeds: [confirm],
        components: [],
      });
      action(origin, i);
    }
  });
}

module.exports = make_obstacles;
