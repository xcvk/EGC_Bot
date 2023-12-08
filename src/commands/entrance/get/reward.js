const pool = require('../../../database/db-promise');
const {EmbedBuilder} = require("discord.js");
const translation = require("../../../database/translation");


async function reward(interaction,steps,rep) {
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

  const id = interaction.user.id;
  let random = Math.floor(Math.random() * (11 - 1) + 1);
  let item = await map.get(random);
  const updateQuery = `UPDATE player SET ${item} = ${item} + 1 WHERE id = ?`;
  await pool.execute(updateQuery, [id]);
  const [result] = await pool.execute(`SELECT DICE, STEPS FROM PLAYER WHERE id = ?`, [
    interaction.user.id,
  ]);

  
  const embed = new EmbedBuilder()
    .setDescription(
      `消耗了一颗骰子\n获得道具 **__${translation.get(item)}__** \n\n 
              **前进了__${steps}__步**
              **还剩__${result[0].DICE}__颗骰子** \n**总共走了__${
        result[0].STEPS
      }__步**`
    )
    .setColor("Green")
    .setTitle("获得奖励!!!");
  if (rep) {
    await interaction.reply({ embeds: [embed], ephemeral: true });
  } else {
    await interaction.followUp({ embeds: [embed], ephemeral: true });
  }




  return item;




}


module.exports = reward;