const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require("discord.js");

const pool = require("../../../database/db-promise");
const item_disp = require("./item_disp");
const { col } = require("sequelize");


async function action(origin,interaction) {
    let [results] = await pool.execute(`SELECT TELEPORTER FROM PLAYER WHERE id = ?`, [
    interaction.user.id,
  ]);

    if (results[0].TELEPORTER <= 0) {
        const insufficent = new EmbedBuilder()
        .setDescription("传送门道具不足")
        .setColor("Red");
        await interaction.reply({ embeds: [insufficent],  });
        return;
    }
    const filter = (msg) => !msg.author.bot;
    try {
        
        const collected = await interaction.channel.awaitMessages({
            filter,
            max: 100,
            time: 4000,
            errors: ["time"],
        });
        console.log(collected);

        await pool.execute(
          `UPDATE PLAYER
      SET ITEM_HISTORY = JSON_ARRAY_APPEND(IFNULL(ITEM_HISTORY, '[]'), '$', '🌀传送门')
      WHERE ID = ?;`,
          [interaction.user.id]
        );

        /*
        const messagesArray = collected.array();

        for (const [key, message] of collected) {
          console.log(key);
          console.log(message);
        }
        */
    } catch (error) {
        console.log(error);
    }

  await item_disp(origin);
}







async function make_teleporter(origin, interaction) {
  let [results] = await pool.execute(`SELECT TELEPORTER, TEAM FROM PLAYER WHERE id = ?`, [
    interaction.user.id,
  ]);

  if (results[0].TELEPORTER <= 0) {
    const insufficent = new EmbedBuilder()
      .setDescription("传送门道具不足")
      .setColor("Red");
    await interaction.reply({ embeds: [insufficent],  });
    return;
  }

  await interaction.deferReply({  });
  const embed = new EmbedBuilder()
    .setDescription(
      "确定要使用🌀__传送门__???\n这道具会使敌队和友方队伍交换步数！"
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
        let flag = null;
        if (results[0].TEAM === "蓝") {
          flag = "🟦";
        } else {
          flag = "🟥";
        }
      const embed = new EmbedBuilder()
        .setDescription(
          "请在一分钟里面叫本队伍10个独特的人打出同意\n<@everyone>"
        )
        .setColor("Yellow")
        .setAuthor({
          name: `${interaction.user.username}${flag}`,
          iconURL: `${interaction.user.avatarURL()}`,
        });
      interaction.editReply({components:[]});
      i.reply({ embeds: [embed], components: [],ephemeral:false });
      action(origin, i);
    }
  });
}

module.exports = make_teleporter;
