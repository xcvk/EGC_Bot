const {
  SlashCommandBuilder,
  ComponentType,
  EmbedBuilder,
} = require("discord.js");

const make_dice = require("./dice/dice.js");
const make_items = require("./item/item.js");
const make_other = require("./other/other.js");
const make_embed = require("./embed/embeds.js");
const checkValueExist = require("../../database/exist.js");
const insert = require("../../database/insert.js");
const single_use = require('../entrance/dice/single_use.js');
const multi_use = require("../entrance/dice/multi_use.js");
const dice_info = require("../../commands/entrance/dice/dice_info.js");
const use_items = require("../../commands/entrance/item/use_items.js");


module.exports = {
  data: new SlashCommandBuilder()
    .setName("小鹿向前冲")
    .setDescription("向前冲！！"),

  async execute(interaction) {
    await interaction.deferReply();
    try {
      // Use await to wait for the result of checkValueExist
      const exists = await new Promise((resolve, reject) => {
        checkValueExist(
          "player",
          "id",
          `${interaction.user.username}`,
          (err, exists) => {
            if (err) {
              console.error("Error in checkValueExist function:", err);
              reject(err);
            } else {
              resolve(exists);
            }
          }
        );
      });

      // Check if the value exists
      if (!exists) {
        // Use await to wait for the result of insert
        await insert(`${interaction.user.username}`);
      }

      // Use await to wait for the result of make_embed
      const res = await make_embed(interaction);
      let color = null;
      let flag = null;
      if (res[0].TEAM === "蓝")
      {
        color = "Blue";
        flag = "🟦";
      }
      else
      {
        flag = "🟥";
        color = "Red";
      }
      // Continue with the rest of your code...
      const embed = new EmbedBuilder()
        .setTitle("小鹿向前冲！！！")
        .setDescription(
          `嘿， 亲爱的 ${interaction.user.username} 我们为了${res[0].TEAM}队冲吧！！\n
        -------------------------------------------------------------`
        )
        .addFields(
          { name: "🎲骰子", value: `${res[0].DICE}`, inline: true },
          { name: "👣步数", value: `${res[0].STEPS}`, inline: true },
          { name: `${flag}队伍`, value: res[0].TEAM, inline: true }
        )
        .setColor(color)
        .setAuthor({
          name: `${interaction.user.username}`,
          iconURL: `${interaction.user.avatarURL()}`,
        });
      const reply = await interaction.editReply({
        embeds: [embed],
        components: [make_dice(), make_items(), make_other()],
      });

      const filter = (i) => i.user.id === interaction.member.id;
      const collector = reply.createMessageComponentCollector({
        ComponentType: ComponentType.Button,
        filter,
      });

      collector.on("collect", (i) => {
        if (i.customId === "单颗使用") {
          single_use(i,true);
          return;
        }
        
        if (i.customId === "批量使用") {
        multi_use(i,res[0].DICE);
        }
        if (i.customId === "获取方法") {
          dice_info(i);
          return;
        }
        
        if (i.customId === "道具") {
          use_items(interaction);
          return;
        }
        if (i.customId === "道具记录") {
          i.reply("yep");
          return;
        }
        if (i.customId === "奖池") {
          i.reply("yep");
          return;
        }
      });
    } catch (e) {
      console.error("Error in execute function:", e);
    }
  },
};
