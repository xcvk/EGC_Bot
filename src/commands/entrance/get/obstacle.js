const pool = require("../../../database/db-promise");
const {EmbedBuilder} = require("discord.js");


async function obstacle(interaction,steps,dice,rep) {
    const [results] = await pool.execute(`SELECT * FROM PLAYER WHERE id = ?`, [
      interaction.user.username,
    ]);

    let team = null;
    if (results[0].TEAM === "红") {
      team = "RED_STEPS";
    } else {
      team = "BLUE_STEPS";
    }

    let [total_step] = await pool.execute(
      `SELECT ${team} FROM TEAMS WHERE LINE = 1`
    );

    if (team == "RED_STEPS") {
      total_step = total_step[0].RED_STEPS;
    } else {
      total_step = total_step[0].BLUE_STEPS;
    }

    
    await pool.execute(
      `UPDATE player SET STEPS = STEPS - ${steps} WHERE id = ?`,
      [interaction.user.username]
    );

    await pool.execute(
      `UPDATE TEAMS SET ${team} = ${team} - ${steps} WHERE LINE = 1`
    );
    const embed = new EmbedBuilder()
      .setDescription(
        `消耗了一颗骰子\n路障 \n 无法行动 \n\n **还剩__${dice}__颗骰子** \n**总共走了__${
          total_step - steps
        }__步**`
      )
      .setColor("Red")
      .setTitle("遭遇陷阱了。。");

    if (rep) {
      interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      interaction.followUp({ embeds: [embed], ephemeral: true });
    }
}

module.exports = obstacle;