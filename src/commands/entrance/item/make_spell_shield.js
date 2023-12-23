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
    `SELECT SPELL_SHIELD FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].SPELL_SHIELD <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("无懈可击道具不足")
      .setColor("Red")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`
      });
    await interaction.reply({ embeds: [insufficent],  });
    return;
  }

  const updateQuery = `UPDATE PLAYER SET SPELL_SHIELD = SPELL_SHIELD - 1 WHERE id = ?`;
  await pool.execute(updateQuery, [interaction.user.id]);
  const [test] = await pool.execute(
    `SELECT JSON_UNQUOTE(JSON_EXTRACT(BUFFS, '$.SPELL_SHIELD')) AS SPELL_SHIELD
      FROM PLAYER
      WHERE ID = ?;`,
    [interaction.user.id]
  );

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
  
  await pool.execute(
    `UPDATE PLAYER
          SET BUFFS = JSON_SET(BUFFS, '$.SPELL_SHIELD', ${
            Number(test[0].SPELL_SHIELD) + quantity
          })
          WHERE ID = ?;`,
    [interaction.user.id]
  );
  
  const myArray = [
    `<@${interaction.user.id}> 哈哈哈！使用了无懈可击~本王天下无敌！`,
    `<@${interaction.user.id}> 掐指一算，心里暗想不妙， 似乎命中有一劫，赶紧使用了无懈可击`,
    `在旅途中，<@${interaction.user.id}> 突然感觉到命运似乎有一劫降临。你迅速使用了无懈可击，以保护自己免受任何可能的危险或意外`,
    `<@${interaction.user.id}> 叉腰大喊一声，无懈可击。biubiubiubiu`,
    `<@${interaction.user.id}> 谨慎行动！通过使用无懈可击来无效化陷阱，你可以破坏对手的计划并获得更大的优势。`
  ];
  const confirm = new EmbedBuilder()
    .setDescription(myArray[Math.floor(Math.random() * (myArray.length))])
    .setColor("Green")
    .setAuthor({
      name: `${interaction.user.username}`,
      iconURL: `${interaction.user.avatarURL()}`,
    });
  await interaction.reply({
    embeds: [confirm],
    components: [],
  });
  const date = new Date();
  await pool.execute(
    `UPDATE PLAYER
      SET ITEM_HISTORY = JSON_ARRAY_APPEND(IFNULL(ITEM_HISTORY, '[]'), '$', '🛡️无懈可击: 12月 ${date.getDate()}号 ${date.getHours()}时 ${date.getMinutes()}分')
      WHERE ID = ?;`,
    [interaction.user.id]
  );
  await item_disp(origin);
}

async function make_spell_shield(origin, interaction) {
  let [results] = await pool.execute(
    `SELECT CANT_PASS FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].SPELL_SHIELD <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("无懈可击道具不足")
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
    .setDescription("确定要使用🛡️__无懈可击__\n本道具会使下一次陷阱失效")
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

module.exports = make_spell_shield;
