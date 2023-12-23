const pool = require("./db-promise");
const {EmbedBuilder} = require("discord.js");


async function insert(id,interaction) {
  const team = Math.round(Math.random()) === 0 ? "红" : "蓝";

  const [starting] = await pool.execute(`SELECT STARTING_DICE FROM REGISTRATION WHERE ID = ?`,[id]);
  let dice = 0;
  if (starting[0]) {
    dice = starting[0].STARTING_DICE;
  }
  const query = `
    INSERT INTO PLAYER (ID, TEAM, DICE, STEPS, OBSTACLE, STUDENT, CANT_PASS, TELEPORTER, MAGNET, BOOTS, SPELL_SHIELD,  EXPLORER, EFFECT_DOUBLE,BUFFS, DEBUFFS,ITEM_HISTORY,SWAP,REMAINDER,DICE_USED)
    VALUES (?, ?, ${dice}, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL,NULL,0,0)
  `;

  if (dice) {
    setTimeout(async () => {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.user.username}`,
          iconURL: `${interaction.user.avatarURL()}`,
        })
        .setDescription(`【感谢2023年<@${id}>对EGC俱乐部的付出,你开局获得了${dice}颗骰子作为奖励！】`)
        .setColor("Green");
      await interaction.followUp({ embeds: [embed] });
    }, 2000);
  }
  
  await pool.execute(query, [id, team]);
  await pool.execute(
    `UPDATE PLAYER 
  SET BUFFS = JSON_SET(COALESCE(BUFFS, '{}'), '$.SPELL_SHIELD', 0),
       BUFFS = JSON_SET(COALESCE(BUFFS, '{}'), '$.BOOTS', 0),
       BUFFS = JSON_SET(COALESCE(BUFFS, '{}'), '$.EXPLORER',0),
       BUFFS = JSON_SET(COALESCE(BUFFS, '{}'), '$.EFFECT_DOUBLE',0)
       WHERE ID = ?;`,
    [id]
  );

  await pool.execute(
    `UPDATE PLAYER 
SET SWAP = COALESCE(SWAP, '[0,0]')
WHERE ID = ?;`,
    [id]
  );

  let temp = null;
  if (team === "红") {
    temp = "RED_MEMBERS";
  } else {
    temp = "BLUE_MEMBERS";
  }

  // Now insert into TEAMS table using named placeholders

  const [rows] = await pool.execute("SELECT LINE FROM TEAMS WHERE LINE = 1");

  if (rows.length === 0) {
    await pool.execute(`INSERT INTO TEAMS (BLUE_STEPS,RED_STEPS,MULTIPLIER_RED,MULTIPLIER_BLUE,DAILY_LIMIT)
    VALUES (0,0,0,0,20)`);
    await pool.execute(`UPDATE TEAMS 
    SET RED_DEBUFFS = JSON_SET(COALESCE(RED_DEBUFFS, '{}'), '$.OBSTACLE', 0),
        RED_DEBUFFS = JSON_SET(COALESCE(RED_DEBUFFS, '{}'), '$.MAGNET', 0),
        RED_DEBUFFS = JSON_SET(COALESCE(RED_DEBUFFS, '{}'), '$.CANT_PASS', 0)
    WHERE LINE = 1;`);
    await pool.execute(`UPDATE TEAMS 
    SET BLUE_DEBUFFS = JSON_SET(COALESCE(BLUE_DEBUFFS, '{}'), '$.OBSTACLE', 0),
        BLUE_DEBUFFS = JSON_SET(COALESCE(BLUE_DEBUFFS, '{}'), '$.MAGNET', 0),
        BLUE_DEBUFFS = JSON_SET(COALESCE(BLUE_DEBUFFS, '{}'), '$.CANT_PASS', 0)
    WHERE LINE = 1;`);

    await pool.execute(`UPDATE TEAMS 
    SET PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.EGG', 200),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.COIN100', NULL),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.COIN500', NULL),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.RETURN1', NULL),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.CUT1', NULL),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.MESSAGE', NULL),


        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.ROSE', 150),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.COUPON5', 80),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.BEER', 50),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.COIN1000', NULL),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.COIN5000', NULL),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.CUT2', NULL),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.RETURN2', NULL),


        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.CHRISTMAS2', 30),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.CHRISTMAS1', 50),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.COUPON10', 60),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.Discord_Nitro', 50),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.CUT3', NULL),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.RETURN3', NULL),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.SOLO_ORDER', 5),


        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.NECTAR', 4),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.CAKE', 20),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.LHASA', 10),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.COIN10000', NULL),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.CUT4', NULL),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.RETURN4', NULL),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.CHECK50', 10),

        
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.TEQUILA', 1),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.FLOWER_WINE', 2),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.CUT5', NULL),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.TAG',15),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.RETURN5', NULL),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.GEMS300', 30),
        PRIZES = JSON_SET(COALESCE(PRIZES, '{}'), '$.CHECK100', 4)

    WHERE LINE = 1;`);
  }

  await pool.execute(
    `UPDATE TEAMS
      SET ${temp} = JSON_ARRAY_APPEND(IFNULL(${temp}, '[]'), '$', '${id}')
      WHERE LINE = 1;`
  );
}

module.exports = insert;
