const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");
const make_obstacles = require("./make_obstacles");
const item_disp = require("./item_disp");
const make_student = require("./make_student");



async function use_items(interaction) {
    await interaction.deferReply({ephemeral: true});

    await item_disp(interaction);
    const reply = await interaction.editReply({
      components: [new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("路障")
        .setLabel("路障")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("大学生")
        .setLabel("大学生")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("此路不通")
        .setLabel("此路不通")
        .setStyle(ButtonStyle.Primary)),
        new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("传送门")
        .setLabel("传送门")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("磁铁")
        .setLabel("磁铁")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("跑鞋")
        .setLabel("跑鞋")
        .setStyle(ButtonStyle.Primary)),
        new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("无懈可击")
        .setLabel("无懈可击")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("交换生")
        .setLabel("交换生")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("探宝专家")
        .setLabel("探宝专家")
        .setStyle(ButtonStyle.Primary)),
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("双份体验")
            .setCustomId("双份体验")
            .setStyle(ButtonStyle.Primary))],
      ephemeral: true
    });


    const filter = (i) => i.user.id === interaction.member.id;
      const collector = reply.createMessageComponentCollector({
        ComponentType: ComponentType.Button,
        filter,
      });

      collector.on("collect", (i) => {
        if (i.customId === "路障") {
          
          make_obstacles(interaction,i);
          return;
        }

        if (i.customId === "大学生") {
          make_student(interaction,i);
          return;
        }

        if (i.customId === "2") {
          obstacle(i);
          return;
        }
      });
}

module.exports = use_items;