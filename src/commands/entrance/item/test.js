const pool = require("../../../database/db-promise");


async function test() {


  const [caster] = await pool.execute(`SELECT BLUE_DEBUFF,RED_DEBUFF FROM TEAMS WHERE LINE = 1`);
  person = caster[0].RED_DEBUFFS.CANT_PASS[0];
  
}
test()