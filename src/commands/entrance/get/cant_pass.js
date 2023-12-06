const pool = require("../../../database/db-promise");
const { EmbedBuilder } = require("discord.js");

async function cant_pass(interaction, steps, dice, rep) {
  const [results] = await pool.execute(`SELECT * FROM PLAYER WHERE id = ?`, [
    interaction.user.id,
  ]);

  let team = null;
  if (results[0].TEAM === "红") {
    team = "RED_STEPS";
  } else {
    team = "BLUE_STEPS";
  }

  let random = Math.floor(Math.random() * (13 - 1) + 1);
  await pool.execute(
    `UPDATE player SET STEPS = STEPS - ${random} WHERE id = ?`,
    [interaction.user.id]
  );
  await pool.execute(
    `UPDATE TEAMS SET ${team} = ${team} - ${random} WHERE LINE = 1`
  );
  let [total_step] = await pool.execute(
    `SELECT ${team} FROM TEAMS WHERE LINE = 1`
  );

  if (team == "RED_STEPS") {
    total_step = total_step[0].RED_STEPS;
  } else {
    total_step = total_step[0].BLUE_STEPS;
  }
  const embed = new EmbedBuilder()
    .setDescription("此路不通")
    .setDescription(
      `消耗了一颗骰子
            随机倒退1~12步
            **倒退了__${random}__步**\n\n 
            **前进了__${steps}__步**
            **还剩__${dice}__颗骰子**
            **总共走了__${total_step}__步**`
    )
    .setColor("Red")
    .setTitle("遭遇陷阱了。。");

  if (rep) {
    interaction.reply({ embeds: [embed], ephemeral: true });
  } else {
    interaction.followUp({ embeds: [embed], ephemeral: true });
  }
}

module.exports = cant_pass;
