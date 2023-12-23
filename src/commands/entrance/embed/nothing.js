const { EmbedBuilder } = require("discord.js");
const pool = require("../../../database/db-promise");

async function nothing(interaction, steps, rep,stolen_item,boot_signal) {
  const [results] = await pool.execute(
    `SELECT STEPS, DICE FROM PLAYER WHERE ID = ?`,
    [interaction.user.id]
  );
  
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
  const embed = new EmbedBuilder()
    .setDescription(
      `消耗了一颗骰子\n\n
            **前进了__${steps}__步**
            **还剩__${results[0].DICE}__颗骰子**
            **总共走了__${results[0].STEPS}__步**
            
            ${boot_message}`
    )
    .setColor("White")
    .setTitle("无事发生")
    .setAuthor({
      name: `${interaction.user.username}`,
      iconURL: `${interaction.user.avatarURL()}`
    })
    .setImage("https://cdn.discordapp.com/attachments/1183593675327021096/1187956090994970764/whale_zoe_carton_style_Christmas_theme_a_cute_deer_walking_alon_637d2cb2-45dc-4f04-8551-ebf94f491fe9.png?ex=6598c553&is=65865053&hm=d7236fe9ac8b4386009b2efa03fde3a98f5bef305de9b03510ddf05a03a4fb55&");
  if (rep && stolen_item === 0) {
    await interaction.reply({ embeds: [embed],  });
  } else {
    await interaction.followUp({ embeds: [embed],  });
  }
}

module.exports = nothing;
