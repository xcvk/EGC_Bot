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

async function real_action(interaction, again) {
  let map = new Map();

  map.set(1, "OBSTACLE");
  map.set(2, "STUDENT");
  map.set(3, "CANT_PASS");
  map.set(4, "TELEPORTER");
  map.set(5, "MAGNET");
  map.set(6, "BOOTS");
  map.set(7, "SPELL_SHIELD");
  map.set(8, "SWAP");
  map.set(9, "EXPLORER");
  map.set(10, "EFFECT_DOUBLE");

  let PLAYERs = new Set();
  let items = new Set();

  let search = true;
  let item_num = Math.floor(Math.random() * (11 - 1) + 1);
  let item = map.get(item_num);
  let unlucky = null;
  let number = 0;
  const [team] = await pool.execute(`SELECT TEAM FROM PLAYER WHERE ID = ?`, [interaction.user.id]);



  if (team[0].TEAM === "红") {
    const [enemy_team] = await pool.execute(
      `SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1`
    );
    if (!enemy_team[0]) {
      await interaction.followUp(`【<@${interaction.user.id}> 溜达了一圈 两手空空的回宿舍了】`);
      return;
    }
    number = Math.floor(Math.random() * enemy_team[0].BLUE_MEMBERS.length);
    unlucky = enemy_team[0].BLUE_MEMBERS[number];
    
    const [enemy_inventory] = await pool.execute(`SELECT * FROM PLAYER WHERE ID = ?`,[unlucky]);
    let total = 0;
    for (const row of enemy_inventory) {
      for (const [key, value] of Object.entries(row)) {
        if (key === 'OBSTACLE') {
          // Do something for OBSTACLE
          total += value;
        } else if (key === 'STUDENT') {
          // Do something for STUDENT
          total += value;
        } else if (key === 'CANT_PASS') {
          // Do something for CANT_PASS
          total += value;
        } else if (key === 'TELEPORTER') {
          // Do something for TELEPORTER
          total += value;
        } else if (key === 'MAGNET') {
          // Do something for MAGNET
          total += value;
        } else if (key === 'BOOTS') {
          // Do something for BOOTS
          total += value;
        } else if (key === 'SPELL_SHIELD') {
          // Do something for SPELL_SHIELD
          total += value;
        } else if (key === 'SWAP') {
          // Do something for SWAP
          total += value[0];
        } else if (key === 'EXPLORER') {
          // Do something for EXPLORER
          total += value;
        } else if (key === 'EFFECT_DOUBLE') {
          // Do something for EFFECT_DOUBLE
          total += value;
        }
      }
    }

    while (search && unlucky && total) {
      
      items = new Set();

      while (search && items.size !== 10) {
        let [statement] = await pool.execute(
          `SELECT ${item} FROM PLAYER WHERE id = ?`,
          [unlucky]
        );
        switch (item) {
          case "OBSTACLE":
            if (statement[0].OBSTACLE > 0) {
              search = false;
              break;
            }

          case "STUDENT":
            if (statement[0].STUDENT > 0) {
              search = false;
              break;
            }
          case "TELEPORTER":
            if (statement[0].TELEPORTER > 0) {
              search = false;
              break;
            }
          case "CANT_PASS":
            if (statement[0].CANT_PASS > 0) {
              search = false;
              break;
            }
          case "MAGNET":
            if (statement[0].MAGNET > 0) {
              search = false;
              break;
            }
          case "BOOTS":
            if (statement[0].BOOTS > 0) {
              search = false;
              break;
            }
          case "SPELL_SHIELD":
            if (statement[0].SPELL_SHIELD > 0) {
              search = false;
              break;
            }
          case "SWAP":
            if (statement[0].SWAP > 0) {
              search = false;
              break;
            }
          case "EXPLORER":
            if (statement[0].EXPLORER > 0) {
              search = false;
              break;
            }
          case "EFFECT_DOUBLE":
            if (statement[0].EFFECT_DOUBLE > 0) {
              search = false;
              break;
            }
        }
        while (search && items.has(item)) {
          item_num = Math.floor(Math.random() * (11 - 1) + 1);
          item = map.get(item_num);
        }
        items.add(item);
      }
      PLAYERs.add(unlucky);
      while (search && PLAYERs.has(unlucky)) {
        number = Math.floor(
          Math.random() * enemy_team[0].BLUE_MEMBERS.length
        );
        unlucky = enemy_team[0].BLUE_MEMBERS[number];
      }
    }

    await pool.execute(
      `UPDATE PLAYER SET ${item} = ${item} - 1 WHERE id = ?`,
      [unlucky]
    );

    await pool.execute(
      `UPDATE PLAYER SET ${item} = ${item} + 1 WHERE id = ?`,
      [interaction.user.id]
    );
  } else {
    const [enemy_team] = await pool.execute(
      `SELECT RED_MEMBERS FROM TEAMS WHERE LINE = 1`
    );
    number = Math.floor(Math.random() * enemy_team[0].RED_MEMBERS.length);
    unlucky = enemy_team[0].RED_MEMBERS[number];
    while (search) {
      
      items = new Set();

      while (search && items.size !== 10) {
        let [statement] = await pool.execute(
          `SELECT ${item} FROM PLAYER WHERE id = ?`,
          [unlucky]
        );
        switch (item) {
          case "OBSTACLE":
            if (statement[0].OBSTACLE > 0) {
              search = false;
              break;
            }

          case "STUDENT":
            if (statement[0].STUDENT > 0) {
              search = false;
              break;
            }
          case "TELEPORTER":
            if (statement[0].TELEPORTER > 0) {
              search = false;
              break;
            }
          case "CANT_PASS":
            if (statement[0].CANT_PASS > 0) {
              search = false;
              break;
            }
          case "MAGNET":
            if (statement[0].MAGNET > 0) {
              search = false;
              break;
            }
          case "BOOTS":
            if (statement[0].BOOTS > 0) {
              search = false;
              break;
            }
          case "SPELL_SHIELD":
            if (statement[0].SPELL_SHIELD > 0) {
              search = false;
              break;
            }
          case "SWAP":
            if (statement[0].SWAP > 0) {
              search = false;
              break;
            }
          case "EXPLORER":
            if (statement[0].EXPLORER > 0) {
              search = false;
              break;
            }
          case "EFFECT_DOUBLE":
            if (statement[0].EFFECT_DOUBLE > 0) {
              search = false;
              break;
            }
        }
        while (search && items.has(item)) {
          item_num = Math.floor(Math.random() * (11 - 1) + 1);
          item = map.get(item_num);
        }
        items.add(item);
      }
      PLAYERs.add(unlucky);
      while (search && PLAYERs.has(unlucky)) {
        number = Math.floor(Math.random() * enemy_team[0].RED_MEMBERS.length);
        unlucky = enemy_team[0].RED_MEMBERS[number];
      }
    }

    await pool.execute(
      `UPDATE PLAYER SET ${item} = ${item} - 1 WHERE id = ?`,
      [unlucky]
    );

    await pool.execute(
      `UPDATE PLAYER SET ${item} = ${item} + 1 WHERE id = ?`,
      [interaction.user.id]
    );
  }

  let [results] = await pool.execute(`SELECT TEAM FROM PLAYER WHERE id = ?`, [
    interaction.user.id,
  ]);
  let flag = null;
  if (results[0].TEAM === "蓝") {
    flag = "🟦";
  } else {
    flag = "🟥";
  }

  const array2 = [
    `<@${unlucky}> 偶遇 <@${interaction.user.id}> 好心的送给了ta一个 ${translation.get(item)}道具`,
    `<@${interaction.user.id}> 嘿 <@${unlucky}> 这个${translation.get(item)}不错 借我用用呗~`,
    `<@${unlucky}> 站住！<@${interaction.user.id}> 那是我的！！我的！！！我的${translation.get(item)}呀！！！！`,
    `<@${unlucky}> 大手一挥 拿出了${translation.get(item)}道具 送给了<@${interaction.user.id}>`,
    `<@${interaction.user.id}> 从背后突袭了 <@${unlucky}> 从ta怀里拿走了${translation.get(item)}道具`
  ];

  const confirm = new EmbedBuilder()
    .setDescription(array2[Math.floor(Math.random() * (array2.length))])
    .setColor("Green")
    .setAuthor({
      name: `${interaction.user.username} ${flag}`,
      iconURL: `${interaction.user.avatarURL()}`,
    });
  if (again) {
    await interaction.followUp({
      embeds: [confirm],
      components: [],
    });
  } else {
    await interaction.reply({
      embeds: [confirm],
      components: [],
    });
  }

  await pool.execute(
    `UPDATE PLAYER SET STUDENT = STUDENT - 1 WHERE id = ?`,
    [interaction.user.id]
  );
}




