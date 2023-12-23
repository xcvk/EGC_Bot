const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require("discord.js");

const pool = require("../../../database/db-promise");
const item_disp = require("./item_disp");
const translation = require("../../../database/translation");
async function action(origin, interaction) {




  let [results] = await pool.execute(
    `SELECT MAGNET FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].MAGNET <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("磁铁道具不足")
      .setColor("Red")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`
      });
    await origin.followUp({ embeds: [insufficent], });
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
          SET RED_DEBUFFS = JSON_SET(RED_DEBUFFS, '$.MAGNET', '${interaction.user.id}')
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
  await pool.execute(`UPDATE PLAYER SET MAGNET = ${results[0].MAGNET} - 1 WHERE ID = ?`, [interaction.user.id]);
  const [buffs] = await pool.execute(`SELECT BUFFS FROM PLAYER WHERE ID = ?`, [
    interaction.user.id,
  ]);
  let duration = 30000;
  if (buffs[0].BUFFS.EFFECT_DOUBLE > 0) {
    await pool.execute(
      `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.EFFECT_DOUBLE', ${Number(buffs[0].BUFFS.EFFECT_DOUBLE) - 1
      }) WHERE ID = ?;`,
      [interaction.user.id]
    );
    duration = 60000;
  }
  const myArray = [
    `<@${interaction.user.id}> 都是我的，都是我的！！哈哈哈哈哈哈`,
    `<@${interaction.user.id}> 让对手的收获成为你的战利品！磁铁道具，现在发动！`,
    `<@${interaction.user.id}> 是时候扭转乾坤了！使用磁铁，让一切好东西都来到我们这边！`,
    `<@${interaction.user.id}> 看那对方的道具，马上就要变成我们的了！磁铁道具，展现你的魔力！`,
    `<@${interaction.user.id}> 抢夺战开始！磁铁道具，将对方的资源转为我们的资本！`,
    `<@${interaction.user.id}> 对方的道具即将改变归属。磁铁，现在就施展你的力量！`
  ];
  const confirm = new EmbedBuilder()
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
  const date = new Date();
  await pool.execute(
    `UPDATE PLAYER
      SET ITEM_HISTORY = JSON_ARRAY_APPEND(IFNULL(ITEM_HISTORY, '[]'), '$', '🧲磁铁: 12月 ${date.getDate()}号 ${date.getHours()}时 ${date.getMinutes()}分')
      WHERE ID = ?;`,
    [interaction.user.id]
  );

  await item_disp(origin);

  
  setTimeout(async () => {

    let words = "";
    thiefs = [];
    items = [];
    victims = [];
    if (curr_team[0].TEAM === "红") {
      await pool.execute(`UPDATE TEAMS
          SET BLUE_DEBUFFS = JSON_SET(BLUE_DEBUFFS, '$.MAGNET', 0)
          WHERE LINE = 1;`);
      

      [thiefs] = await pool.execute("SELECT BLUE_MAGNET_THIEF FROM TEAMS WHERE LINE = 1");
      [items] = await pool.execute("SELECT BLUE_MAGNET_ITEMS FROM TEAMS WHERE LINE = 1");
      [victims] = await pool.execute("SELECT BLUE_MAGNET_VICTIM FROM TEAMS WHERE LINE = 1");
      if (thiefs[0].BLUE_MAGNET_THIEF) {
        words += "\n磁铁产生的反应\n";
        for (let i = 0; i < thiefs[0].BLUE_MAGNET_THIEF.length; ++i) {
          words += `<@${victims[0].BLUE_MAGNET_VICTIM[i]}> 的 ${translation.get(items[0].BLUE_MAGNET_ITEMS[i])} 被 <@${thiefs[0].BLUE_MAGNET_THIEF[i]}>偷走了\n`;
        }
      }
      await pool.execute(
        `UPDATE TEAMS
        SET 
        BLUE_MAGNET_VICTIM = NULL,
        BLUE_MAGNET_THIEF = NULL,
        BLUE_MAGNET_ITEMS = NULL
       WHERE LINE = 1;`
      );

      
      
    } else {
      await pool.execute(`UPDATE TEAMS
          SET BLUE_DEBUFFS = JSON_SET(RED_DEBUFFS, '$.MAGNET', 0)
          WHERE LINE = 1;`);

      [thiefs] = await pool.execute("SELECT RED_MAGNET_THIEF FROM TEAMS WHERE LINE = 1");
      [items] = await pool.execute("SELECT RED_MAGNET_ITEMS FROM TEAMS WHERE LINE = 1");
      [victims] = await pool.execute("SELECT RED_MAGNET_VICTIM FROM TEAMS WHERE LINE = 1");



      await pool.execute(
        `UPDATE TEAMS
        SET 
          RED_MAGNET_VICTIM = NULL,
          RED_MAGNET_THIEF = NULL,
          RED_MAGNET_ITEMS = NULL
        WHERE LINE = 1;`
      );

      if (thiefs[0].RED_MAGNET_THIEF) {
        words += "\n磁铁产生的反应\n";
        for (let i = 0; i < thiefs[0].RED_MAGNET_THIEF.length; ++i) {
          words += `<@${victims[0].RED_MAGNET_VICTIM[i]}> 的 ${translation.get(items[0].RED_MAGNET_ITEMS[i])} 被 <@${thiefs[0].RED_MAGNET_THIEF[i]}>偷走了\n`;
        }
      }
    }

    
    const done = new EmbedBuilder()
      .setDescription(`对敌队的添加的${duration / 1000}秒磁铁已结束${words}`)
      .setAuthor({
        name: `${interaction.user.username} ${flag}`,
        iconURL: `${interaction.user.avatarURL()}`,
      })
      .setColor("Purple");
    await interaction.followUp({ embeds: [done] });



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
      .setColor("Red")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`
      });
    await interaction.reply({ embeds: [insufficent], });
    return;
  }

  await interaction.deferReply({});
  const embed = new EmbedBuilder()
    .setDescription(
      "确定要使用🧲__磁铁__\n本道具会使30秒内对方获取的道具分配给己方队伍成员,使用者获得第一个"
    )
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
        .setColor("Red")
        .setAuthor({
          name: `${interaction.user.username}`,
          iconURL: `${interaction.user.avatarURL()}`
        });

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
