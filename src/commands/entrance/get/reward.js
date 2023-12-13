const pool = require("../../../database/db-promise");
const { EmbedBuilder } = require("discord.js");
const translation = require("../../../database/translation");

async function reward(interaction, steps, rep, display) {
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

  const [curr_team] = await pool.execute(
    `SELECT TEAM FROM PLAYER WHERE ID = ?`,
    [interaction.user.id]
  );

  if (curr_team[0].TEAM === "红") {
    const [test] =
      await pool.execute(`SELECT JSON_UNQUOTE(JSON_EXTRACT(RED_DEBUFFS, '$.MAGNET')) AS MAGNET
      FROM TEAMS
      WHERE LINE = 1;`);
    if (test[0].MANGET) {
      if (Number(test[0].MAGNET) === 0) {
      } else {
        if (item === "SWAP") {
          const [magnetz] = require("SELECT SWAP FROM PLAYER WHERE ID = ?",[interaction.user.id]);
          await pool.execute(
            `UPDATE PLAYER
                        SET SWAP = JSON_SET(SWAP, '$[0]', ${magnetz[0].SWAP[0] + 1})
                        WHERE ID = ?;`,
            [interaction.user.id]
          );
        }
        await pool.execute(
          `UPDATE PLAYER SET ${item} = ${item} + 1 WHERE id = ?`,
          [Number(test[0].MAGNET)]
        );
        if (display) {
          const embed = new EmbedBuilder()
            .setDescription(
              `我方队伍有磁铁负面效果,${item}道具给了<@${Number(
                test[0].MAGNET
              )}>`
            )
            .setColor("Red");
          await interaction.reply({ embeds: [embed] });
        }
        await pool.execute(`UPDATE TEAMS
          SET RED_DEBUFFS = JSON_SET(RED_DEBUFFS, '$.MAGNET', 0)
          WHERE LINE = 1;`);
      }
      return;
    }
  } else {
    const [test] =
      await pool.execute(`SELECT JSON_UNQUOTE(JSON_EXTRACT(BLUE_DEBUFFS, '$.MAGNET')) AS MAGNET
      FROM TEAMS
      WHERE LINE = 1;`);
    if (test[0].MANGET) {
      if (Number(test[0].MAGNET) === 0) {
      } else {
        await pool.execute(
          `UPDATE PLAYER SET ${item} = ${item} + 1 WHERE id = ?`,
          [Number(test[0].MAGNET)]
        );
        if (display) {
          const embed = new EmbedBuilder()
            .setDescription(
              `我方队伍有磁铁负面效果,${item}道具给了<@${Number(
                test[0].MAGNET
              )}>`
            )
            .setColor("Red");
          await interaction.reply({ embeds: [embed] });
        }
        /*
        await pool.execute(`UPDATE TEAMS
          SET BLUE_DEBUFFS = JSON_SET(BLUE_DEBUFFS, '$.MAGNET', 0)
          WHERE LINE = 1;`); */
      }
      return;
    }
  }

  const id = interaction.user.id;
  if (item !== "SWAP") {
    const updateQuery = `UPDATE PLAYER SET ${item} = ${item} + 1 WHERE id = ?`;
    await pool.execute(updateQuery, [id]);
  }
  
  const [result] = await pool.execute(
    `SELECT DICE, STEPS FROM PLAYER WHERE id = ?`,
    [interaction.user.id]
  );
  if (!display) {
    return item;
  }
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
}

module.exports = reward;
