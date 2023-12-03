
const pool = require('./db');


function checkValueExist(table,column,value, callback) {
    let retval = 0;
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting MySQL connection from pool: ' + err.stack);
        return callback(err, null);
      }
  
      // Specify the table and column you want to check
  
  
      // SQL query to check if the value exists
      const sql = `SELECT COUNT(*) AS count FROM ${table} WHERE ${column} = ?`;
  
      connection.execute(sql, [value], (err, results) => {
        // Release the connection back to the pool
        connection.release();
  
        if (err) {
          console.error('Error executing MySQL query: ' + err.stack);
          return callback(err, null);
        }
  
        // Check if the count is greater than 0 (value exists) and return a boolean
        const valueExists = results[0].count > 0;
        retval = valueExists;
        callback(null, valueExists);
      });
    });
    return retval;
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
