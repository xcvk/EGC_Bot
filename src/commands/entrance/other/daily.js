const { all } = require("async");
const pool = require("../../../database/db-promise");



async function daily(client) {
  
  const guildId = "543263386461274125";

  const guild = await client.guilds.fetch(guildId);
  

  // Get the roles of the member
  
  const [members] = await pool.execute("SELECT ID FROM PLAYER");
  
  for (const userId of members) {
    const member = await guild.members.fetch(userId);
    const roles = member.roles.cache;
    let amount = 0;
    let allRoles = new Set();


    for (const [roleId] of roles) {
      allRoles.add(roleId);
    }


    if (allRoles.has("806110236167110657") ||
        allRoles.has("806110392316723253") ||
        allRoles.has("806110402752544788")) 
    {
        amount += 10;
    } 
    else if (
      allRoles.has("545780389348638720") ||
      allRoles.has("545780392284913680") ||
      allRoles.has("545780395313201152") ||

      allRoles.has("806109637405048852") ||
      allRoles.has("806109807090073650") ||
      allRoles.has("806109926790922240") ||
      allRoles.has("806110090888740875"))
    {
      amount += 5;
    }
    
    if (allRoles.has("615697548686000156") ||
             allRoles.has("558212416333152256"))
    {
      amount += 5;
    }
    else
    {
      if (allRoles.has("605958377775956017") ||
          allRoles.has("607486774780100629") ||
          allRoles.has("626275157656338433"))
          {
            amount += 3;
          }
    }


    await pool.execute(
      `UPDATE PLAYER SET DICE = DICE + ${amount} WHERE ID = ?`,
      [userId]
    );
    await pool.execute(
      `UPDATE PLAYER SET DICE_USED = 0 WHERE ID = ?`,
      [userId]
    );

  }
}

module.exports = daily;