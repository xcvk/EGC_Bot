const pool = require("../../../database/db-promise");
const { EmbedBuilder } = require("discord.js");
const translation = require("../../../database/translation");

async function reward(interaction, steps, rep, display,id) {
  let common = new Map();

  common.set(1, "OBSTACLE");
  common.set(2, "CANT_PASS");
  common.set(3, "BOOTS");
  common.set(4, "EXPLORER");

  let rare = new Map();
  rare.set(1, "EFFECT_DOUBLE");
  rare.set(2, "STUDENT");
  rare.set(3, "SPELL_SHIELD");

  let legendary = new Map();
  legendary.set(1, "TELEPORTER");
  legendary.set(2, "MAGNET");
  legendary.set(3, "SWAP");

  let random = Math.floor(Math.random() * (101 - 1) + 1);

  let item = null;
  if (random <= 60) {
    const rarity = Math.floor(Math.random() * (5 - 1) + 1);
    item = await common.get(rarity);
  } else if (random > 60 && random <= 97) {
    const rarity = Math.floor(Math.random() * (4 - 1) + 1);
    item = await rare.get(rarity);
  } else {
    const rarity = Math.floor(Math.random() * (4 - 1) + 1);
    item = await legendary.get(rarity);
  }

  if (item !== "SWAP") {
    const updateQuery = `UPDATE PLAYER SET ${item} = ${item} + 1 WHERE id = ?`;
    await pool.execute(updateQuery, [id]);
  }

 if (!display) {
   return item;
 }

  
  
  const [result] = await pool.execute(
    `SELECT DICE, STEPS FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );
  
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
    await interaction.reply({ embeds: [embed],  });
  } else {
    await interaction.followUp({ embeds: [embed],  });
  }
}

module.exports = reward;
