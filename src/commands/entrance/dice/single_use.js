const pool = require('../../../database/db-promise');
const {EmbedBuilder} = require('discord.js');
const reward = require('../get/reward');
const trap = require('../get/trap');
const translation = require('../../../database/translation');

async function single_use(interaction,rep) {
    const [results] = await pool.execute(
      `SELECT DICE FROM PLAYER WHERE id = ?`,
      [interaction.user.username]);
    const [step] = await pool.execute(
      `SELECT STEPS FROM PLAYER WHERE id = ?`,
      [interaction.user.username]
    );
    
    const total_step = step[0].STEPS;
    if (results[0].DICE <= 0)
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

    const updateQuery = `UPDATE player SET DICE = DICE - 1 WHERE id = ?`;
    await pool.execute(updateQuery, [interaction.user.username]);

    let steps = Math.floor(Math.random() * (7 - 1) + 1);
    const random = Math.floor(Math.random() * (5 - 1) + 1);
    
    if (random <= 2)
    {
        const embed = new EmbedBuilder()
          .setDescription(
            `无事发生\n前进了${steps}步\n还剩${results[0].DICE}颗骰子\n总共走了${total_step}步`
          )
          .setColor("White")
          .setTitle("消耗了一枚骰子");
        if (rep) {
          await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
          await interaction.followUp({ embeds: [embed], ephemeral: true });
        }

        const forward = `UPDATE player SET STEPS = STEPS + ${steps} WHERE id = ?`;
        await pool.execute(forward, [interaction.user.username]);
    }
    else if (random == 3)
    {
        reward(interaction.user.username).then((res) => {
            const embed = new EmbedBuilder()
              .setDescription(
                `获得奖励!!! \n 获得道具 ${translation.get(
                  res
                )} \n 前进了 ${steps}步 \n
                还剩${results[0].DICE}颗骰子 \n总共走了${total_step}步`
              )
              .setColor("Green")
              .setTitle("消耗了一枚骰子");
        if (rep)
        {
          interaction.reply({ embeds: [embed], ephemeral: true });
        }
        else
        {
          interaction.followUp({ embeds: [embed], ephemeral: true });
        }
        });

        const forward = `UPDATE player SET STEPS = STEPS + ${steps} WHERE id = ?`;
        await pool.execute(forward, [interaction.user.username]);
    }
    else
    {
        trap(interaction,steps,results[0].DICE,rep,total_step);
    }
}

module.exports = single_use;