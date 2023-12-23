const pool = require("../../../database/db-promise");
const { EmbedBuilder } = require("discord.js");

async function cant_pass(interaction, steps, rep,caster,boot_signal) {
  const [results] = await pool.execute(`SELECT * FROM PLAYER WHERE id = ?`, [
    interaction.user.id,
  ]);

  const dice = results[0].DICE;
  let team = null;
  if (results[0].TEAM === "红") {
    team = "RED_STEPS";
  } else {
    team = "BLUE_STEPS";
  }

  let random = Math.floor(Math.random() * (13 - 1) + 1);
  await pool.execute(
    `UPDATE PLAYER SET STEPS = STEPS - ${random} WHERE id = ?`,
    [interaction.user.id]
  );
  await pool.execute(
    `UPDATE TEAMS SET ${team} = ${team} - ${random} WHERE LINE = 1`
  );

  const [result] = await pool.execute(`SELECT STEPS FROM PLAYER WHERE id = ?`, [
    interaction.user.id,
  ]);

  let trapped = "";
  if (caster) {
    const myArray = [
      `被<@${caster}> 放下的陷阱此路不通给逮到了，<@${interaction.user.id}>只能被迫倒退！`,
      `<@${caster}> 将 <@${interaction.user.id}> 逼到了墙角，37度的嘴说出来冷冰冰的话" 把你的奖品拿出来！“`,
      `路上突然出现了<@${caster}>放置的障碍，<@${interaction.user.id}>没有选择，只能悻悻地后退！`,
      `哦不，<@${interaction.user.id}>感觉到时空扭曲，原来是<@${caster}>发动了此路不通的魔咒，你被迫倒退！`,
      `就像命运的玩笑，<@${interaction.user.id}>，你被<@${caster}>设置的障碍卡住了，只能后退！`
    ];
    trapped += myArray[Math.floor(Math.random() * (myArray.length))];
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
  const embed = new EmbedBuilder()
    .setDescription(
      `消耗了一颗骰子
            此路不通
            随机倒退1~12步
            **倒退了__${random}__步**\n\n 
            **前进了__${steps}__步**
            **还剩__${dice}__颗骰子**
            ${trapped}
            **总共走了__${result[0].STEPS}__步**
            
            ${boot_message}`
    )
    .setColor("Red")
    .setTitle("遭遇陷阱了。。")
    .setAuthor({
      name: `${interaction.user.username}`,
      iconURL: `${interaction.user.avatarURL()}`
    })
    .setImage("https://cdn.discordapp.com/attachments/1183593675327021096/1187963478871375952/whale_zoe_carton_style_Christmas_themea_cute_deer_walking_into__1d54d079-a199-4229-b33e-724f9bbaecfa.png?ex=6598cc34&is=65865734&hm=56abd39afc003b89ff000def47311426537a08127d37335f2d7e44202b7b3b2d&");

  if (rep) {
    await interaction.reply({ embeds: [embed],  });
  } else {
    await interaction.followUp({ embeds: [embed],  });
  }
}

module.exports = cant_pass;
