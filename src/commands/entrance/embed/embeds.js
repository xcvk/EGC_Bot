
const pool = require('../../../database/db-promise');

async function make_embed(interaction) {
  const [results] = await pool.execute(
    `SELECT STEPS, TEAM, DICE FROM PLAYER WHERE id = ?`,
    [interaction.user.username]
  );
  return results;
}

module.exports = make_embed;
