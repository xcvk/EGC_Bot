const { EmbedBuilder } = require("discord.js");
const single_use = require("./single_use");
const pool = require("../../../database/db-promise");
const translation = require("../../../database/translation");

async function multi_use(origin, interaction, current) {
  const embed = new EmbedBuilder()
    .setColor("Green")
    .setDescription("请输入你一次想要用多少骰子")
    .setAuthor({
      name: `${interaction.user.username}`,
      iconURL: `${interaction.user.avatarURL()}`,
    });
  await interaction.reply({ embeds: [embed],  });

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


      let stolen_items = [];


      let obstacle_immune = [];
      let obstacle = [];

      let cant_pass = [];
      let cant_pass_immune = [];

      let stop = "";

      let new_amount = 0;
      for (let iter = 0; iter < amount; ++iter) {
        
        [dice] = await pool.execute(`SELECT DICE, TEAM, DICE_USED FROM PLAYER WHERE id = ?`,
          [interaction.user.id]
        );
         if (dice[0].DICE <= 0) {
          
          const embed2 = new EmbedBuilder()
            .setColor("Red")
            .setDescription("骰子不足")
            .setAuthor({
              name: `${interaction.user.username}`,
              iconURL: `${interaction.user.avatarURL()}`,
            });

          await interaction.followUp({ embeds: [embed2] });
          break;
        }

        const [limit] = await pool.execute(`SELECT DAILY_LIMIT FROM TEAMS WHERE LINE = 1`);
        if (dice[0].DICE_USED === limit[0].DAILY_LIMIT) {
          const embedl = new EmbedBuilder().setDescription("已用到了每日限量，请等到明天吧")
            .setColor("Red")
            .setAuthor({
              name: `${interaction.user.username}`,
              iconURL: `${interaction.user.avatarURL()}`,
            });

            await interaction.followUp({ embeds: [embedl], });
            break;
          }
          
        new_amount += 1;


        const embed = new EmbedBuilder()
          .setColor("White")
          .setDescription(`正在统计数据。。。\n加载第${iter + 1}枚骰子!`)
          .setAuthor({
        name: `${interaction.user.username}`, 
        iconURL: `${interaction.user.avatarURL()}`});

        await interaction.editReply({ embeds: [embed] });
       
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
        } else if (temp[0] === "无事发生") {
          if (temp[5] !== 0) {
            stolen_items.push([temp[4],temp[5]]);
          }
        } else if (temp[0] === "🛡️已免疫陷阱路障") {
          if (temp[4]) {
            obstacle_immune.push(temp[4]);
          }
        } else if (temp[0] === "⚠️已遭遇陷阱路障") {
          if (temp[4]) {
            obstacle.push(temp[4]);
          }
        } else if (temp[0] === "🛡️已免疫陷阱此路不通") {
          if (temp[4]) {
            cant_pass_immune.push(temp[4]);
          }
        } else if (temp[0] === "⚠️已遭遇陷阱此路不通") {
          if (temp[4]) {
            cant_pass.push(temp[4]);
          }
        }
        if (dice[0].TEAM === "红") {
          const [red_team] = await pool.execute("SELECT RED_STEPS FROM TEAMS WHERE LINE = 1");
          if (red_team[0].RED_STEPS > 5000) {
            stop += `\n\n你是突破己队5000步的人，\n我们把你的批量使用暂停了`;
            break;
          }
        } else {
          const [blue_team] = await pool.execute("SELECT BLUE_STEPS FROM TEAMS WHERE LINE = 1");
          if (blue_team[0].BLUE_STEPS > 5000) {
            stop += `\n\n你是突破己队5000步的人，\n我们把你的批量使用暂停了`;
            break;
          }
        }
      }
      
      let disp = "";
      let itemz = "";

      let sortedArray = Array.from(res.entries());
      sortedArray.sort((a, b) => a[0].localeCompare(b[0]));
      let sortedMap = new Map(sortedArray);

      let theifs = "";
      
      let already = false;

      let obs_imm = "";
      let cant_imm = "";

      let obs = "";
      let cant = "";

      sortedMap.forEach((value, key) => {
        if (key === "⚠️已遭遇陷阱大学生") {
          stu.forEach((v, k) => {
            if (!k) {
              k = "失去骰子";
            }
            itemz += `${k}: **__${v}__**个\n`;
          });
          disp += `-${key}: **__${value}__**次\n\n一共失去了\n${itemz}\n`;
        } else if (key === "无事发生") {
          for (let i = 0; i < stolen_items.length; ++i) {
            theifs += `${translation.get(stolen_items[i][0])} 被 <@${stolen_items[i][1]}>偷走了\n`;
          }
          disp += `-${key}: **__${value}__**次\n\n${theifs}`
        } else if (key === "🛡️已免疫陷阱路障") {
          if (obstacle_immune.length !== 0) {
            for (let i = 0; i < obstacle_immune.length; ++i) {
              obs_imm += `已免疫被 <@${obstacle_immune[i]}> 下的陷阱路障\n`;
            }
          }
          disp += `-${key}: **__${value}__**次\n\n${obs_imm}`;
        } else if (key === "🛡️已免疫陷阱此路不通") {
          if (cant_pass_immune.length !== 0) {
             for (let i = 0; i < cant_pass_immune.length; ++i) {
              cant_imm += `已免疫被 <@${cant_pass_immune[i]}> 下的陷阱此路不通\n`;
            }
          }
          disp += `-${key}: **__${value}__**次\n\n${cant_imm}`;
        } else if (key === "⚠️已遭遇陷阱路障") {
          if (obstacle.length !== 0) {
            for (let i = 0; i < obstacle.length; ++i) {
              obs += `已遭遇被 <@${obstacle[i]}> 下的陷阱路障\n`;
            }
          }
          disp += `-${key}: **__${value}__**次\n\n${obs}`;
        } else if (key === "⚠️已遭遇陷阱此路不通") {
          if (cant_pass.length !== 0) {
            for (let i = 0; i < cant_pass.length; ++i) {
              cant += `已遭遇被 <@${cant_pass[i]}> 下的陷阱此路不通\n`;
            }
          }
          disp += `-${key}: **__${value}__**次\n\n${cant}`;
        } else {
          if (key.includes("🎉") && !already) {
            disp += "\n";
            already = true;
          }
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
    .setDescription(`已用了**__${new_amount}__**骰子\n${disp}\n总共走了**__${steps}__**步\n${boot_string}${shield_string}\n${stop}`)
    .setTitle(`大冒险统计`)
    .setColor("Gold")
    .setAuthor({
      name: `${interaction.user.username}`,
      iconURL: `${interaction.user.avatarURL()}`,
    });

    const totalMessage = await interaction.followUp({embeds: [total],});

    const finish = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`统计完毕！\n[查看详细统计](${totalMessage.url})`)
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`,
      });

    await interaction.editReply({embeds: [finish]});
    return;
        } else {
      const embed2 = new EmbedBuilder()
        .setColor("Red")
        .setDescription("骰子不足")
        .setAuthor({
          name: `${interaction.user.username}`,
          iconURL: `${interaction.user.avatarURL()}`,
        });

      await interaction.followUp({ embeds: [embed2],ephemeral:true});
    }
  } catch (error) {
    // Handle timeout here
    console.log(error);
    const embed3 = new EmbedBuilder()
      .setColor("Yellow")
      .setDescription("操作超时")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`,
      });
    await interaction.followUp({ embeds: [embed3],  });
  }
}

module.exports = multi_use;
