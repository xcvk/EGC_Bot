const pool = require("./db-promise");

async function insert(id) {
  const team = Math.round(Math.random()) === 0 ? "红" : "蓝";

  const query = `
    INSERT INTO PLAYER (ID, TEAM, DICE, STEPS, OBSTACLE, STUDENT, CANT_PASS, TELEPORTER, MAGNET, BOOTS, SPELL_SHIELD, SWAP, EXPLORER, EFFECT_DOUBLE,BUFFS, DEBUFFS,ITEM_HISTORY)
    VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL)
  `;

  await pool.execute(query, [id, team]);

  let temp = null;
  if (team == "红") {
    temp = "RED_MEMBERS";
  } else {
    temp = "BLUE_MEMBERS";
  }

  // Now insert into TEAMS table using named placeholders

  const [rows, fields] = await pool.execute(
    "SELECT * FROM TEAMS WHERE LINE = 1"
  );

  if (rows.length === 0)
  {
    await pool.execute(`INSERT INTO TEAMS (BLUE_STEPS,RED_STEPS)
    VALUES (0,0)`);
  }


  await pool.execute(
    `UPDATE TEAMS
      SET ${temp} = JSON_ARRAY_APPEND(IFNULL(${temp}, '[]'), '$', '${id}')
      WHERE LINE = 1;`
  );
}

module.exports = insert;
