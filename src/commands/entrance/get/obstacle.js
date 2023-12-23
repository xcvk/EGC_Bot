const { cast } = require("sequelize");
const pool = require("../../../database/db-promise");
const { EmbedBuilder } = require("discord.js");

async function obstacle(interaction, steps, rep,display,debuff,caster) {
  const [results] = await pool.execute(`SELECT * FROM PLAYER WHERE id = ?`, [
    interaction.user.id,
  ]);

  let team = null;
  if (results[0].TEAM === "蓝") {
    team = "BLUE_STEPS";
  } else {
    team = "RED_STEPS";
  }


  if (!debuff) {
    await pool.execute(
      `UPDATE TEAMS SET ${team} = ${team} - ${steps} WHERE LINE = 1`
    );
    await pool.execute(
      `UPDATE PLAYER SET STEPS = STEPS - ${steps} WHERE ID = ?`,
      [interaction.user.id]
    );
  }
  

  const dice = results[0].DICE;
  
  if (debuff) {
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
      const [test] =
        await pool.execute(`SELECT JSON_UNQUOTE(JSON_EXTRACT(BLUE_DEBUFFS, '$.OBSTACLE')) AS OBSTACLE
      FROM TEAMS
      WHERE LINE = 1;`);
      await pool.execute(`UPDATE TEAMS
          SET BLUE_DEBUFFS = JSON_SET(BLUE_DEBUFFS, '$.OBSTACLE', ${
            Number(test[0].OBSTACLE) - 1
          })
          WHERE LINE = 1;`);
    }
  }
  const [stepz] = await pool.execute(`SELECT STEPS FROM PLAYER WHERE id = ?`, [
    interaction.user.id,
  ]);
  if (display) {
    let trapped = "";
    if (caster) {
      const myArray = [
        `啊！<@${interaction.user.id}> 碰到了<@${caster}> 放置的路障，走不动了呢~`,
        `天呐！<@${interaction.user.id}> 遇到了 <@${caster}> 放置的路障，还好只是路障，不会把你变智障 ;)`,
        `Oh no! <@${interaction.user.id}> 在前进的道路上放置了路障，一头撞在路障上的@遭遇人 坐在地上嗷嗷大哭`,
        `<@${interaction.user.id}> ：<@${caster}> 我休息够啦！让我走啊！！`,
        `<@${interaction.user.id}> ：我记住了！ <@${caster}> 我一定会还回来的！`
      ];
      trapped += myArray[Math.floor(Math.random() * (myArray.length))];
    }
    const embed = new EmbedBuilder()
      .setDescription(
        `消耗了一颗骰子\n路障 \n 无法行动 \n\n **还剩__${dice}__颗骰子** \n${trapped}\n**总共走了__${stepz[0].STEPS}__步**`
      )
      .setColor("Red")
      .setTitle("遭遇陷阱了。。")
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.avatarURL()}`
      })
      .setImage("https://cdn.discordapp.com/attachments/1183593675327021096/1187963478871375952/whale_zoe_carton_style_Christmas_themea_cute_deer_walking_into__1d54d079-a199-4229-b33e-724f9bbaecfa.png?ex=6598cc34&is=65865734&hm=56abd39afc003b89ff000def47311426537a08127d37335f2d7e44202b7b3b2d&");
      if (rep) {
        await interaction.reply({ embeds: [embed],  });
      } else {
        await interaction.followUp({ embeds: [embed],  });
      }
  }
}

module.exports = obstacle;
