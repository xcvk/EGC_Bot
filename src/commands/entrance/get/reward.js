const pool = require("../../../database/db-promise");
const { EmbedBuilder } = require("discord.js");
const translation = require("../../../database/translation");

async function reward(interaction, steps, rep, display,id,boot_signal) {
  let common = new Map();

  common.set(1, "OBSTACLE");
  common.set(2, "CANT_PASS");
  common.set(3, "BOOTS");
  common.set(4, "EXPLORER");

  let rare = new Map();
  rare.set(1, "EFFECT_DOUBLE");
  rare.set(2, "STUDENT");
  rare.set(3, "SPELL_SHIELD");

  let legendary = new Map();
  legendary.set(1, "TELEPORTER");
  legendary.set(2, "MAGNET");
  legendary.set(3, "SWAP");

  let random = Math.floor(Math.random() * (101 - 1) + 1);

  let item = null;
  if (random <= 60) {
    const rarity = Math.floor(Math.random() * (5 - 1) + 1);
    item = await common.get(rarity);
  } else if (random > 60 && random <= 97) {
    const rarity = Math.floor(Math.random() * (4 - 1) + 1);
    item = await rare.get(rarity);
  } else {
    const rarity = Math.floor(Math.random() * (4 - 1) + 1);
    item = await legendary.get(rarity);
  }

  if (item !== "SWAP") {
    const updateQuery = `UPDATE PLAYER SET ${item} = ${item} + 1 WHERE id = ?`;
    await pool.execute(updateQuery, [id]);
  }

 if (!display) {
   return item;
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
  const [result] = await pool.execute(
    `SELECT DICE, STEPS FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );
  
  const embed = new EmbedBuilder()
    .setDescription(
      `消耗了一颗骰子\n获得道具 **__${translation.get(item)}__** \n\n 
              **前进了__${steps}__步**
              **还剩__${result[0].DICE}__颗骰子** \n**总共走了__${
        result[0].STEPS
      }__步**
      
      ${boot_message}`
    )
    .setColor("Green")
    .setTitle("获得奖励!!!")
    .setAuthor({
      name: `${interaction.user.username}`,
      iconURL: `${interaction.user.avatarURL()}`
    })
    .setImage("https://cdn.discordapp.com/attachments/1183593675327021096/1187971745030877244/whale_zoe_carton_style_Christmas_themea_cute_deer_opening_a_gif_52d209ef-7f09-4626-bbfb-c86dcd264707.png?ex=6598d3e7&is=65865ee7&hm=e81cbc3e80ef79e211a6a76fdd2eeabe75068d5fc0626f2f09bcd3abe8f19e69&");
  if (rep) {
    await interaction.reply({ embeds: [embed],  });
  } else {
    await interaction.followUp({ embeds: [embed],  });
  }
}

module.exports = reward;
