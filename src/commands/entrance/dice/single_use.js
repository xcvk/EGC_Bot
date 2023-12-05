const pool = require('../../../database/db-promise');
const {EmbedBuilder} = require('discord.js');
const reward = require('../get/reward');
const trap = require('../get/trap');
const translation = require('../../../database/translation');
const update = require("../embed/screen");

async function single_use(origin,interaction,rep) {
  const [res] = await pool.execute(
    `SELECT DICE FROM PLAYER WHERE id = ?`,
    [interaction.user.username]
  );
    if (res[0].DICE <= 0)
    {   
        const embed = new EmbedBuilder()
          .setDescription("骰子不足")
          .setColor("Red");
        
        if (rep)
        {
          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        else
        {
          await interaction.followUp({ embeds: [embed], ephemeral: true });
        }
        return;
    }


    
    let steps = Math.floor(Math.random() * (7 - 1) + 1);
    const random = Math.floor(Math.random() * (5 - 1) + 1);
    



    const updateQuery = `UPDATE player SET DICE = DICE - 1 WHERE id = ?`;
    await pool.execute(updateQuery, [interaction.user.username]);
    await pool.execute(`UPDATE PLAYER SET STEPS = STEPS + ${steps} WHERE ID = ?`, [interaction.user.username]);
    const [results] = await pool.execute(
      `SELECT DICE, STEPS FROM PLAYER WHERE id = ?`,
      [interaction.user.username]
    );
    if (random <= 2)
    {
        const embed = new EmbedBuilder()
          .setDescription(
            `消耗了一颗骰子\n\n
            **前进了__${steps}__步**
            **还剩__${results[0].DICE}__颗骰子**
            **总共走了__${results[0].STEPS}__步**`
          )
          .setColor("White")
          .setTitle("无事发生");
        if (rep) {
          await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
          await interaction.followUp({ embeds: [embed], ephemeral: true });
        };
        await update(origin);
    }
    else if (random == 3)
    {
        reward(interaction.user.username).then((res) => {
            const embed = new EmbedBuilder()
              .setDescription(
                `消耗了一颗骰子\n获得道具 ${translation.get(
                  res)} \n\n 
                **前进了__${steps}__步**
                **还剩__${results[0].DICE}__颗骰子** \n**总共走了__${results[0].STEPS}__步**`
              )
              .setColor("Green")
              .setTitle("获得奖励!!!");
          if (rep)
          {
            interaction.reply({ embeds: [embed], ephemeral: true });
          }
          else
          {
            interaction.followUp({ embeds: [embed], ephemeral: true });
          }
        });
        await update(origin);
    }
    else
    {
        trap(origin,interaction,steps,results[0].DICE,rep);
    }

    let team = await pool.execute(`SELECT TEAM FROM PLAYER WHERE id = ?`,[interaction.user.username]);
    if (team[0].TEAM === "红")
    {
      team = "RED_STEPS";
    }
    else
    {
      team = "BLUE_STEPS";
    }
    
    await pool.execute(`UPDATE TEAMS SET ${team} = ${team} + ${steps} WHERE LINE = 1`);
}

module.exports = single_use;