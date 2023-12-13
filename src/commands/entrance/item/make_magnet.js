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
    `SELECT MAGNET FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].MAGNET <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("磁铁道具不足")
      .setColor("Red");
    await origin.followUp({ embeds: [insufficent], ephemeral: true });
    return;
  }

  const [curr_team] = await pool.execute(`SELECT TEAM FROM PLAYER WHERE ID = ?`, [
    interaction.user.id,
  ]);

  
  if (curr_team[0].TEAM === "红") {
    const [blue] = await pool.execute(`SELECT BLUE_DEBUFFS FROM TEAM WHERE LINE = 1`);

    
  }





  let flag = null;
  if (results[0].TEAM == "蓝") {
    flag = "🟦";
  } else {
    flag = "🟥";
  }
  const confirm = new EmbedBuilder()
    .setDescription("已对敌队添加磁铁")
    .setColor("Green")
    .setAuthor({
      name: `${interaction.user.username} ${flag}`,
      iconURL: `${interaction.user.avatarURL()}`,
    });
  await interaction.reply({
    embeds: [confirm],
    components: [],
  });


  setTimeout(async () => {
    if (curr_team[0].TEAM === "红") {
      await pool.execute(`UPDATE TEAMS
          SET BLUE_DEBUFFS = JSON_SET(BLUE_DEBUFFS, '$.MAGNET', NULL)
          WHERE LINE = 1;`);
    } else {
      await pool.execute(`UPDATE TEAMS
          SET BLUE_DEBUFFS = JSON_SET(RED_DEBUFFS, '$.MAGNET', NULL)
          WHERE LINE = 1;`);
    }
  },30000);



  await item_disp(origin);
}

async function make_magnet(origin, interaction) {
  let [results] = await pool.execute(
    `SELECT MAGNET, TEAM FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].MAGNET <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("磁铁道具不足")
      .setColor("Red");
    await interaction.reply({ embeds: [insufficent], ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });
  const embed = new EmbedBuilder()
    .setDescription(
      "确定要使用🧲__磁铁__\n本道具会使30秒内对方获取的道具分配给己方队伍成员,使用者获得第一个"
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

module.exports = make_magnet;
