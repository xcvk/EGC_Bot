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
  const [team] = await pool.execute(
    `SELECT TEAM, CANT_PASS FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (team[0].CANT_PASS <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("此路不通道具不足")
      .setColor("Red");
    await interaction.reply({ embeds: [insufficent],  });
    return;
  }


  let min = 1;
  let max = 13;
  
  const [buffs] = await pool.execute(`SELECT BUFFS FROM PLAYER WHERE ID = ?`, [
    interaction.user.id,
  ]);

  let quantity = 1;
  if (buffs[0].BUFFS.EFFECT_DOUBLE > 0) {
    await pool.execute(
      `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.EFFECT_DOUBLE', ${
        Number(buffs[0].BUFFS.EFFECT_DOUBLE) - 1
      }) WHERE ID = ?;`,
      [interaction.user.id]
    );
    quantity = 2;
  }
  
  const temp = team[0].TEAM;
  let enemy_team = null;
  if (temp === "红") {
    enemy_team = "蓝";
    const [test] =
      await pool.execute(`SELECT JSON_UNQUOTE(JSON_EXTRACT(BLUE_DEBUFFS, '$.CANT_PASS')) AS CANT_PASS
      FROM TEAMS
      WHERE LINE = 1;`);


    if (quantity === 2) {
      await pool.execute(
      `UPDATE TEAMS
        SET BLUE_CANT_PASS = JSON_ARRAY_APPEND(IFNULL(BLUE_CANT_PASS, '[]'), '$', '${interaction.user.id}')
        WHERE LINE = 1;`
      );
    }
    
    await pool.execute(`UPDATE TEAMS
    SET BLUE_DEBUFFS = JSON_SET(BLUE_DEBUFFS, '$.CANT_PASS', ${
    Number(test[0].CANT_PASS) + quantity})
          WHERE LINE = 1;`);
    await pool.execute(
    `UPDATE TEAMS
      SET BLUE_CANT_PASS = JSON_ARRAY_APPEND(IFNULL(BLUE_CANT_PASS, '[]'), '$', '${interaction.user.id}')
      WHERE LINE = 1;`
    );
  } else {
    enemy_team = "红";
    const [test] =
      await pool.execute(`SELECT JSON_UNQUOTE(JSON_EXTRACT(RED_DEBUFFS, '$.CANT_PASS')) AS CANT_PASS
      FROM TEAMS
      WHERE LINE = 1;`);
    
    if (quantity === 2) {
      await pool.execute(
    `UPDATE TEAMS
      SET RED_CANT_PASS = JSON_ARRAY_APPEND(IFNULL(RED_CANT_PASS, '[]'), '$', '${interaction.user.id}')
      WHERE LINE = 1;`
    );
    }
    await pool.execute(`UPDATE TEAMS
    SET RED_DEBUFFS = JSON_SET(RED_DEBUFFS, '$.CANT_PASS', ${
    Number(test[0].CANT_PASS) + quantity})
          WHERE LINE = 1;`);
    await pool.execute(
    `UPDATE TEAMS
      SET RED_CANT_PASS = JSON_ARRAY_APPEND(IFNULL(RED_CANT_PASS, '[]'), '$', '${interaction.user.id}')
      WHERE LINE = 1;`
    );
  }


  let flag = null;
  let enemy_flag = null;
  if (team[0].TEAM === "蓝") {
    flag = "🟦";
    enemy_flag = "🟥";
  } else {
    flag = "🟥";
    enemy_flag = "🟦";
  }

  const confirm = new EmbedBuilder()
    .setDescription(`已对 ${enemy_flag}${enemy_team}队加了此路不通陷阱`)
    .setColor("Green")
    .setAuthor({
      name: `${interaction.user.username} ${flag}`,
      iconURL: `${interaction.user.avatarURL()}`,
    });
  await interaction.reply({
    embeds: [confirm],
    components: [],
  });
  await pool.execute(
    `UPDATE PLAYER SET CANT_PASS = CANT_PASS - 1 WHERE id = ?`,
    [interaction.user.id]
  );

  const date = new Date();
  await pool.execute(
    `UPDATE PLAYER
      SET ITEM_HISTORY = JSON_ARRAY_APPEND(IFNULL(ITEM_HISTORY, '[]'), '$', '❌此路不通:12月 ${date.getDate()}号 ${date.getHours()}时 ${date.getMinutes()}分')
      WHERE ID = ?;`,[interaction.user.id]
  );
  await item_disp(origin);
}

async function make_cant_pass(origin, interaction) {
  let [results] = await pool.execute(
    `SELECT CANT_PASS, TEAM FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].CANT_PASS <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("此路不通道具不足")
      .setColor("Red");
    await interaction.reply({ embeds: [insufficent],  });
    return;
  }

  await interaction.deferReply({  });
  const embed = new EmbedBuilder()
    .setDescription("确定要使用❌__此路不通__\n本道具会使敌队倒退1~12步的陷阱")
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

module.exports = make_cant_pass;