async function action(origin, interaction) {
  let [team] = await pool.execute(
    `SELECT STUDENT, TEAM FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (team[0].STUDENT <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("大学生道具不足")
      .setColor("Red")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`
      });
    await interaction.reply({ embeds: [insufficent], });
    return;
  }

  await pool.execute(`UPDATE PLAYER SET STUDENT = STUDENT - 1 WHERE id = ?`, [
    interaction.user.id,
  ]);

  let again = false;
  const [buffs] = await pool.execute(`SELECT BUFFS FROM PLAYER WHERE ID = ?`, [
    interaction.user.id,
  ]);
  if (buffs[0].BUFFS.EFFECT_DOUBLE > 0) {
    await pool.execute(
      `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.EFFECT_DOUBLE', ${Number(buffs[0].BUFFS.EFFECT_DOUBLE) - 1
      }) WHERE ID = ?;`,
      [interaction.user.id]
    );
    await real_action(interaction, again);
    again = true;
  }
  await real_action(interaction, again);
  const date = new Date();
  await pool.execute(
    `UPDATE PLAYER
      SET ITEM_HISTORY = JSON_ARRAY_APPEND(IFNULL(ITEM_HISTORY, '[]'), '$', '🎓大学生: 12月 ${date.getDate()}号 ${date.getHours()}时 ${date.getMinutes()}分')
      WHERE ID = ?;`,
    [interaction.user.id]
  );
  await item_disp(origin);
}

async function make_student(origin, interaction) {
  let [results] = await pool.execute(
    `SELECT STUDENT FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].STUDENT <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("大学生道具不足")
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
    .setDescription("确定要使用🎓__大学生__\n本道具会使对方队伍取要一个道具")
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

module.exports = make_student;
