const pool = require("../../../database/db-promise");
const { EmbedBuilder } = require("discord.js");
const reward = require("../get/reward");

const update = require("../embed/screen");
const nothing = require("../embed/nothing");
const obstacle = require("../get/obstacle");
const student = require("../../entrance/get/student");
const cant_pass = require("../../entrance/get/cant_pass");

async function single_use(origin, interaction, rep,display) {
  const [results] = await pool.execute(
    `SELECT DICE, TEAM FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  // MAKE SURE THEY HAVE ENOUGH DICE
  if (results[0].DICE <= 0) {
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



  // TAKE DICE AWAY FROM PLAYER AKA THEY PAY THE PRICE
  const updateQuery = `UPDATE player SET DICE = DICE - 1 WHERE id = ?`;
  await pool.execute(updateQuery, [interaction.user.id]);
  
  let trap = null;
  const immune = new EmbedBuilder().setDescription(`已免疫陷阱${trap}`).setColor("Green");




  // SEE IF SPELL_SHIELD EXIST AND PROTECT
  const [shield] =
    await pool.execute(`SELECT JSON_UNQUOTE(JSON_EXTRACT(BUFFS, '$.SPELL_SHIELD')) AS SPELL_SHIELD
      FROM PLAYER
      WHERE ID = ?;`,[interaction.user.id]);


  const shields = Number(shield[0].SPELL_SHIELD);

  // CHECK FOR OBSTACLE TRAPS AKA SELF TEAM DEBUFFS
  let curr_team = results[0].TEAM;
  if (curr_team === "红") 
  {
    const [test] = await pool.execute(`SELECT JSON_UNQUOTE(JSON_EXTRACT(RED_DEBUFFS, '$.OBSTACLE')) AS OBSTACLE
      FROM TEAMS
      WHERE LINE = 1;`);
    
    if (Number(test[0].OBSTACLE) > 0) 
    {

      if (shields > 0)
      {
        await pool.execute(`UPDATE PLAYER
        SET BUFFS = JSON_SET(BUFFS, '$.SPELL_SHIELD', ${
          shields - 1
        })
        WHERE ID = ?;`,[interaction.user.id]);
        trap = "路障";
      }
      else
      {
        await obstacle(interaction, results[0].DICE, rep);
      }

      await origin.followUp({embeds: [immune],ephemeral:true});
      await pool.execute(`UPDATE TEAMS
      SET BLUE_DEBUFFS = JSON_SET(RED_DEBUFFS, '$.OBSTACLE', ${Number(test[0].OBSTACLE) - 1})
      WHERE LINE = 1;`);
      await update(origin);
      return;
    }

    curr_team = "RED_DEBUFFS";
  } 
  else 
  {
    const [test] = await pool.execute(`SELECT JSON_UNQUOTE(JSON_EXTRACT(BLUE_DEBUFFS, '$.OBSTACLE')) AS OBSTACLE
      FROM TEAMS
      WHERE LINE = 1;`);
    
    if (Number(test[0].OBSTACLE) > 0) 
    {

      if (shields > 0) {
        await pool.execute(
          `UPDATE PLAYER
        SET BUFFS = JSON_SET(BUFFS, '$.SPELL_SHIELD', ${shields - 1})
        WHERE ID = ?;`,
          [interaction.user.id]
        );
        trap = "路障";
      } else {
        await obstacle(interaction, results[0].DICE, rep);
      }

      await origin.followUp({ embeds: [immune], ephemeral: true });
      await pool.execute(`UPDATE TEAMS
      SET BLUE_DEBUFFS = JSON_SET(BLUE_DEBUFFS, '$.OBSTACLE', ${Number(test[0].OBSTACLE) - 1})
      WHERE LINE = 1;`);
      await update(origin);
      return;
    }

      curr_team = "BLUE_DEBUFFS";
  }
  

  // CHECK FOR SELF BUFF AKA BOOTS
  let max = 7;


  const [boot] = await pool.execute(
    `SELECT JSON_UNQUOTE(JSON_EXTRACT(BUFFS, '$.BOOTS')) AS BOOTS
      FROM PLAYER
      WHERE ID = ?;`,
    [interaction.user.id]
  );
  if (boot[0].BOOTS > 0) {
    await pool.execute(
      `UPDATE PLAYER
          SET BUFFS = JSON_SET(BUFFS, '$.BOOTS', ${Number(boot[0].BOOTS) - 1})
          WHERE ID = ?;`,
      [interaction.user.id]
    );
    max = 13;
  }
  


  const rand = Math.floor(Math.random() * (5 - 1) + 1);
  let steps = Math.floor(Math.random() * (max - 1) + 1);
  let random = Math.floor(Math.random() * (4 - 1) + 1);

  await pool.execute(
    `UPDATE TEAMS SET ${team} = ${team} + ${steps} WHERE LINE = 1`
  );
  await pool.execute(
    `UPDATE PLAYER SET STEPS = STEPS + ${steps} WHERE ID = ?`,
    [interaction.user.id]
  );



    if (rand <= 2) {
    await nothing(interaction,steps, rep,display);
  } else if (rand === 3) {
    await reward(interaction,steps,rep);
  } else {
    if (random === 1) {

      if (shields > 0) {
        await pool.execute(
          `UPDATE PLAYER
        SET BUFFS = JSON_SET(BUFFS, '$.SPELL_SHIELD', ${shields - 1})
        WHERE ID = ?;`,
          [interaction.user.id]
        );
        trap = "路障";

         await pool.execute(
           `UPDATE TEAMS SET ${team} = ${team} - ${steps} WHERE LINE = 1`
         );
         await pool.execute(
           `UPDATE PLAYER SET STEPS = STEPS - ${steps} WHERE ID = ?`,
           [interaction.user.id]
         );
        await origin.followUp({ embeds: [immune], ephemeral: true });

      } else {
        await obstacle(interaction, results[0].DICE, rep);
      }

      
      
    } else if (random === 2) {
      if (shields > 0) {
        await pool.execute(
          `UPDATE PLAYER
              SET BUFFS = JSON_SET(BUFFS, '$.SPELL_SHIELD', ${shields - 1})
              WHERE ID = ?;`,
          [interaction.user.id]
        );
        trap = "大学生";

        await pool.execute(
          `UPDATE TEAMS SET ${team} = ${team} - ${steps} WHERE LINE = 1`
        );
        await pool.execute(
          `UPDATE PLAYER SET STEPS = STEPS - ${steps} WHERE ID = ?`,
          [interaction.user.id]
        );
        await origin.followUp({ embeds: [immune], ephemeral: true });
      } else {
        await student(interaction, steps, rep);
      }

      
    } else {
      if (shields > 0) {
        await pool.execute(
          `UPDATE PLAYER
              SET BUFFS = JSON_SET(BUFFS, '$.SPELL_SHIELD', ${shields - 1})
              WHERE ID = ?;`,
          [interaction.user.id]
        );
        trap = "此路不通";

        await pool.execute(
          `UPDATE TEAMS SET ${team} = ${team} - ${steps} WHERE LINE = 1`
        );
        await pool.execute(
          `UPDATE PLAYER SET STEPS = STEPS - ${steps} WHERE ID = ?`,
          [interaction.user.id]
        );
        await origin.followUp({ embeds: [immune], ephemeral: true });
      } else {
        await cant_pass(interaction, steps, rep);
      }
    }
  }
  await update(origin);
}

module.exports = single_use;
