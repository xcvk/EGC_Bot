const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require("discord.js");

const pool = require("../../../database/db-promise");

async function action(interaction) {
  const updateQuery = `UPDATE player SET OBSTACLE = OBSTACLE - 1 WHERE id = ?`;
  await pool.execute(updateQuery, [interaction.user.username]);

  const curr_team = await pool.execute(`SELECT TEAM FROM PLAYER WHERE ID = ?`, [
    interaction.user.username,
  ]);

  if (curr_team[0].TEAM == "红") {
    await pool.execute(
      `UPDATE TEAMS
        SET BLUE_DEBUFFS = JSON_ARRAY_APPEND(IFNULL(BLUE_DEBUFFS, '[]'), '$', 'OBSTACLE')
        WHERE LINE = 1;`
    );
  }
}

async function make_obstacles(interaction) {
  await interaction.deferReply();

  const embed = new EmbedBuilder()
    .setDescription("确定要使用🚧路障\n本道具会使对方队伍停滞一次")
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
      const confirm = new EmbedBuilder()
        .setDescription("已对敌队添加路障")
        .setColor("Green")
        .setAuthor({
          name: `${interaction.user.username}`,
          iconURL: `${interaction.user.avatarURL()}`,
        });
      interaction.editReply({
        embeds: [confirm],
        components: [],
        ephemeral: false,
      });
      action(i);
    }
  });
}

module.exports = make_obstacles;
