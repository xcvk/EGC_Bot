const pool = require('../../../database/db-promise');

async function reward(id) {
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

  let random = Math.floor(Math.random() * (11 - 1) + 1);
  let item = map.get(random);
  const updateQuery = `UPDATE player SET ${item} = ${item} + 1 WHERE id = ?`;
  await pool.execute(updateQuery, [id]);
  return item;
}


module.exports = reward;