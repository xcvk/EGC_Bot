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
      await interaction.reply({ embeds: [embed],  });
    } else {
      await interaction.followUp({ embeds: [embed],  });
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
      debuff = true;
    } else if (test[0].RED_DEBUFFS.CANT_PASS > 0) {
      trapType = 3;
      debuff = true;
      await pool.execute(
        `UPDATE TEAMS SET RED_DEBUFFS = JSON_SET(RED_DEBUFFS, '$.CANT_PASS', ${
          Number(test[0].RED_DEBUFFS.CANT_PASS) - 1
        }) WHERE LINE = 1;`
      );
    }
    
  } else {
    const [test] = await pool.execute(
      `SELECT BLUE_DEBUFFS FROM TEAMS WHERE LINE = 1;`
    );
    
    if (test[0].BLUE_DEBUFFS.OBSTACLE > 0) {
      await pool.execute(
        `UPDATE TEAMS SET BLUE_DEBUFFS = JSON_SET(BLUE_DEBUFFS, '$.OBSTACLE', ${
          Number(test[0].BLUE_DEBUFFS.OBSTACLE) - 1
        }) WHERE LINE = 1;`
      );
      trapType = 1;
      debuff = true;
    } else if (test[0].BLUE_DEBUFFS.CANT_PASS > 0) {
      trapType = 3;
      debuff = true;
      await pool.execute(
        `UPDATE TEAMS SET BLUE_DEBUFFS = JSON_SET(BLUE_DEBUFFS, '$.CANT_PASS', ${
          Number(test[0].BLUE_DEBUFFS.CANT_PASS) - 1
        }) WHERE LINE = 1;`
      );
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
  

  let stolen_item = 0;
  let theif = 0;
  if (curr_team === RED_TEAM) {
    const [magnets] = await pool.execute("SELECT RED_DEBUFFS FROM TEAMS WHERE LINE = 1");
    if (magnets[0].RED_DEBUFFS.MAGNET && randomEvent === 3 && !debuff) {
      randomEvent = 1;
      if (magnets[0].RED_DEBUFFS.MAGNET !== 1) {
        theif = magnets[0].RED_DEBUFFS.MAGNET;
        stolen_item = await reward(interaction,steps,rep,false,theif);
        await pool.execute(`UPDATE TEAMS
          SET RED_DEBUFFS = JSON_SET(RED_DEBUFFS, '$.MAGNET', 1)
          WHERE LINE = 1;`);
      } else {
        const [theif_options] = await pool.execute("SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1");
        let theif = theif_options[0].BLUE_MEMBERS[Math.floor(Math.random() * theif_options[0].BLUE_MEMBERS.length)]
        stolen_item = await reward(interaction,steps,rep,false,theif);
      }
      if (display) {
          const embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              `敌方有磁铁！！\n${translation.get(stolen_item)}已被对方的给<@${theif}>偷走了。。`
            )
            .setAuthor({
              name: `${interaction.user.username}`,
              iconURL: `${interaction.user.avatarURL()}`,
            });
          await interaction.reply({embeds: [embed]});
          await interaction.editReply({  });
        }
    }


  } else {
    const [magnets] = await pool.execute(
      "SELECT BLUE_DEBUFFS FROM TEAMS WHERE LINE = 1"
    );
    if (magnets[0].BLUE_DEBUFFS.MAGNET && randomEvent === 3 && !debuff) {
      randomEvent = 1;
      if (magnets[0].BLUE_DEBUFFS.MAGNET !== 1) {
        theif = magnets[0].BLUE_DEBUFFS.MAGNET;
        stolen_item = await reward(interaction, steps, rep, false, theif);
        await pool.execute(`UPDATE TEAMS
          SET BLUE_DEBUFFS = JSON_SET(BLUE_DEBUFFS, '$.MAGNET', 1)
          WHERE LINE = 1;`);
      } else {
        const [theif_options] = await pool.execute(
          "SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1"
        );
        theif =
          theif_options[0].BLUE_MEMBERS[
            Math.floor(Math.random() * theif_options[0].BLUE_MEMBERS.length)
          ];
        stolen_item = await reward(interaction, steps, rep, false, theif);
      }
      if (display) {
        const embed = new EmbedBuilder()
          .setColor("Red")
          .setDescription(`敌方有磁铁！！\n${translation.get(stolen_item)}已被对方的给<@${theif}>偷走了。。`)
          .setAuthor({
            name: `${interaction.user.username}`,
            iconURL: `${interaction.user.avatarURL()}`,
          });
        await interaction.reply({ embeds: [embed] });
        await interaction.editReply({  });
      }
    }
  }


  if (randomEvent <= 2 && !debuff) {
    if (!display) {
      await update(origin);
      return ["无事发生", steps, shield_used, boot_num,stolen_item,theif];
    }
    await nothing(interaction, steps, rep,stolen_item);
  } else if (randomEvent === 3 && !debuff) {
    const item = await reward(interaction, steps, rep, display,interaction.user.id);
    if (item){
      return [`🎉已获得道具${translation.get(item)}`, steps, 0, boot_num];
    }
  } else {
    if (trapType === 1) {
      let person = 0;
      if (debuff) {
        if (curr_team === "红") {
          const [caster] = await pool.execute(`SELECT RED_OBSTACLES FROM TEAMS WHERE LINE = 1`);
          person = caster[0].RED_OBSTACLES[0];
          await pool.execute(`UPDATE TEAMS SET RED_OBSTACLES = JSON_REMOVE(RED_OBSTACLES, '$[0]') WHERE LINE = 1`);
        } else {
          const [caster] = await pool.execute(`SELECT BLUE_OBSTACLES FROM TEAMS WHERE LINE = 1`);
          person = caster[0].BLUE_CANT_PASS[0];
          await pool.execute(`UPDATE TEAMS SET BLUE_OBSTACLES = JSON_REMOVE(BLUE_OBSTACLES, '$[0]') WHERE LINE = 1`);
        }
      }

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
          return ["🛡️已免疫陷阱路障", steps, 1, 0,person];
        } 
        else 
        {
          const immune = new EmbedBuilder()
            .setDescription(`🛡️已免疫<@${person}>铺下的陷阱路障`)
            .setColor("Green")
            .setAuthor({
            name: `${interaction.user.username}`,
            iconURL: `${interaction.user.avatarURL()}`,
          });
          await origin.followUp({ embeds: [immune],  });
        }
      } 
      else 
      {
        if (!display) 
        {
          await update(origin);
          return ["⚠️已遭遇陷阱路障", 0, shield_used, 0,person];
          
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
          await origin.followUp({ embeds: [immune],  });
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
      let person = 0;
      if (debuff) {
        
        if (curr_team === "红") {
          const [caster] = await pool.execute(`SELECT RED_CANT_PASS FROM TEAMS WHERE LINE = 1`);
          person = caster[0].RED_CANT_PASS[0];
           await pool.execute(`
          UPDATE TEAMS
          SET RED_CANT_PASS = JSON_REMOVE(RED_CANT_PASS, '$[0]')
          WHERE LINE = 1
        `);
        } else {
          const [caster] = await pool.execute(`SELECT BLUE_CANT_PASS FROM TEAMS WHERE LINE = 1`);
          person = caster[0].BLUE_CANT_PASS[0];
           await pool.execute(`
          UPDATE TEAMS
          SET BLUE_CANT_PASS = JSON_REMOVE(BLUE_CANT_PASS, '$[0]')
          WHERE LINE = 1
        `);
        }
      }


      if (shields > 0) {
        await pool.execute(
          `UPDATE PLAYER SET BUFFS = JSON_SET(BUFFS, '$.SPELL_SHIELD', ${
            shields - 1
          }) WHERE ID = ?;`,
          [interaction.user.id]
        );
        shield_used++;
        
        if (!display) {
          await update(origin);
          return ["🛡️已免疫陷阱此路不通", steps, 1, boot_num,person];
        } else {
          const immune = new EmbedBuilder()
            .setDescription(`🛡️已免疫陷阱<@${person}>放的此路不通陷阱`)
            .setColor("Green");
          await origin.followUp({ embeds: [immune],  });
        }

      } else {
        if (!display) {
          await update(origin);
          return ["⚠️已遭遇陷阱此路不通", steps, shield_used, boot_num,person];
        }
        await cant_pass(interaction, steps, rep);
      }
    }
  }

  await update(origin);
}

module.exports = single_use;
