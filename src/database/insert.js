const pool = require("./db-promise");

async function insert(id) {
  const team = Math.round(Math.random()) === 0 ? "红" : "蓝";

  const query = `
    INSERT INTO PLAYER (ID, TEAM, DICE, STEPS, OBSTACLE, STUDENT, CANT_PASS, TELEPORTER, MAGNET, BOOTS, SPELL_SHIELD, SWAP, EXPLORER, EFFECT_DOUBLE,BUFFS, DEBUFFS,ITEM_HISTORY)
    VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL)
  `;

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
    SET DEBUFFS = JSON_SET(COALESCE(DEBUFFS, '{}'), '$.SWAP',0)
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

  const [rows] = await pool.execute("SELECT * FROM TEAMS WHERE LINE = 1");

  if (rows.length === 0) {
    await pool.execute(`INSERT INTO TEAMS (BLUE_STEPS,RED_STEPS)
    VALUES (0,0)`);
    await pool.execute(`UPDATE TEAMS 
    SET RED_DEBUFFS = JSON_SET(COALESCE(RED_DEBUFFS, '{}'), '$.OBSTACLE', 0),
        RED_DEBUFFS = JSON_SET(COALESCE(RED_DEBUFFS, '{}'), '$.MAGNET', 0)
    WHERE LINE = 1;`);
    await pool.execute(`UPDATE TEAMS 
    SET BLUE_DEBUFFS = JSON_SET(COALESCE(RED_DEBUFFS, '{}'), '$.OBSTACLE', 0),
        BLUE_DEBUFFS = JSON_SET(COALESCE(RED_DEBUFFS, '{}'), '$.MAGNET', 0)
    WHERE LINE = 1;`);
  }

  await pool.execute(
    `UPDATE TEAMS
      SET ${temp} = JSON_ARRAY_APPEND(IFNULL(${temp}, '[]'), '$', '${id}')
      WHERE LINE = 1;`
  );
}

module.exports = insert;
