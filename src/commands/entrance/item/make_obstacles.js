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
    await origin.followUp({ embeds: [insufficent],  });
    return;
  }


  let flag = null;
  if (results[0].TEAM == "蓝") {
    flag = "🟦";
  } else {
    flag = "🟥";
  }
  let confirm = new EmbedBuilder()
    .setDescription("已对敌队添加路障")
    .setColor("Green")
    .setAuthor({
      name: `${interaction.user.username} ${flag}`,
      iconURL: `${interaction.user.avatarURL()}`,
    });
  await interaction.reply({
    embeds: [confirm],
    components: [],
  });
  const updateQuery = `UPDATE PLAYER SET OBSTACLE = OBSTACLE - 1 WHERE id = ?`;
  await pool.execute(updateQuery, [interaction.user.id]);

  const [curr_team] = await pool.execute(
    `SELECT TEAM FROM PLAYER WHERE ID = ?`,
    [interaction.user.id]
  );



  let quantity = 1;
  const [buffs] = await pool.execute(`SELECT BUFFS FROM PLAYER WHERE ID = ?`, [
    interaction.user.id,
  ]);
  if (buffs[0].BUFFS.EFFECT_DOUBLE > 0) {
    await pool.execute(
      `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.EFFECT_DOUBLE', ${
        Number(buffs[0].BUFFS.EFFECT_DOUBLE) - 1
      }) WHERE ID = ?;`,
      [interaction.user.id]
    );
    quantity = 2;
  }


  if (curr_team[0].TEAM === "红") {
    const [test] =
      await pool.execute(`SELECT JSON_UNQUOTE(JSON_EXTRACT(BLUE_DEBUFFS, '$.OBSTACLE')) AS OBSTACLE
      FROM TEAMS
      WHERE LINE = 1;`);
    
    if (quantity === 2) {
      await pool.execute(
    `UPDATE TEAMS
      SET RED_OBSTACLES = JSON_ARRAY_APPEND(IFNULL(BLUE_OBSTACLES, '[]'), '$', '${interaction.user.id}')
      WHERE LINE = 1;`
    );
    }
    await pool.execute(`UPDATE TEAMS
          SET BLUE_DEBUFFS = JSON_SET(BLUE_DEBUFFS, '$.OBSTACLE', ${
            Number(test[0].OBSTACLE) + quantity
          })
          WHERE LINE = 1;`);
    await pool.execute(
    `UPDATE TEAMS
      SET RED_OBSTACLES = JSON_ARRAY_APPEND(IFNULL(BLUE_OBSTACLES, '[]'), '$', '${interaction.user.id}')
      WHERE LINE = 1;`
  );
  } else {
    const [test] =
      await pool.execute(`SELECT JSON_UNQUOTE(JSON_EXTRACT(RED_DEBUFFS, '$.OBSTACLE')) AS OBSTACLE
      FROM TEAMS
      WHERE LINE = 1;`);
    if (quantity === 2) {
      await pool.execute(
    `UPDATE TEAMS
      SET BLUE_OBSTACLES = JSON_ARRAY_APPEND(IFNULL(RED_OBSTACLES, '[]'), '$', '${interaction.user.id}')
      WHERE LINE = 1;`);
    }
    await pool.execute(
    `UPDATE TEAMS
      SET BLUE_OBSTACLES = JSON_ARRAY_APPEND(IFNULL(RED_OBSTACLES, '[]'), '$', '${interaction.user.id}')
      WHERE LINE = 1;`
  );
    
    await pool.execute(`UPDATE TEAMS
          SET RED_DEBUFFS = JSON_SET(RED_DEBUFFS, '$.OBSTACLE', ${
            Number(test[0].OBSTACLE) + quantity
          })
          WHERE LINE = 1;`);
  }
  const date = new Date();
  await pool.execute(
    `UPDATE PLAYER
      SET ITEM_HISTORY = JSON_ARRAY_APPEND(IFNULL(ITEM_HISTORY, '[]'), '$', '🚧路障: 12月 ${date.getDate()}号 ${date.getHours()}时 ${date.getMinutes()}分')
      WHERE ID = ?;`,
    [interaction.user.id]
  );
  await item_disp(origin);
}

async function canceld(interaction) {
  const cancel = new EmbedBuilder()
    .setDescription("行动已被取消")
    .setColor("Red");

  await interaction.editReply({
    embeds: [cancel],
    components: [],
    
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
    await interaction.reply({ embeds: [insufficent],  });
    return;
  }

  await interaction.deferReply({  });
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
    components: [Buttons]
    ,
  });

  const filter = (i) => i.user.id === interaction.member.id;
  const collector = reply.createMessageComponentCollector({
    ComponentType: ComponentType.Button,
    filter,
  });


  collector.on("collect", (i) => {
    if (i.customId === "取消") {
      canceld(interaction);
    }
    if (i.customId === "确认") {
      interaction.editReply({
        components: [],
      });
      action(origin, i);
    }
  });
}

module.exports = make_obstacles;
