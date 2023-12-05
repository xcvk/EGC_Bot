const pool = require('./db-promise');


async function get_steps() {
    const query = `SELECT RED_STEPS, BLUE_STEPS FROM TEAMS;`;

    const [res] = await pool.execute(query);
    return res;
}

module.exports = get_steps;
