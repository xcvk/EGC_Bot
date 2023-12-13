const { EmbedBuilder } = require("discord.js");
const single_use = require("./single_use");
const pool = require("../../../database/db-promise");
const translation = require("../../../database/translation");

async function multi_use(origin, interaction, current) {
  const embed = new EmbedBuilder()
    .setColor("Green")
    .setDescription("请输入你一次想要用多少骰子");
  await interaction.reply({ embeds: [embed], ephemeral: true });

  const filter = (msg) => msg.author.id === interaction.user.id;

  try {
    // Await user's response
    const collected = await interaction.channel.awaitMessages({
      filter,
      max: 1,
      time: 10000, // You may adjust the time limit in milliseconds
      errors: ["time"],
    });
  
    const amount = parseInt(collected.first().content);


    if (!isNaN(amount) && amount <= current) {
      // Perform the single-use action for each dice roll
      let dice = 0;

      let res = new Map();
      let steps = 0;
      let boot_num = 0;
      let shield = 0;

      let temp = null;
      let stu = new Map();
      for (let iter = 0; iter < amount; ++iter) {
        [dice] = await pool.execute(`SELECT DICE FROM PLAYER WHERE id = ?`,
          [interaction.user.id]
        );
         if (dice[0].DICE <= 0) {
          
          const embed2 = new EmbedBuilder()
            .setColor("Red")
            .setDescription("骰子不足");

          await interaction.followUp({ embeds: [embed2], ephemeral: true });
          break;
        }
        const embed = new EmbedBuilder()
          .setColor("White")
          .setDescription(`正在统计数据。。。\n加载第${iter + 1}枚骰子!`);

        await interaction.editReply({ embeds: [embed], ephemeral: true });


       
        temp = await single_use(origin, interaction, false,false);
        steps += temp[1];
        boot_num += temp[3];
        shield += temp[2];
        if (!res.has(temp[0])) {
          res.set(temp[0],0);
        }
        res.set(temp[0],res.get(temp[0]) + 1);
        if (temp[0] === "⚠️已遭遇陷阱大学生") {
          const translated = translation.get(temp[4]);
          if (!stu.has(translated)) {
            stu.set(translated, 0);
          }
          stu.set(translated, stu.get(translated) + 1);
        }
      }
      const finish = new EmbedBuilder()
      .setColor("Green")
      .setDescription("统计完毕！");
      await interaction.editReply({embeds: [finish]});
      let disp = "";
      let itemz = "";
      res.forEach((value, key) => {
        if (key === "⚠️已遭遇陷阱大学生") {
          stu.forEach((v, k) => {
            itemz += `${k}: **__${v}__**个\n`;
          });
          disp += `-${key}: **__${value}__**次\n\n一共失去了\n${itemz}\n`;
        } else {
          disp += `-${key}: **__${value}__**次\n`;
        };
        
      });
      let boot_string = "";
      if (boot_num > 0) {
        boot_string = `以下用了${boot_num}次跑鞋\n`;
      }
      let shield_string = "";
      if (shield > 0) {
        shield_string = `以下用了${shield}次无懈可击`
      }
      const total = new EmbedBuilder()
      .setDescription(`已用了**__${amount}__**骰子\n${disp}\n以下走了**__${steps}__**步\n${boot_string}${shield_string}`)
      .setTitle(`大冒险统计`)
      .setColor("Gold");
      await interaction.followUp({embeds: [total],ephemeral: true});
      return;
    } else {
      const embed2 = new EmbedBuilder()
        .setColor("Red")
        .setDescription("骰子不足");

      await interaction.followUp({ embeds: [embed2], ephemeral: true });
    }
  } catch (error) {
    // Handle timeout here
    console.log(error);
    const embed3 = new EmbedBuilder()
      .setColor("Yellow")
      .setDescription("操作超时");
    console.log("SOMETHING IS WRONG");
    await interaction.followUp({ embeds: [embed3], ephemeral: true });
  }
}

module.exports = multi_use;
