const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require("discord.js");

const pool = require("../../../database/db-promise");
const item_disp = require("./item_disp");
const translatation = require("../../../database/translation");

async function action(origin, interaction) {
  let [team] = await pool.execute(
    `SELECT STUDENT, TEAM FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (team[0].STUDENT === 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("大学生道具不足")
      .setColor("Red");
    await interaction.reply({ embeds: [insufficent], ephemeral: true });
    return;
  }

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

  let players = new Set();
  let items = new Set();

  let search = true;
  let item_num = Math.floor(Math.random() * (11 - 1) + 1);
  let item = map.get(item_num);
  let unlucky = null;
  let number = 0;
  if (team[0].TEAM === "红") {
    const [enemy_team] = await pool.query(
      `SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1`
    );
    number = Math.floor(Math.random() * enemy_team[0].BLUE_MEMBERS.length);
    unlucky = enemy_team[0].BLUE_MEMBERS[number];
    while (search) {
      if (
        items.size === 10 &&
        players.size === enemy_team[0].BLUE_MEMBERS.length
      ) {
        await interaction.reply("敌对所有人都没有道具了");
        break;
      }
      items = new Set();

      while (search && items.size !== 10) {
        let [statement] = await pool.query(
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
      players.add(unlucky);
      while (search && players.has(unlucky)) {
        number = Math.floor(Math.random() * enemy_team[0].BLUE_MEMBERS.length);
        unlucky = enemy_team[0].BLUE_MEMBERS[number];
      }
    }

    await pool.query(`UPDATE player SET ${item} = ${item} - 1 WHERE id = ?`, [
      unlucky,
    ]);

    await pool.query(`UPDATE player SET ${item} = ${item} + 1 WHERE id = ?`, [
      interaction.user.id,
    ]);
  } else {
    const [enemy_team] = await pool.query(
      `SELECT RED_MEMBERS FROM TEAMS WHERE LINE = 1`
    );
    number = Math.floor(Math.random() * enemy_team[0].RED_MEMBERS.length);
    unlucky = enemy_team[0].RED_MEMBERS[number];
    while (search) {
      if (
        items.size === 10 &&
        players.size === enemy_team[0].RED_MEMBERS.length
      ) {
        await interaction.reply("敌对所有人都没有道具了");
        break;
      }
      items = new Set();

      while (search && items.size !== 10) {
        let [statement] = await pool.query(
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
      players.add(unlucky);
      while (search && players.has(unlucky)) {
        number = Math.floor(Math.random() * enemy_team[0].RED_MEMBERS.length);
        unlucky = enemy_team[0].RED_MEMBERS[number];
      }
    }

    await pool.query(`UPDATE player SET ${item} = ${item} - 1 WHERE id = ?`, [
      unlucky,
    ]);

    await pool.query(`UPDATE player SET ${item} = ${item} + 1 WHERE id = ?`, [
      interaction.user.id,
    ]);
  }

  let [results] = await pool.execute(`SELECT TEAM FROM PLAYER WHERE id = ?`, [
    interaction.user.id,
  ]);
  let flag = null;
  if (results[0].TEAM == "蓝") {
    flag = "🟦";
  } else {
    flag = "🟥";
  }

  const confirm = new EmbedBuilder()
    .setDescription(
      `已对 <@${unlucky}> 取要了一件**__${translatation.get(item)}__**道具`
    )
    .setColor("Green")
    .setAuthor({
      name: `${interaction.user.username} ${flag}`,
      iconURL: `${interaction.user.avatarURL()}`,
    });
  await interaction.reply({
    embeds: [confirm],
    components: [],
  });
  await pool.query(
    `UPDATE player SET TELEPORTER = TELEPORTER - 1 WHERE id = ?`,
    [interaction.user.id]
  );

  await item_disp(origin);
}

async function make_student(origin, interaction) {
  let [results] = await pool.execute(
    `SELECT STUDENT FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].STUDENT === 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("大学生道具不足")
      .setColor("Red");
    await interaction.reply({ embeds: [insufficent], ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });
  const embed = new EmbedBuilder()
    .setDescription("确定要使用🎓大学生\n本道具会使对方队伍取要一个道具")
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

module.exports = make_student;
