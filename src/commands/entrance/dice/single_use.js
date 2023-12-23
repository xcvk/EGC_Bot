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

async function single_use(origin, interaction, rep, display) {
  const [results] = await pool.execute(
    `SELECT DICE, TEAM, DICE_USED FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );

  
  
  // MAKE SURE THEY HAVE ENOUGH DICE
  if (results[0].DICE <= 0) {
    const embed = new EmbedBuilder().setDescription("骰子不足").setColor("Red")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`,
      });

    if (rep) {
      await interaction.reply({ embeds: [embed],  });
    } else {
      await interaction.followUp({ embeds: [embed],  });
    }
    return;
  }
  
  const [limit] = await pool.execute(`SELECT DAILY_LIMIT FROM TEAMS WHERE LINE = 1`);
  if (results[0].DICE_USED === limit[0].DAILY_LIMIT) {
    const embed = new EmbedBuilder().setDescription("已用到了每日限量，请等到明天吧")
    .setColor("Red")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`,
      });

    if (rep) {
      await interaction.reply({ embeds: [embed], });
    } else {
      await interaction.followUp({ embeds: [embed], });
    }
    return;
  }

  


  let team = await pool.execute(`SELECT TEAM FROM PLAYER WHERE ID = ?`, [
    interaction.user.id,
  ]);
  team = team[0][0].TEAM === RED_TEAM ? "RED_STEPS" : "BLUE_STEPS";

  // TAKE DICE AWAY FROM PLAYER AKA THEY PAY THE PRICE
  const updateQuery = `UPDATE PLAYER SET DICE = DICE - 1 WHERE ID = ?`;
  await pool.execute(updateQuery, [interaction.user.id]);
  const increase_limit = `UPDATE PLAYER SET DICE_USED = DICE_USED + 1 WHERE ID = ?`;
  await pool.execute(increase_limit, [interaction.user.id]);
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
  let boot_signal = false;
  if (boot[0].BOOTS > 0 && trapType !== 1) {
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
    boot_signal = true;
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
  let thief = 0;
  if (curr_team === RED_TEAM) {
    const [magnets] = await pool.execute("SELECT RED_DEBUFFS FROM TEAMS WHERE LINE = 1");
    if (magnets[0].RED_DEBUFFS.MAGNET && randomEvent === 3 && !debuff) {
      randomEvent = 1;
      if (magnets[0].RED_DEBUFFS.MAGNET !== 1 && magnets[0].RED_DEBUFFS.MAGNET !== 0) {
        thief = magnets[0].RED_DEBUFFS.MAGNET;
        stolen_item = await reward(interaction,steps,rep,false,thief);
        await pool.execute(`UPDATE TEAMS
          SET BLUE_DEBUFFS = JSON_SET(RED_DEBUFFS, '$.MAGNET', 1)
          WHERE LINE = 1;`);
      } else {
        const [thief_options] = await pool.execute("SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1");
        let thief = thief_options[0].BLUE_MEMBERS[Math.floor(Math.random() * thief_options[0].BLUE_MEMBERS.length)]
        stolen_item = await reward(interaction,steps,rep,false,thief);
      }
      if (display) {
        const myArray = [
          `不可思议的吸引力！@<${thief}>的磁铁道具已经开始工作，@<${interaction.user.id}>的${translation.get(stolen_item)}正飞速向对方靠拢！`,
          `看着你的${translation.get(stolen_item)}被吸走，@<${interaction.user.id}>，这都是@<${thief}>的磁铁道具的魔力！`,
          `@<${thief}>的磁铁道具已激活，@<${interaction.user.id}>的${translation.get(stolen_item)}好像失去了方向，正被吸引过去！`,
          `@<${interaction.user.id}>，你的${translation.get(stolen_item)}似乎有了新的主人！@<${thief}>的磁铁道具正在重新分配游戏的资源！`,
          `看！@<${interaction.user.id}>的${translation.get(stolen_item)}正被不可抗拒的力量吸向@<${thief}>。这就是磁铁道具的力量！`
        ];
          const embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              myArray[Math.floor(Math.random() * (myArray.length))]
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
      if (magnets[0].BLUE_DEBUFFS.MAGNET !== 1 && magnets[0].BLUE_DEBUFFS.MAGNET !== 0) {
        thief = magnets[0].BLUE_DEBUFFS.MAGNET;
        stolen_item = await reward(interaction, steps, rep, false, thief);
        await pool.execute(`UPDATE TEAMS
          SET BLUE_DEBUFFS = JSON_SET(BLUE_DEBUFFS, '$.MAGNET', 1)
          WHERE LINE = 1;`);
      } else {
        const [thief_options] = await pool.execute(
          "SELECT RED_MEMBERS FROM TEAMS WHERE LINE = 1"
        );
        thief =
          thief_options[0].RED_MEMBERS[
            Math.floor(Math.random() * thief_options[0].RED_MEMBERS.length)
          ];
        stolen_item = await reward(interaction, steps, rep, false, thief);
      }
      if (display) {
        const myArray = [
          `不可思议的吸引力！@<${thief}>的磁铁道具已经开始工作，@<${interaction.user.id}>的${translation.get(stolen_item)}正飞速向对方靠拢！`,
          `看着你的${translation.get(stolen_item)}被吸走，@<${interaction.user.id}>，这都是@<${thief}>的磁铁道具的魔力！`,
          `@<${thief}>的磁铁道具已激活，@<${interaction.user.id}>的${translation.get(stolen_item)}好像失去了方向，正被吸引过去！`,
          `@<${interaction.user.id}>，你的${translation.get(stolen_item)}似乎有了新的主人！@<${thief}>的磁铁道具正在重新分配游戏的资源！`,
          `看！@<${interaction.user.id}>的${translation.get(stolen_item)}正被不可抗拒的力量吸向@<${thief}>。这就是磁铁道具的力量！`
        ];

        const embed = new EmbedBuilder()
          .setColor("Red")
          .setDescription(myArray[Math.floor(Math.random() * (myArray.length))])
          .setAuthor({
            name: `${interaction.user.username}`,
            iconURL: `${interaction.user.avatarURL()}`,
          });
        await interaction.reply({ embeds: [embed] });
        await interaction.editReply({  });
      }
    }
  }


  if (results[0].TEAM === "红") {
    const [red_team] = await pool.execute("SELECT RED_STEPS FROM TEAMS WHERE LINE = 1");
    if (red_team[0].RED_STEPS > 5000) {
      await pool.execute(`UPDATE PLAYER SET REMAINDER = ${red_team[0].RED_STEPS - 5000} WHERE ID = ?`, [interaction.user.id]);
    }
  } else {
    const [blue_team] = await pool.execute("SELECT BLUE_STEPS FROM TEAMS WHERE LINE = 1");
    if (blue_team[0].BLUE_STEPS > 5000) {
      await pool.execute(`UPDATE PLAYER SET REMAINDER = ${blue_team[0].BLUE_STEPS - 5000} WHERE ID = ?`, [interaction.user.id]);
    }
  }
  if (randomEvent <= 2 && !debuff) {
    if (!display) {
      await update(origin);
      return ["无事发生", steps, shield_used, boot_num,stolen_item,thief];
    }
    await nothing(interaction, steps, rep,stolen_item,boot_signal);
  } else if (randomEvent === 3 && !debuff) {
    const item = await reward(interaction, steps, rep, display,interaction.user.id,boot_signal);
    if (item){
      return [`🎉已获得道具${translation.get(item)}`, steps, 0, boot_num];
    }
  } else {
    if (trapType === 1) {
      let person = 0;
      if (debuff) {
        if (curr_team === "红") {
          const [caster] = await pool.execute(`SELECT BLUE_OBSTACLES FROM TEAMS WHERE LINE = 1`);
          person = caster[0].BLUE_OBSTACLES[0];
          await pool.execute(`UPDATE TEAMS SET BLUE_OBSTACLES = JSON_REMOVE(BLUE_OBSTACLES, '$[0]') WHERE LINE = 1`);
        } else {
          const [caster] = await pool.execute(`SELECT RED_OBSTACLES FROM TEAMS WHERE LINE = 1`);
          person = caster[0].RED_OBSTACLES[0];
          await pool.execute(`UPDATE TEAMS SET RED_OBSTACLES = JSON_REMOVE(RED_OBSTACLES, '$[0]') WHERE LINE = 1`);
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
          const array3 = [
            `<@${person}> 什么？！ <@${interaction.user.id}> 居然用了无懈可击 他怎么知道？！ 莫非...有内鬼？`,
            `@遭遇人 微笑回应道：“哈哈哈！我无懈可击，我早就洞察到了 <@${interaction.user.id}> 的意图”`,
            `<@${person}> 惊讶地发现，自己使用的道具在面对 <@${interaction.user.id}> 的无懈可击时完全失效了。他感到有些沮丧，明白自己需要找到其他方式来应对局面。`,
            `<@${interaction.user.id}> 微笑着对 <@${person}>说道：“你的道具在我的无懈可击面前只不过是纸老虎而已。下次，你最好选择更加有效的策略来对付我。`,
            `<@${person}> 陷入困境，无奈地看着无效的道具。他暗自下定决心，承认 <@${interaction.user.id}>的能力超乎想象。`
          ];
          const immune = new EmbedBuilder()
            .setDescription(array3[Math.floor(Math.random() * (array3.length))])
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
        await obstacle(interaction, steps, rep, display, false,person);
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
          const array3 = [
            `<@${person}> 什么？！ <@${interaction.user.id}> 居然用了无懈可击 他怎么知道？！ 莫非...有内鬼？`,
            `@遭遇人 微笑回应道：“哈哈哈！我无懈可击，我早就洞察到了 <@${interaction.user.id}> 的意图”`,
            `<@${person}> 惊讶地发现，自己使用的道具在面对 <@${interaction.user.id}> 的无懈可击时完全失效了。他感到有些沮丧，明白自己需要找到其他方式来应对局面。`,
            `<@${interaction.user.id}> 微笑着对 <@${person}>说道：“你的道具在我的无懈可击面前只不过是纸老虎而已。下次，你最好选择更加有效的策略来对付我。`,
            `<@${person}> 陷入困境，无奈地看着无效的道具。他暗自下定决心，承认 <@${interaction.user.id}>的能力超乎想象。`
          ];
          const immune = new EmbedBuilder()
            .setDescription(array3[Math.floor(Math.random() * (array3.length))])
            .setColor("Green")
            .setAuthor({
              name: `${interaction.user.username}`,
              iconURL: `${interaction.user.avatarURL()}`,
            });
          await origin.followUp({ embeds: [immune], });
        }
      } else {
        const lost_item = await student(interaction, steps, rep,display,boot_signal);
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
          const array3 = [
            `<@${person}> 什么？！ <@${interaction.user.id}> 居然用了无懈可击 他怎么知道？！ 莫非...有内鬼？`,
            `@遭遇人 微笑回应道：“哈哈哈！我无懈可击，我早就洞察到了 <@${interaction.user.id}> 的意图”`,
            `<@${person}> 惊讶地发现，自己使用的道具在面对 <@${interaction.user.id}> 的无懈可击时完全失效了。他感到有些沮丧，明白自己需要找到其他方式来应对局面。`,
            `<@${interaction.user.id}> 微笑着对 <@${person}>说道：“你的道具在我的无懈可击面前只不过是纸老虎而已。下次，你最好选择更加有效的策略来对付我。`,
            `<@${person}> 陷入困境，无奈地看着无效的道具。他暗自下定决心，承认 <@${interaction.user.id}>的能力超乎想象。`
          ];
          const immune = new EmbedBuilder()
            .setDescription(array3[Math.floor(Math.random() * (array3.length))])
            .setColor("Green")
            .setAuthor({
              name: `${interaction.user.username}`,
              iconURL: `${interaction.user.avatarURL()}`,
            });
          await origin.followUp({ embeds: [immune], });
        }

      } else {
        if (!display) {
          await update(origin);
          return ["⚠️已遭遇陷阱此路不通", steps, shield_used, boot_num,person];
        }
        await cant_pass(interaction, steps, rep,person,boot_signal);
      }
    }
  }

  await update(origin);
}

module.exports = single_use;
