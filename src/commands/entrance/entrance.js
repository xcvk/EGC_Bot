const {
  SlashCommandBuilder,
  ComponentType,
} = require("discord.js");

const make_dice = require("./dice/dice.js");
const make_items = require("./item/item.js");
const make_other = require("./other/other.js");
const checkValueExist = require("../../database/exist.js");
const insert = require("../../database/insert.js");
const update = require("./embed/screen.js");
const multi_use = require("../entrance/dice/multi_use.js");
const dice_info = require("../../commands/entrance/dice/dice_info.js");
const use_items = require("../../commands/entrance/item/use_items.js");
const single_use = require("./dice/single_use.js");
const pool = require("../../database/db-promise.js");
const item_hist = require("../entrance/item/item_hist.js");
const prizes = require("../entrance/other/prizes.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("小鹿向前冲")
    .setDescription("向前冲！！"),

  async execute(interaction) {
    await interaction.deferReply();


      // Use await to wait for the result of checkValueExist
      const exists = await checkValueExist("PLAYER","ID",interaction.user.id,false);
      // Check if the value exists
      if (!exists) {
        // Use await to wait for the result of insert
        await insert(`${interaction.user.id}`);
      }
      await update(interaction);
      // Use await to wait for the result of make_embed
      
      const reply = await interaction.editReply({
        components: [make_dice(), make_items(), make_other()],
      });

      const filter = (i) => i.user.id === interaction.member.id;
      const [res] = await pool.execute(`SELECT DICE FROM PLAYER WHERE id = ?`, [
        interaction.user.id,
      ]);
      const collector = reply.createMessageComponentCollector({
        ComponentType: ComponentType.Button,
        filter,
      });

      collector.on("collect", (i) => {
        if (i.customId === "单颗使用") {
          single_use(interaction,i,true,true);
          return;
        }
        
        if (i.customId === "批量使用") {
          
          multi_use(interaction,i,res[0].DICE);
        }
        if (i.customId === "获取方法") {
          dice_info(i);
          return;
        }
        
        if (i.customId === "道具") {
          use_items(i);
          return;
        }
        if (i.customId === "道具记录") {
          item_hist(i);
          return;
        }
        if (i.customId === "奖池") {
          prizes(i);
          return;
        }
        if (i.customId === "奖品") {
          ;
          return;
        }
      });
      
  },
};
