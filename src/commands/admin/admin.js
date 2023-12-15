const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const {add,subtract} = require("./hack/hack");

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
          { name: "道具", value: "道具" },
          { name: "步数", value: "步数" }
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
          { name: "双份体验", value: "双份体验" },
          { name: "无", value: "None" }
        )
    ),
  async execute(interaction) {
    await interaction.deferReply({  });
    const action = interaction.options.getString("变更");
    const type = interaction.options.getString("种类");
    let player = interaction.options.getString("玩家");
    player = player.substring(2, player.length - 1);
    const quantity = interaction.options.getInteger("数量");
    const item = interaction.options.getString("道具");

    let translationMap = new Map([
      ["路障", "OBSTACLE"],
      ["大学生", "STUDENT"],
      ["此路不通", "CANT_PASS"],
      ["传送门", "TELEPORTER"],
      ["磁铁", "MAGNET"],
      ["跑鞋", "BOOTS"],
      ["无懈可击", "SPELL_SHIELD"],
      ["交换生", "SWAP"],
      ["探宝专家", "EXPLORER"],
      ["双份体验", "EFFECT_DOUBLE"],
    ]);

    switch (action) {
      case "添加":
        if (type === "骰子") {
          await add(player, "DICE", quantity, interaction);
        } else if (type === "道具") {
          await add(player, translationMap.get(item), quantity, interaction);
        } else {
          await add(player,"STEPS",quantity,interaction);
        }
        break;
      case "减少":
        if (type === "骰子") {
          await subtract(player, "DICE", quantity, interaction);
        } else if (type === "道具") {
          await subtract(
            player,
            translationMap.get(item),
            quantity,
            interaction
          );
        } else {
          await subtract(player, "STEPS", quantity, interaction);
        }
        break;
      
    }
    return;
  },
};
