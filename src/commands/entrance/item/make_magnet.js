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
    await origin.followUp({ embeds: [insufficent],  });
    return;
  }

  const [curr_team] = await pool.execute(`SELECT TEAM FROM PLAYER WHERE ID = ?`, [
    interaction.user.id,
  ]);

  
  if (curr_team[0].TEAM === "红") {
    const [blue] = await pool.execute(
      `SELECT BLUE_DEBUFFS FROM TEAMS WHERE LINE = 1`
    );
    if (blue[0].BLUE_DEBUFFS.MAGNET != 0) {
      const in_use = new EmbedBuilder()
        .setDescription("敌队已有磁铁!")
        .setColor("Red")
        .setAuthor({
          name: `${interaction.user.username}`,
          iconURL: `${interaction.user.avatarURL()}`,
        });
      await interaction.reply({
        embeds: [in_use],
        components: [],
        
      });
      return;
    } else {
      await pool.execute(`UPDATE TEAMS
          SET BLUE_DEBUFFS = JSON_SET(BLUE_DEBUFFS, '$.MAGNET', ${interaction.user.id})
          WHERE LINE = 1;`);
    }
    
  } else {
    const [red] = await pool.execute(
      `SELECT RED_DEBUFFS FROM TEAMS WHERE LINE = 1`
    );
    if (red[0].RED_DEBUFFS.MAGNET !== 0) {
      const in_use = new EmbedBuilder()
        .setDescription("敌队已有磁铁!")
        .setColor("Red")
        .setAuthor({
          name: `${interaction.user.username}`,
          iconURL: `${interaction.user.avatarURL()}`,
        });
      await interaction.reply({
        embeds: [in_use],
        components: [],
        
      });
      return;
    } else {
      await pool.execute(`UPDATE TEAMS
          SET RED_DEBUFFS = JSON_SET(RED_DEBUFFS, '$.MAGNET', ${interaction.user.id})
          WHERE LINE = 1;`);
    }
  }


  let flag = null;
  let enemy = null;
  if (results[0].TEAM == "蓝") {
    flag = "🟦";
    enemy = "🟥";
  } else {
    flag = "🟥";
    enemy = "🟦";
  }
  await pool.execute(`UPDATE PLAYER SET MAGNET = ${results[0].MAGNET} - 1 WHERE ID = ?`,[interaction.user.id]);
  const [buffs] = await pool.execute(`SELECT BUFFS FROM PLAYER WHERE ID = ?`, [
    interaction.user.id,
  ]);
  let duration = 30000;
  if (buffs[0].BUFFS.EFFECT_DOUBLE > 0) {
    await pool.execute(
      `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.EFFECT_DOUBLE', ${
        Number(buffs[0].BUFFS.EFFECT_DOUBLE) - 1
      }) WHERE ID = ?;`,
      [interaction.user.id]
    );
    duration = 60000;
  }
  const confirm = new EmbedBuilder()
    .setDescription(`已对${enemy}敌队添加了${duration/1000}秒的磁铁`)
    .setColor("Green")
    .setAuthor({
      name: `${interaction.user.username} ${flag}`,
      iconURL: `${interaction.user.avatarURL()}`,
    });
  await interaction.reply({
    embeds: [confirm],
    components: [],
  });




  await item_disp(origin);
  setTimeout(async () => {
    if (curr_team[0].TEAM === "红") {
      await pool.execute(`UPDATE TEAMS
          SET BLUE_DEBUFFS = JSON_SET(BLUE_DEBUFFS, '$.MAGNET', 0)
          WHERE LINE = 1;`);
    } else {
      await pool.execute(`UPDATE TEAMS
          SET BLUE_DEBUFFS = JSON_SET(RED_DEBUFFS, '$.MAGNET', 0)
          WHERE LINE = 1;`);
    }
    await pool.execute(
      `UPDATE PLAYER
      SET ITEM_HISTORY = JSON_ARRAY_APPEND(IFNULL(ITEM_HISTORY, '[]'), '$', '🧲磁铁')
      WHERE ID = ?;`,
      [interaction.user.id]
    );
    const done = new EmbedBuilder()
      .setDescription(`对${enemy}敌队的添加的${duration/1000}秒磁铁已结束`)
      .setAuthor({
        name: `${interaction.user.username} ${flag}`,
        iconURL: `${interaction.user.avatarURL()}`,
      });
    await interaction.followUp({embeds: [done]});
  }, duration);

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
    await interaction.reply({ embeds: [insufficent],  });
    return;
  }

  await interaction.deferReply({  });
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

module.exports = make_magnet;
