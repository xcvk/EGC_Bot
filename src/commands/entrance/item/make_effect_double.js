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
    `SELECT EFFECT_DOUBLE FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].EFFECT_DOUBLE <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("双份体验道具不足")
      .setColor("Red")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`
      });
    await interaction.reply({ embeds: [insufficent], });
    return;
  }

  const [buffz] = await pool.execute(`SELECT BUFFS FROM PLAYER WHERE ID = ?`, [
    interaction.user.id,
  ]);

  const updateQuery = `UPDATE PLAYER SET EFFECT_DOUBLE = EFFECT_DOUBLE - 1 WHERE id = ?`;
  await pool.execute(updateQuery, [interaction.user.id]);
  if (buffz[0].BUFFS.EFFECT_DOUBLE > 0) {
    await pool.execute(
      `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.EFFECT_DOUBLE', ${Number(buffz[0].BUFFS.EFFECT_DOUBLE) - 1
      }) WHERE ID = ?;`,
      [interaction.user.id]
    );

    const embed = new EmbedBuilder()
      .setColor("DarkRed")
      .setDescription("不能重复用双份体验道具")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`
      });

    await interaction.reply({ embeds: [embed], });
    await item_disp(origin);
    return;
  }


  const [buffs] = await pool.execute(`SELECT BUFFS FROM PLAYER WHERE ID = ?`, [interaction.user.id]);
  await pool.execute(
    `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.EFFECT_DOUBLE', ${Number(buffs[0].BUFFS.EFFECT_DOUBLE) + 1
    }) WHERE ID = ?;`, [interaction.user.id]
  );

  const myArray = [
    `<@${interaction.user.id}> 都是我的，都是我的！！哈哈哈哈哈哈`,
    `第二个半价都不行！<@${interaction.user.id}> 要的是买一赠一 那只能宠着ta喽~`,
    `优惠大酬宾，<@${interaction.user.id}> 下个道具可以用两次！`,
    `<@${interaction.user.id}> 爽翻了 双份的体验，双份的道具，哎~我有你们没有呢~`,
    `<@${interaction.user.id}> 恭喜你使用了双份体验道具！让敌人体验双倍的“快乐”吧！`
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
      SET ITEM_HISTORY = JSON_ARRAY_APPEND(IFNULL(ITEM_HISTORY, '[]'), '$', '⬆️双份体验: 12月 ${date.getDate()}号 ${date.getHours()}时 ${date.getMinutes()}分')
      WHERE ID = ?;`,
    [interaction.user.id]
  );
  await item_disp(origin);
}

async function make_effect_double(origin, interaction) {
  let [results] = await pool.execute(
    `SELECT EFFECT_DOUBLE FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].EFFECT_DOUBLE <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("双份体验道具不足")
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
      "确定要使用⬆️__双份体验__\n本道具会使下一次使用的道具效果双倍"
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

module.exports = make_effect_double;
