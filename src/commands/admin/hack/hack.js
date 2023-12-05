const pool = require("../../../database/db-promise");

async function hack(id, item) {
  const updateQuery = `UPDATE player SET ${item} = ${item} + 5000 WHERE id = ?`;
  await pool.execute(updateQuery, [id]);
  console.log("success");
}

hack("dereluvr", "DICE");