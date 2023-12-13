const pool = require("../../../database/db-promise");

async function reset(table) {
    await pool.execute("DELETE FROM PLAYER WHERE LINE = 4");
    await pool.execute("DELETE FROM PLAYER WHERE LINE = 2");
    await pool.execute("DELETE FROM PLAYER WHERE LINE = 1");
    await pool.execute("DELETE FROM PLAYER WHERE LINE = 3");
    await pool.execute("ALTER TABLE PLAYER AUTO_INCREMENT = 1");
    if (table) {
        await pool.execute("DELETE FROM TEAMS WHERE LINE = 1");
        await pool.execute("DELETE FROM TEAMS WHERE LINE = 2");
        await pool.execute("DELETE FROM TEAMS WHERE LINE = 3");
        await pool.execute("DELETE FROM TEAMS WHERE LINE = 4");
        await pool.execute("DELETE FROM TEAMS WHERE LINE = 5");
        await pool.execute("DELETE FROM TEAMS WHERE LINE = 6");
        await pool.execute("DELETE FROM TEAMS WHERE LINE = 7");
        await pool.execute("DELETE FROM TEAMS WHERE LINE = 8");
        await pool.execute("ALTER TABLE TEAMS AUTO_INCREMENT = 1");
    }

    console.log("success");
}

reset(true);