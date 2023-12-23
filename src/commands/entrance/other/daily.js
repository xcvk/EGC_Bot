const pool = require("../../../database/db-promise");



async function daily() {
    const [blue] = await pool.execute("SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1");
    const [red] = await pool.execute("SELECT RED_MEMBERS FROM TEAMS WHERE LINE = 1");

    


    for (let i = 0; i < blue[0].BLUE_MEMBERS.length; ++i) {
        
        const [steps] = await pool.execute("SELECT DICE, DICE_USED FROM PLAYER WHERE ID = ?",[blue[0].BLUE_MEMBERS[i]]);
        const [players] = await pool.execute("SELECT PROPERTY FROM REGISTRATION WHERE ID = ?", [blue[0].BLUE_MEMBERS[i]]);
        let amount = 3;
        if (players[0].PROPERTY === 1) {
          amount = 5;
        }

        await pool.execute(
          `UPDATE PLAYER SET DICE = DICE + ${amount} WHERE ID = ?`,
          [steps[0].DICE]
        );
      await pool.execute(
        `UPDATE PLAYER SET DICE_USED = 0 WHERE ID = ?`,
        [steps[0].DICE]
      );
    }

    for (let i = 0; i < red[0].RED_MEMBERS.length; ++i) {
      const [steps] = await pool.execute(
        "SELECT DICE, DICE_USED FROM PLAYER WHERE ID = ?",
        [red[0].RED_MEMBERS[i]]
      );
      const [players] = await pool.execute("SELECT PROPERTY FROM REGISTRATION WHERE ID = ?", [red[0].RED_MEMBERS[i]]);
      let amount = 3;
      if (players[0].PROPERTY === 1) {
        amount = 5;
      }

      await pool.execute(
        `UPDATE PLAYER SET DICE = DICE + ${amount} WHERE ID = ?`,
        [steps[0].DICE]
      );
      await pool.execute(
        `UPDATE PLAYER SET DICE_USED = 0 WHERE ID = ?`,
        [steps[0].DICE]
      );
    }
}

module.exports = daily;