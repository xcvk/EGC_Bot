const pool = require('./db');

function get_steps(team,callback) {
    pool.getConnection((err, connection) => {
        if (err) 
        {
          console.error('Error getting MySQL connection from pool: ' + err.stack);
          return;
        }
        

  // Perform the delete operation
        const sql = `SELECT player.id, SUM(player.steps) as total_steps
                    FROM player
                    JOIN teams ON player.id = teams.${team}
                    GROUP BY player.id;`;
        connection.query(sql, (err, results) => {
        // Release the connection back to the pool
            connection.release();
            if (err) {
                console.error('Error executing MySQL query: ' + err.stack);
                return;
            }


            callback(null, results);
        });
    });
}

/* 
get_steps('blue', (err, results) => {
    if (err) {
      console.error('Error in get_steps function: ' + err.stack);
      return;
    }
  
    // Process the results here
    console.log('Total steps:', results);
});
*/

module.exports = get_steps;