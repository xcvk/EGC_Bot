const pool = require("../../../database/db-promise");


async function test() {


  const [inventory] = await pool.execute(`SELECT * FROM PLAYER WHERE ID = ?`,['207672531585466369']);
  
  

  
}
test()