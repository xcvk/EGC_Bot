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
  let [results] = await pool.execute(`SELECT BOOTS FROM PLAYER WHERE id = ?`, [
    interaction.user.id,
  ]);

  if (results[0].BOOTS <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("跑鞋道具不足")
      .setColor("Red")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`
      });
    await interaction.reply({ embeds: [insufficent],  });
    return;
  }

  
  const updateQuery = `UPDATE PLAYER SET BOOTS = BOOTS - 1 WHERE id = ?`;
  await pool.execute(updateQuery, [interaction.user.id]);
  const [test] = await pool.execute(
    `SELECT JSON_UNQUOTE(JSON_EXTRACT(BUFFS, '$.BOOTS')) AS BOOTS
      FROM PLAYER
      WHERE ID = ?;`,
    [interaction.user.id]
  );
  await pool.execute(
    `UPDATE PLAYER
          SET BUFFS = JSON_SET(BUFFS, '$.BOOTS', ${Number(test[0].BOOTS) + 1})
          WHERE ID = ?;`,
    [interaction.user.id]
  );

  const myArray = [
    `<@${interaction.user.id}> 使用了跑鞋，穿上后要起飞喽～`,
    `<@${interaction.user.id}> 速度与激情，就在你的脚下。跑鞋，启动！`,
    `<@${interaction.user.id}> 不是所有的英雄都穿披风，有些人选择跑鞋。`,
    `<@${interaction.user.id}> 让对手只看到你的背影！跑鞋，赋予你前所未有的速度！`,
    `<@${interaction.user.id}> 跑鞋在呼唤，赛道在等待。准备好了吗？`
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
      SET ITEM_HISTORY = JSON_ARRAY_APPEND(IFNULL(ITEM_HISTORY, '[]'), '$', '👟跑鞋: 12月 ${date.getDate()}号 ${date.getHours()}时 ${date.getMinutes()}分')
      WHERE ID = ?;`,[interaction.user.id]
  );
  await item_disp(origin);
}

async function make_boots(origin, interaction) {
  let [results] = await pool.execute(
    `SELECT BOOTS FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  if (results[0].BOOTS <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("跑鞋道具不足")
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
    .setDescription("确定要使用👟__跑鞋__\n本道具会使下一次掷骰子在1~12里面选")
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

module.exports = make_boots;
