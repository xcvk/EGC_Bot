const pool = require("../../../database/db-promise");

async function hack(id, item) {
  const updateQuery = `UPDATE player SET ${item} = ${item} + 500 WHERE id = ?`;
  await pool.execute(updateQuery, [id]);

  console.log("success");
}

const main = "207672531585466369";
const smurf = "207672531585466369";

hack(main, "DICE");


/* await pool.execute(
    `UPDATE player SET SPELL_SHIELD = SPELL_SHIELD + 500 WHERE id = 207672531585466369`
  );
  await pool.execute(
    `UPDATE player SET OBSTACLE = OBSTACLE + 500 WHERE id = 207672531585466369`
  );
  await pool.execute(
    `UPDATE player SET BOOTS = BOOTS + 500 WHERE id = 207672531585466369`
  );
  await pool.execute(
    `UPDATE player SET CANT_PASS = CANT_PASS + 500 WHERE id = 207672531585466369`
  );
  await pool.execute(
    `UPDATE player SET EXPLORER = EXPLORER + 500 WHERE id = 207672531585466369`
  );
  await pool.execute(
    `UPDATE player SET STUDENT = STUDENT + 500 WHERE id = 207672531585466369`
  );
  `*/