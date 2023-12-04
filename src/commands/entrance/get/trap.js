const pool = require('../../../database/db-promise');
const { EmbedBuilder } = require("discord.js");
const translation = require("../../../database/translation");

async function trap(interaction,steps,dice,rep,total_step) {
    let random = Math.floor(Math.random() * (4 - 1) + 1);
    if (random == 1)
    {
        const embed = new EmbedBuilder()
          .setDescription(
            `路障 \n 无法行动 \n 还剩${dice}颗骰子 \n总共走了${total_step}步`
          )
          .setColor("Red")
          .setTitle("遭遇陷阱了。。");

          if (rep) {
            interaction.reply({ embeds: [embed], ephemeral: true });
          } else {
            interaction.followUp({ embeds: [embed], ephemeral: true });
          }


          
    }
    else if (random == 2)
    {
        const forward = `UPDATE player SET STEPS = STEPS + ${steps} WHERE id = ?`;
        await pool.execute(forward, [interaction.user.username]);
        let map = new Map();

        map.set(1, "OBSTACLE");
        map.set(2, "STUDENT");
        map.set(3, "CANT_PASS");
        map.set(4, "TELEPORTER");
        map.set(5, "MAGNET");
        map.set(6, "BOOTS");
        map.set(7, "SPELL_SHIELD");
        map.set(8, "SWAP");
        map.set(9, "EXPLORER");
        map.set(10, "EFFECT_DOUBLE");
        
        
        const [results] = await pool.execute(
              `SELECT * FROM PLAYER WHERE id = ?`,
              [interaction.user.username]
            );
        
        let name = null;
        let arr = [];
        for (let i = 1; i <= 10; ++i)
        {  
            name = map.get(i);
            if (results[0].name !== 0)
            {
                arr.push(name);

            }
        }
        if (arr.length === 0)
        {
            const updateQuery = `UPDATE player SET DICE = DICE - 1 WHERE id = ?`;
            await pool.execute(updateQuery, [interaction.user.username]);
            const embed = new EmbedBuilder()
              .setDescription(
                `大学生。。？\n 随机减少一个道具如无道具则减少一个骰子 \n 
                减少一枚骰子\n 
                前进了 ${steps}步 \n 
                还剩${dice}颗骰子 \n
                总共走了${total_step}步`
              )
              .setColor("Red")
              .setTitle("遭遇陷阱了。。");
            if (rep) {
              interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
              interaction.followUp({ embeds: [embed], ephemeral: true });
            }
        }
        else
        {
            let random = Math.floor(Math.random() * arr.length + 0);
            const updateQuery = `UPDATE player SET ${arr[random]} = ${arr[random]} - 1 WHERE id = ?`;
            await pool.execute(updateQuery, [interaction.user.username]);


            const embed = new EmbedBuilder()
              .setDescription(
                `大学生。。？\n 随机减少一个道具如无道具则减少一个骰子 \n 少了一个${translation.get(
                  arr[random]
                )}
                \n 前进了 ${steps}步\n 还剩${dice}颗骰子 \n
                总共走了${total_step}步`
              )
              .setColor("Red")
              .setTitle("遭遇陷阱了。。");
            if (rep) {
              interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
              interaction.followUp({ embeds: [embed], ephemeral: true });
            }
        }
    }
    else
    {
        const forward = `UPDATE player SET STEPS = STEPS + ${steps} WHERE id = ?`;
        await pool.execute(forward, [interaction.user.username]);
        let random = Math.floor(Math.random() * (13 - 1) + 1);
        const embed = new EmbedBuilder()
          .setDescription("此路不通")
          .setDescription(
            `随机倒退1~12步 \n 倒退了${random}步\n 前进了 ${steps}步 \n 还剩${dice}颗骰子 \n总共走了${total_step}步`
          )
          .setColor("Red")
          .setTitle("遭遇陷阱了。。");


        const updateQuery = `UPDATE player SET STEPS = STEPS - ${random} WHERE id = ?`;
        await pool.execute(updateQuery, [interaction.user.username]);
        if (rep) {
          interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
          interaction.followUp({ embeds: [embed], ephemeral: true });
        }

    }
}

module.exports = trap;