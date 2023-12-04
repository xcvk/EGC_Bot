const pool = require("./db-regular.js");

async function insert(id) {
  const team = Math.round(Math.random()) === 0 ? "红" : "蓝";

  const dataToInsert1 = {
    ID: id,
    TEAM: team,
    DICE: 0,
    STEPS: 0,
    OBSTACLE: 0,
    STUDENT: 0,
    CANT_PASS: 0,
    TELEPORTER: 0,
    MAGNET: 0,
    BOOTS: 0,
    SPELL_SHIELD: 0,
    SWAP: 0,
    EXPLORER: 0,
    EFFECT_DOUBLE: 0,
  };

  const dataToInsert2 = {
    BLUE: team === "蓝" ? id : null,
    RED: team === "红" ? id : null,
  };

  const [rows1] = await pool
    .promise()
    .query("INSERT INTO PLAYER SET ?", dataToInsert1);
  // Now insert into TEAMS table
  const [rows2] = await pool
    .promise()
    .query("INSERT INTO TEAMS SET ?", dataToInsert2);
}

module.exports = insert;
