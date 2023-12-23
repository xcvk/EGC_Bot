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
    `SELECT EXPLORER FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].EXPLORER <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("探宝专家道具不足")
      .setColor("Red")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`
      });
    await interaction.reply({ embeds: [insufficent],  });
    return;
  }

  const updateQuery = `UPDATE PLAYER SET EXPLORER = EXPLORER - 1 WHERE id = ?`;
  await pool.execute(updateQuery, [interaction.user.id]);
  const [test] = await pool.execute(
    `SELECT JSON_UNQUOTE(JSON_EXTRACT(BUFFS, '$.EXPLORER')) AS EXPLORER
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
          SET BUFFS = JSON_SET(BUFFS, '$.EXPLORER', ${
            Number(test[0].EXPLORER) + quantity
          })
          WHERE ID = ?;`,
    [interaction.user.id]
  );

  const myArray = [
    `<@${interaction.user.id}> 芝麻开门！带我去有宝藏的地方！`,
    `<@${interaction.user.id}> 戴上了精贵的仪器 探照着前方未知的领域....`,
    `<@${interaction.user.id}> 气死我了气死我了！ 老虎不发威你当我是喵呜！ 让我拿出我的探宝秘器，找一找哪里有好用的道具！`,
    `<@${interaction.user.id}> 请出了探宝专家，天下宝藏，为我所有！`,
    `<@${interaction.user.id}> 不要害怕冒险！有时候，只有勇敢地进入未知的领域，才能找到真正珍贵的宝藏。探宝专家来喽~`
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
      SET ITEM_HISTORY = JSON_ARRAY_APPEND(IFNULL(ITEM_HISTORY, '[]'), '$', '🔦探宝专家: 12月 ${date.getDate()}号 ${date.getHours()}时 ${date.getMinutes()}分')
      WHERE ID = ?;`,
    [interaction.user.id]
  );
  await item_disp(origin);
}

async function make_explorer(origin, interaction) {
  let [results] = await pool.execute(
    `SELECT CANT_PASS FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].EXPLORER <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("探宝专家道具不足")
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
    .setDescription("确定要使用🔦__探宝专家__\n本道具会使下一次步行拿到道具")
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

module.exports = make_explorer;
