const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require("discord.js");

const pool = require("../../../database/db-promise");
const item_disp = require("./item_disp");



async function action(origin,i) {

    await item_disp(origin);
}





async function make_magnet(origin,interaction) {
    let [results] = await pool.execute(
    `SELECT CANT_PASS, TEAM FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
    );

    if (results[0].CANT_PASS <= 0) {
    const insufficent = new EmbedBuilder()
        .setDescription("磁铁道具不足")
        .setColor("Red");
    await interaction.reply({ embeds: [insufficent], ephemeral: true });
    return;
    }

    await interaction.deferReply({ ephemeral: true });
    const embed = new EmbedBuilder()
      .setDescription("确定要使用🧲__磁铁__\n本道具会使五分钟内对方获取的道具分配给己方队伍成员,使用者获得第一个")
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

module.exports = make_magnet;