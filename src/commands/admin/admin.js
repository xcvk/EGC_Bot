const {
  SlashCommandBuilder, PermissionFlagsBits} = require("discord.js");


module.exports = {
  data: new SlashCommandBuilder()
    .setName("管理")
    .setDescription("加减玩家的数据")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((action) =>
      action
        .setName("变更")
        .setDescription("添加或者减少一名玩家的骰子/道具数量")
        .setRequired(true)
        .addChoices(
          { name: "添加", value: "添加" },
          { name: "减少", value: "减少" }
        )
    )
    .addStringOption((type) =>
      type
        .setName("种类")
        .setDescription("选择骰子或者道具")
        .setRequired(true)
        .addChoices(
          { name: "骰子", value: "骰子" },
          { name: "道具", value: "道具" }
        )
    )
    .addStringOption((player) =>
      player.setName("玩家").setDescription("选择一名玩家").setRequired(true)
    )
    .addIntegerOption((quantity) =>
      quantity
        .setName("数量")
        .setDescription("要添加或者减少多少呢")
        .setRequired(true)
    )
    .addStringOption((item) =>
      item
        .setName("道具")
        .setDescription("选择一件道具")
        .setRequired(false)
        .addChoices(
          { name: "路障", value: "路障" },
          { name: "大学生", value: "大学生" },
          { name: "此路不通", value: "此路不通" },
          { name: "传送门", value: "传送门" },
          { name: "磁铁", value: "磁铁" },
          { name: "跑鞋", value: "跑鞋" },
          { name: "无懈可击", value: "无懈可击" },
          { name: "交换生", value: "交换生" },
          { name: "探宝专家", value: "探宝专家" },
          { name: "双份体验", value: "双份体验" }
        )
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply("yes");
    return;
  },
};