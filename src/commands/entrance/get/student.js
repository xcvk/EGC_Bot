const translation = require("../../../database/translation");
const pool = require("../../../database/db-promise");
const { EmbedBuilder } = require("discord.js");

async function student(interaction, steps, rep,display,boot_signal) {
  const [results] = await pool.execute(`SELECT * FROM PLAYER WHERE id = ?`, [
    interaction.user.id,
  ]);
  const dice = results[0].DICE;

  let arr = [];
  if (results[0].OBSTACLE >= 1) {
    arr.push("OBSTACLE");
  }

  if (results[0].STUDENT >= 1) {
    arr.push("STUDENT");
  }

  if (results[0].CANT_PASS >= 1) {
    arr.push("CANT_PASS");
  }
  if (results[0].TELEPORTER >= 1) {
    arr.push("TELEPORTER");
  }
  if (results[0].MAGNET >= 1) {
    arr.push("MAGNET");
  }
  if (results[0].BOOTS >= 1) {
    arr.push("BOOTS");
  }
  if (results[0].SPELL_SHIELD >= 1) {
    arr.push("SPELL_SHIELD");
  }
  if (results[0].SWAP[0] >= 1) {
    arr.push("SWAP");
  }
  if (results[0].EXPLORER >= 1) {
    arr.push("EXPLORER");
  }
  if (results[0].EFFECT_DOUBLE >= 1) {
    arr.push("EFFECT_DOUBLE");
  }
  if (arr.length === 0) {
    const updateQuery = `UPDATE PLAYER SET DICE = DICE - 1 WHERE id = ?`;
    await pool.execute(updateQuery, [interaction.user.id]);
    if (display) {
      const embed = new EmbedBuilder()
        
        .setDescription(
          `消耗了一颗骰子\n大学生。。?\n随机减少一个道具如无道具则减少一个骰子 \n 
                减少一枚骰子\n 
                **前进了 __${steps}__步** \n 
                **还剩__${dice}__颗骰子** \n
                **总共走了__${results[0].STEPS}__步**`
        )
        .setColor("Red")
        .setTitle("遭遇陷阱了。。")
        .setImage("https://cdn.discordapp.com/attachments/1183593675327021096/1187963478871375952/whale_zoe_carton_style_Christmas_themea_cute_deer_walking_into__1d54d079-a199-4229-b33e-724f9bbaecfa.png?ex=6598cc34&is=65865734&hm=56abd39afc003b89ff000def47311426537a08127d37335f2d7e44202b7b3b2d&")
        .setAuthor({
          name: `${interaction.user.username}`,
          iconURL: `${interaction.user.avatarURL()}`
        })
       ;
      if (rep) {
        await interaction.reply({ embeds: [embed],  });
      } else {
        await interaction.followUp({ embeds: [embed],  });
      }
    } else {
      return "减少了骰子";
    }
    
  } else {
    let random = Math.floor(Math.random() * arr.length + 0);
    if (arr[random] === "SWAP") {
       await pool.execute(
                `UPDATE PLAYER
                  SET SWAP = JSON_SET(SWAP, '$[0]', ${results[0].SWAP[0] - 1}, '$[1]', '${results[0].SWAP[1]}')
                  WHERE ID = ?;`,
                            [interaction.user.id]
              );
    } else {
      const updateQuery = `UPDATE PLAYER SET ${arr[random]} = ${arr[random]} - 1 WHERE id = ?`;
      await pool.execute(updateQuery, [interaction.user.id]);
    }
    
    
    let boot_message = "";
    if (boot_signal) {
      const myArray = [
        `<@${interaction.user.id}> 你感到一股力量涌上心头，跑鞋已经触发！`,
        `<@${interaction.user.id}> 瞬间加速！跑鞋如同闪电般带你前进！`,
        `<@${interaction.user.id}> 一道光闪过，你已经远在千里之外。跑鞋，太神奇了！`,
        `<@${interaction.user.id}> 跑鞋效果发动！现在，连风都追不上你了！`,
        `<@${interaction.user.id}> 如此速度，仿佛时间都在你脚下缓慢流淌。`
      ];
      boot_message += myArray[Math.floor(Math.random() * (myArray.length))];
    }

   if (display) {
     const embed = new EmbedBuilder()
       .setDescription(
         `消耗了一颗骰子\n大学生。。?\n 
                随机减少一个道具如无道具则减少一个骰子 \n
                **少了一个__${translation.get(arr[random])}__** \n
                **前进了 __${steps}__步**
                **还剩__${dice}__颗骰子**
                **总共走了__${results[0].STEPS}__步**
                
                ${boot_message}`
       )
       .setImage("https://cdn.discordapp.com/attachments/1183593675327021096/1187963478871375952/whale_zoe_carton_style_Christmas_themea_cute_deer_walking_into__1d54d079-a199-4229-b33e-724f9bbaecfa.png?ex=6598cc34&is=65865734&hm=56abd39afc003b89ff000def47311426537a08127d37335f2d7e44202b7b3b2d&")
       .setColor("Red")
       .setTitle("遭遇陷阱了。。")
       .setAuthor({
         name: `${interaction.user.username}`,
         iconURL: `${interaction.user.avatarURL()}`
       });
     if (rep) {
       await interaction.reply({ embeds: [embed],  });
     } else {
       await interaction.followUp({ embeds: [embed],  });
     }
   } else {
    return arr[random];
   }




  }
}

module.exports = student;
