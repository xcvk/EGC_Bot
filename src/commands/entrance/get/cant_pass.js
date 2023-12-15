const pool = require("../../../database/db-promise");
const { EmbedBuilder } = require("discord.js");

async function cant_pass(interaction, steps, rep) {
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

  const embed = new EmbedBuilder()
    .setDescription("此路不通")
    .setDescription(
      `消耗了一颗骰子
            随机倒退1~12步
            **倒退了__${random}__步**\n\n 
            **前进了__${steps}__步**
            **还剩__${dice}__颗骰子**
            **总共走了__${result[0].STEPS}__步**`
    )
    .setColor("Red")
    .setTitle("遭遇陷阱了。。");

  if (rep) {
    await interaction.reply({ embeds: [embed],  });
  } else {
    await interaction.followUp({ embeds: [embed],  });
  }
}

module.exports = cant_pass;
