const pool = require("../../../database/db-promise");
const { EmbedBuilder } = require("discord.js");
const reward = require("../get/reward");
const trap = require("../get/trap");
const translation = require("../../../database/translation");
const update = require("../embed/screen");
const nothing = require("../embed/nothing");
const obstacle = require("../get/obstacle");

async function single_use(origin, interaction, rep) {
  const [res] = await pool.execute(
    `SELECT DICE, TEAM FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );
  if (res[0].DICE <= 0) {
    const embed = new EmbedBuilder().setDescription("骰子不足").setColor("Red");

    if (rep) {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    }
    return;
  }

  let team = await pool.execute(`SELECT TEAM FROM PLAYER WHERE id = ?`, [
    interaction.user.id,
  ]);
  if (team[0][0].TEAM === "红") {
    team = "RED_STEPS";
  } else {
    team = "BLUE_STEPS";
  }

  let steps = Math.floor(Math.random() * (7 - 1) + 1);
  await pool.execute(
    `UPDATE TEAMS SET ${team} = ${team} + ${steps} WHERE LINE = 1`
  );

  const rand = Math.floor(Math.random() * (5 - 1) + 1);

  const updateQuery = `UPDATE player SET DICE = DICE - 1 WHERE id = ?`;
  await pool.execute(updateQuery, [interaction.user.id]);
  await pool.execute(
    `UPDATE PLAYER SET STEPS = STEPS + ${steps} WHERE ID = ?`,
    [interaction.user.id]
  );
  const [results] = await pool.execute(
    `SELECT DICE, STEPS FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  let curr_team = res[0].TEAM;
  if (curr_team === "红") {
    const [rows] = await pool.query(
      `SELECT RED_DEBUFFS FROM TEAMS WHERE LINE = 1`
    );
    if (rows[0].RED_DEBUFFS && rows[0].RED_DEBUFFS.length !== 0) {
      if (rows[0].RED_DEBUFFS[0] === "OBSTACLE") {
        const updateQuery = `
          UPDATE TEAMS
          SET RED_DEBUFFS = JSON_REMOVE(RED_DEBUFFS, '$[0]')
          WHERE LINE = 1;
        `;
        await pool.query(updateQuery);
        obstacle(interaction, steps, results[0].DICE, true);
      }

      await update(origin);
      return;
    }

    curr_team = "RED_DEBUFFS";
  } else {
    const [rows] = await pool.query(
      `SELECT BLUE_DEBUFFS FROM TEAMS WHERE LINE = 1`
    );
    if (rows[0].BLUE_DEBUFFS && rows[0].BLUE_DEBUFFS.length !== 0) {
      if (rows[0].BLUE_DEBUFFS[0] === "OBSTACLE") {
        const updateQuery = `
          UPDATE TEAMS
          SET BLUE_DEBUFFS = JSON_REMOVE(BLUE_DEBUFFS, '$[0]')
          WHERE LINE = 1;
        `;
        console.log(steps);
        await pool.query(updateQuery);
        obstacle(interaction, steps, results[0].DICE, true);
      }
      await update(origin);
      return;
    }
    curr_team = "BLUE_DEBUFFS";
  }

  if (rand <= 2) {
    await nothing(interaction, results, steps, rep);
    await update(origin);
  } else if (rand === 3) {
    reward(interaction.user.id).then((res) => {
      const embed = new EmbedBuilder()
        .setDescription(
          `消耗了一颗骰子\n获得道具 **__${translation.get(res)}__** \n\n 
              **前进了__${steps}__步**
              **还剩__${results[0].DICE}__颗骰子** \n**总共走了__${
            results[0].STEPS
          }__步**`
        )
        .setColor("Green")
        .setTitle("获得奖励!!!");
      if (rep) {
        interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        interaction.followUp({ embeds: [embed], ephemeral: true });
      }
    });
    await update(origin);
  } else {
    trap(origin, interaction, steps, results[0].DICE, rep);
  }
}

module.exports = single_use;
