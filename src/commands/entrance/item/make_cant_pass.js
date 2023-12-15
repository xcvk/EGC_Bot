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
  if (buffs[0].BUFFS.EFFECT_DOUBLE > 0) {
    await pool.execute(
      `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.EFFECT_DOUBLE', ${
        Number(buffs[0].BUFFS.EFFECT_DOUBLE) + 1
      }) WHERE ID = ?;`,
      [interaction.user.id]
    );
    min = 2;
    max = 25;
  }
  
  const temp = team[0].TEAM;
  let steps = Math.floor(Math.random() * (max - min) + min);
  let enemy_team = null;
  if (temp === "红") {
    enemy_team = "蓝";
    await pool.execute(
      `UPDATE TEAMS SET BLUE_STEPS = BLUE_STEPS - ${steps} WHERE LINE = 1`
    );
  } else {
    enemy_team = "红";
    await pool.execute(
      `UPDATE TEAMS SET RED_STEPS = RED_STEPS - ${steps} WHERE LINE = 1`
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
    .setDescription(`已对 ${enemy_flag}${enemy_team}队 倒退了 ${steps}步`)
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
  await pool.execute(
    `UPDATE PLAYER
      SET ITEM_HISTORY = JSON_ARRAY_APPEND(IFNULL(ITEM_HISTORY, '[]'), '$', '❌此路不通')
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
    .setDescription("确定要使用❌__此路不通__\n本道具会使对方队伍倒退1~12步")
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
