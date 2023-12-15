const pool = require("../../../database/db-promise");


async function test() {
  const id = "321";
  const [blue_member] = await pool.execute("SELECT BLUE_MEMBERS FROM TEAMS WHERE LINE = 1");
  const [red_member] = await pool.execute("SELECT RED_MEMBERS FROM TEAMS WHERE LINE = 1");
  console.log(red_member[0]);
  if (!blue_member[0].BLUE_MEMBERS.includes(id) && !red_member[0].RED_MEMBERS.includes(id)) {


  }
}
test()