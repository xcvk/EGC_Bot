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
      .setColor("Red")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`
      });
    await origin.followUp({ embeds: [insufficent],  });
    return;
  }


  let flag = null;
  let enemy_flag = null;
  let enemy = null;
  if (results[0].TEAM == "蓝") {
    flag = "🟦";
    enemy_flag = "🟥";
    enemy = "红";
  } else {
    flag = "🟥";
    enemy_flag = "🟦";
    enemy = "蓝";
  }

  const myArray = [];

  // Add strings to the array
  myArray.push(`<@${interaction.user.id}> 为${enemy_flag}${enemy}队投放了路障！让ta休息一会吧`);
  myArray.push(`<@${interaction.user.id}> 嘿嘿 让${enemy}队 休息休息 再休息休息~`);
  myArray.push(`小坏蛋 <@${interaction.user.id}> 为${enemy}队扔了一块绊脚石并发出了杠铃般的大笑`);
  myArray.push(`此树是我栽 此路是我开，要想由此过 留下买路财！<@${interaction.user.id}> 为${enemy}队使用了路障`);
  myArray.push(`<@${interaction.user.id}> 左看看 右看看， 很好，夜黑风高 正是做坏事的好机会，假装不经意的碰倒一个路障后撒腿就跑`);



  let confirm = new EmbedBuilder()
    .setDescription(myArray[Math.floor(Math.random() * (myArray.length))])
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
    const [test] = await pool.execute(`
    SELECT JSON_UNQUOTE(JSON_EXTRACT(BLUE_DEBUFFS, '$.OBSTACLE')) AS OBSTACLE
    FROM TEAMS
    WHERE LINE = 1;
  `);

    if (quantity === 2) {
      await pool.execute(`
      UPDATE TEAMS
      SET BLUE_OBSTACLES = JSON_ARRAY_APPEND(IFNULL(BLUE_OBSTACLES, '[]'), '$', '${interaction.user.id}')
      WHERE LINE = 1;
    `);
    }

    await pool.execute(`
    UPDATE TEAMS
    SET BLUE_DEBUFFS = JSON_SET(BLUE_DEBUFFS, '$.OBSTACLE', ${Number(test[0].OBSTACLE) + quantity})
    WHERE LINE = 1;
  `);

    await pool.execute(`
    UPDATE TEAMS
    SET RED_OBSTACLES = JSON_ARRAY_APPEND(IFNULL(RED_OBSTACLES, '[]'), '$', '${interaction.user.id}')
    WHERE LINE = 1;
  `);
  } else {
    const [test] = await pool.execute(`
    SELECT JSON_UNQUOTE(JSON_EXTRACT(RED_DEBUFFS, '$.OBSTACLE')) AS OBSTACLE
    FROM TEAMS
    WHERE LINE = 1;
  `);

    if (quantity === 2) {
      await pool.execute(`
      UPDATE TEAMS
      SET RED_OBSTACLES = JSON_ARRAY_APPEND(IFNULL(RED_OBSTACLES, '[]'), '$', '${interaction.user.id}')
      WHERE LINE = 1;
    `);
    }

    await pool.execute(`
    UPDATE TEAMS
    SET RED_DEBUFFS = JSON_SET(RED_DEBUFFS, '$.OBSTACLE', ${Number(test[0].OBSTACLE) + quantity})
    WHERE LINE = 1;
  `);
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
    .setColor("Red")
    .setAuthor({
      name: `${interaction.user.username}`,
      iconURL: `${interaction.user.avatarURL()}`
    });

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
      .setColor("Red")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`
      });
    await interaction.reply({ embeds: [insufficent],  });
    return;
  }

  await interaction.deferReply({  });
  const embed = new EmbedBuilder()
    .setDescription("确定要使用🚧__路障__\n本道具会使对方队伍停滞一次")
    .setColor("Yellow")
    .setAuthor({
      name: `${interaction.user.username}`,
      iconURL: `${interaction.user.avatarURL()}`
    });

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
