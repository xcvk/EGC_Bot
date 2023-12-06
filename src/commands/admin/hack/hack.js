const pool = require("../../../database/db-promise");

async function hack(id, item) {
  const updateQuery = `UPDATE player SET ${item} = ${item} + 500 WHERE id = ?`;
  await pool.execute(updateQuery, [id]);
  console.log("success");
}

const main = "207672531585466369";
const smurf = "796445992249327646";

hack(main, "DICE");
hack(smurf,"DICE");