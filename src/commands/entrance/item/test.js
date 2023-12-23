const pool = require("../../../database/db-promise");


async function test() {

  
  const roleIds = new Set([
    'id1',
    'id2',
    'id3',
  ]);

  const hasRole = member.roles.cache.filter(r => roleIds.has(r));

  if (hasRole) {
    // add dice
  }

  
}
test()