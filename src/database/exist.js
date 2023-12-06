
const pool = require('./db-promise.js');


async function checkValueExist(table,column,value,json) {
    
  if (!json) {
    const [rows] = await pool.query(
      `SELECT ${column} FROM ${table} WHERE ID = ?`, [value]
    );
    if (!rows[0]) {
      return false;
    }
    return true;
  }
}

/*
checkValueExist('player','id','dereluvr', (err, exists) => {
    if (err) {
      console.error('Error in checkValueExist function:', err);
      // Handle the error, possibly return or log it
    } else {
      console.log('Value exists:', exists);
    }
});

*/

module.exports = checkValueExist;
