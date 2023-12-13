const pool = require("../../../database/db-promise");
const { EmbedBuilder } = require("discord.js");
const reward = require("../get/reward");
const update = require("../embed/screen");
const nothing = require("../embed/nothing");
const obstacle = require("../get/obstacle");
const student = require("../../entrance/get/student");
const cant_pass = require("../../entrance/get/cant_pass");
const translation = require("../../../database/translation");
// Constants
const RED_TEAM = "红";
const BLUE_TEAM = "蓝";

async function single_use(origin, interaction, rep, display) {
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
  team = team[0][0].TEAM === RED_TEAM ? "RED_STEPS" : "BLUE_STEPS";

  // TAKE DICE AWAY FROM PLAYER AKA THEY PAY THE PRICE
  const updateQuery = `UPDATE PLAYER SET DICE = DICE - 1 WHERE id = ?`;
  await pool.execute(updateQuery, [interaction.user.id]);

  // SEE IF SPELL_SHIELD EXIST AND PROTECT
  const [shield] = await pool.execute(
    `SELECT JSON_UNQUOTE(JSON_EXTRACT(BUFFS, '$.SPELL_SHIELD')) AS SPELL_SHIELD FROM PLAYER WHERE ID = ?;`,
    [interaction.user.id]
  );


  const shields = Number(shield[0].SPELL_SHIELD);
  
  let shield_used = 0;
  // CHECK FOR OBSTACLE TRAPS AKA SELF TEAM DEBUFFS



  

  let randomEvent = Math.floor(Math.random() * (5 - 1) + 1);
  
  let trapType = Math.floor(Math.random() * (4 - 1) + 1);
  let curr_team = results[0].TEAM;
  let debuff = false;
  if (curr_team === RED_TEAM) {

    const [test] = await pool.execute(
      `SELECT RED_DEBUFFS FROM TEAMS WHERE LINE = 1;`
    );

    if (test[0].RED_DEBUFFS.OBSTACLE > 0) {
      await pool.execute(
        `UPDATE TEAMS SET RED_DEBUFFS = JSON_SET(RED_DEBUFFS, '$.OBSTACLE', ${
          Number(test[0].RED_DEBUFFS.OBSTACLE) - 1
        }) WHERE LINE = 1;`
      );
      trapType = 1;
    }
    debuff = true;
  } else {
    const [test] = await pool.execute(
      `SELECT BLUE_DEBUFFS FROM TEAMS WHERE LINE = 1;`
    );
    
    if (test[0].BLUE_DEBUFFS.OBSTACLE) {
      await pool.execute(
        `UPDATE TEAMS SET BLUE_DEBUFFS = JSON_SET(BLUE_DEBUFFS, '$.OBSTACLE', ${
          Number(test[0].BLUE_DEBUFFS.OBSTACLE) - 1
        }) WHERE LINE = 1;`
      );
      trapType = 1;
      debuff = true;
    }
    
  }
  // CHECK FOR SELF BUFF AKA BOOTS
  

  let boot_num = 0;
  // check for any boots buff from player 
  const [boot] = await pool.execute(
    `SELECT JSON_UNQUOTE(JSON_EXTRACT(BUFFS, '$.BOOTS')) AS BOOTS FROM PLAYER WHERE ID = ?;`,
    [interaction.user.id]
  );
  // if there is we subtract and increase maximum
  let max = 7;
  let min = 1;
  if (boot[0].BOOTS > 0 && !debuff) {
    await pool.execute(
      `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.BOOTS', ${
        Number(boot[0].BOOTS) - 1
      }) WHERE ID = ?;`,
      [interaction.user.id]
    );
    boot_num = 1;
    max = 13;
    const [buffs] = await pool.execute(
      `SELECT BUFFS FROM PLAYER WHERE ID = ?`,
      [interaction.user.id]
    );
    if (buffs[0].BUFFS.EFFECT_DOUBLE > 0) {
      await pool.execute(
        `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.EFFECT_DOUBLE', ${
          Number(buffs[0].BUFFS.EFFECT_DOUBLE) - 1
        }) WHERE ID = ?;`,
        [interaction.user.id]
      );
      max = 25;
      min = 2;
    }
    
  }
  
  let steps = Math.floor(Math.random() * (max - min) + min);
  // 4 sets of events
  

  const [explorers] = await pool.execute(
    `SELECT JSON_UNQUOTE(JSON_EXTRACT(BUFFS, '$.EXPLORER')) AS EXPLORER FROM PLAYER WHERE ID = ?;`,
    [interaction.user.id]
  );

  if (explorers[0].EXPLORER > 0 && !debuff) {
    randomEvent = 3;
    await pool.execute(
      `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.EXPLORER', ${
        Number(explorers[0].EXPLORER) - 1
      }) WHERE ID = ?;`,
      [interaction.user.id]
    );
  }

  await pool.execute(
    `UPDATE TEAMS SET ${team} = ${team} + ${steps} WHERE LINE = 1`
  );
  await pool.execute(
    `UPDATE PLAYER SET STEPS = STEPS + ${steps} WHERE ID = ?`,
    [interaction.user.id]
  );

  if (randomEvent <= 2 && !debuff) {
    if (!display) {
      await update(origin);
      return ["无事发生", steps, shield_used, boot_num];
    }
    await nothing(interaction, steps, rep);
  } else if (randomEvent === 3 && !debuff) {
    const item = await reward(interaction, steps, rep, display);
    if (item){
      return [`🎉已获得道具${translation.get(item)}`, steps, 0, boot_num];
    }
  } else {
    if (trapType === 1) {
      if (shields > 0) {
        await pool.execute(
          `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.SPELL_SHIELD', ${
            shields - 1
          }) WHERE ID = ?;`,
          [interaction.user.id]
        );

        if (!display) 
        {
          await update(origin);
          return ["🛡️已免疫陷阱路障", steps, 1, 0];
        } 
        else 
        {
          const immune = new EmbedBuilder()
            .setDescription(`🛡️已免疫陷阱路障`)
            .setColor("Green");
          await origin.followUp({ embeds: [immune], ephemeral: true });
        }
      } 
      else 
      {
        if (!display) 
        {
          await update(origin);
          return ["⚠️已遭遇陷阱路障", 0, shield_used, 0];
          
        }
        await obstacle(interaction, steps, rep, display, false);
      }
    } else if (trapType === 2) {
      if (shields > 0) {
        await pool.execute(
          `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.SPELL_SHIELD', ${
            shields - 1
          }) WHERE ID = ?;`,
          [interaction.user.id]
        );

        await pool.execute(
          `UPDATE TEAMS SET ${team} = ${team} - ${steps} WHERE LINE = 1`
        );
        await pool.execute(
          `UPDATE PLAYER SET STEPS = STEPS - ${steps} WHERE ID = ?`,
          [interaction.user.id]
        );

        if (!display) {
          await update(origin);
          return ["🛡️已免疫陷阱大学生", steps, 1, boot_num];
        } else {
          const immune = new EmbedBuilder()
            .setDescription(`🛡️已免疫陷阱大学生`)
            .setColor("Green");
          await origin.followUp({ embeds: [immune], ephemeral: true });
        }
      } else {
        const lost_item = await student(interaction, steps, rep,display);
        if (!display) {
          await update(origin);
          return [
            "⚠️已遭遇陷阱大学生",
            steps,
            shield_used,
            boot_num,
            lost_item,
          ];
        } 
      }
    } else {
      if (shields > 0) {
        await pool.execute(
          `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.SPELL_SHIELD', ${
            shields - 1
          }) WHERE ID = ?;`,
          [interaction.user.id]
        );
        shield_used++;
        await pool.execute(
          `UPDATE TEAMS SET ${team} = ${team} - ${steps} WHERE LINE = 1`
        );
        await pool.execute(
          `UPDATE PLAYER SET STEPS = STEPS - ${steps} WHERE ID = ?`,
          [interaction.user.id]
        );

        if (!display) {
          await update(origin);
          return ["🛡️已免疫陷阱此路不通", steps, 1, boot_num];
        } else {
          const immune = new EmbedBuilder()
            .setDescription(`🛡️已免疫陷阱此路不通`)
            .setColor("Green");
          await origin.followUp({ embeds: [immune], ephemeral: true });
        }

      } else {
        if (!display) {
          await update(origin);
          return ["⚠️已遭遇陷阱此路不通", steps, shield_used, boot_num];
        }
        await cant_pass(interaction, steps, rep);
      }
    }
  }

  await update(origin);
}

module.exports = single_use;
