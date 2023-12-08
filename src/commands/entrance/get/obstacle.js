const pool = require("../../../database/db-promise");
const { EmbedBuilder } = require("discord.js");

async function obstacle(interaction, steps, rep) {


  const [results] = await pool.execute(`SELECT * FROM PLAYER WHERE id = ?`, [
    interaction.user.id,
  ]);

  let team = null;
  if (results[0].TEAM === "蓝") {
    team = "BLUE_STEPS";
  }
  else
  {
    team = "RED_STEPS";
  }
  
  await pool.execute(
    `UPDATE TEAMS SET ${team} = ${team} - ${steps} WHERE LINE = 1`
  );
  await pool.execute(
    `UPDATE PLAYER SET STEPS = STEPS - ${steps} WHERE ID = ?`,
    [interaction.user.id]
  );


  

  const dice = results[0].DICE;
  if (results[0].TEAM === "红") {
    team = "RED_STEPS";
    const [test] =
      await pool.execute(`SELECT JSON_UNQUOTE(JSON_EXTRACT(RED_DEBUFFS, '$.OBSTACLE')) AS OBSTACLE
      FROM TEAMS
      WHERE LINE = 1;`);
    await pool.execute(`UPDATE TEAMS
          SET RED_DEBUFFS = JSON_SET(RED_DEBUFFS, '$.OBSTACLE', ${
            Number(test[0].OBSTACLE) - 1
          })
          WHERE LINE = 1;`);
  } else {
    team = "BLUE_STEPS";
    const [test] = await pool.execute(`SELECT JSON_UNQUOTE(JSON_EXTRACT(BLUE_DEBUFFS, '$.OBSTACLE')) AS OBSTACLE
      FROM TEAMS
      WHERE LINE = 1;`);
    await pool.execute(`UPDATE TEAMS
          SET BLUE_DEBUFFS = JSON_SET(BLUE_DEBUFFS, '$.OBSTACLE', ${
            Number(test[0].OBSTACLE) - 1})
          WHERE LINE = 1;`);
  }




  const embed = new EmbedBuilder()
    .setDescription(
      `消耗了一颗骰子\n路障 \n 无法行动 \n\n **还剩__${dice}__颗骰子** \n**总共走了__${results[0].STEPS}__步**`
    )
    .setColor("Red")
    .setTitle("遭遇陷阱了。。");

  if (rep) {
    await interaction.reply({ embeds: [embed], ephemeral: true });
  } else {
    await interaction.followUp({ embeds: [embed], ephemeral: true });
  }
}

module.exports = obstacle;
