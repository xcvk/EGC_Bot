const pool = require("../../../database/db-promise");



async function daily() {
    const [blue] = await pool.execute("SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1");
    const [red] = await pool.execute("SELECT RED_MEMBERS FROM TEAMS WHERE LINE = 1");

    for (let i = 0; i < blue[0].BLUE_MEMBERS.length; ++i) {
        const [steps] = await pool.execute("SELECT DICE FROM PLAYER WHERE ID = ?",[blue[0].BLUE_MEMBERS[i]]);
        await pool.execute(
          `UPDATE PLAYER SET DICE = DICE + 1 WHERE ID = ?`,
          [steps[0].DICE]
        );
    }

    for (let i = 0; i < red[0].RED_MEMBERS.length; ++i) {
      const [steps] = await pool.execute(
        "SELECT DICE FROM PLAYER WHERE ID = ?",
        [red[0].RED_MEMBERS[i]]
      );
      await pool.execute(
        `UPDATE PLAYER SET DICE = DICE + 1 WHERE ID = ?`,
        [steps[0].DICE]
      );
    }
}

module.exports = daily;