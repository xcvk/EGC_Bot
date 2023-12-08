const translation = require("../../../database/translation");
const pool = require("../../../database/db-promise");
const { EmbedBuilder } = require("discord.js");

async function student(interaction, steps, rep) {
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
  if (results[0].SWAP >= 1) {
    arr.push("SWAP");
  }
  if (results[0].EXPLORER >= 1) {
    arr.push("EXPLORER");
  }
  if (results[0].EFFECT_DOUBLE >= 1) {
    arr.push("EFFECT_DOUBLE");
  }
  if (arr.length === 0) {
    const updateQuery = `UPDATE player SET DICE = DICE - 1 WHERE id = ?`;
    await pool.execute(updateQuery, [interaction.user.id]);
    const embed = new EmbedBuilder()
      .setDescription(
        `消耗了一颗骰子\n大学生。。?\n 随机减少一个道具如无道具则减少一个骰子 \n 
                减少一枚骰子\n 
                **前进了 __${steps}__步** \n 
                **还剩__${dice}__颗骰子** \n
                **总共走了__${results[0].STEPS}__步**`
      )
      .setColor("Red")
      .setTitle("遭遇陷阱了。。");
    if (rep) {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    }
  } else {
    let random = Math.floor(Math.random() * arr.length + 0);
    const updateQuery = `UPDATE player SET ${arr[random]} = ${arr[random]} - 1 WHERE id = ?`;
    await pool.execute(updateQuery, [interaction.user.id]);

    const embed = new EmbedBuilder()
      .setDescription(
        `消耗了一颗骰子\n大学生。。?\n 
                随机减少一个道具如无道具则减少一个骰子 \n
                **少了一个__${translation.get(arr[random])}__** \n
                **前进了 __${steps}__步**
                **还剩__${dice}__颗骰子**
                **总共走了__${results[0].STEPS}__步**`
      )
      .setColor("Red")
      .setTitle("遭遇陷阱了。。");
    if (rep) {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    }
  }
}

module.exports = student;
