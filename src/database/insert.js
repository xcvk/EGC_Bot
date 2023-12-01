const pool = require('./db');



function insert(id) {

    let 红 = null;
    let 蓝 = null;
    let team = null;

    if (Math.round(Math.random() * (1 - 0) + 0) === 0) 
    {
        红 = id;
        team = '红';
    } 
    else 
    {
        蓝 = id;
        team = '蓝';
    }
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool: ' + err.stack);
            return;
        }

       

        const dataToInsert1 = {
            ID: `${id}`,
            TEAM: team,
            DICE: 0,
            STEPS: 0,
            OBSTACLE: 0,
            STUDENT: 0,
            CANT_PASS: 0,
            TELEPORTER: 0,
            MAGNET: 0,
            BOOTS: 0,
            SPELL_SHIELD: 0,
            SWAP: 0,
            EXPLORER: 0,
            EFFECT_DOUBLE: 0
        };

        

        // Start a transaction
        const sql = 'INSERT INTO PLAYER SET ?';
        connection.query(sql, dataToInsert1, (err, results) => 
        {
          // Release the connection back to the pool
          connection.release();
      
          if (err) {
            console.error('Error executing MySQL query: ' + err.stack);
            return;
          }
      
          console.log('Inserted row with LINE:', results.insertId);
      
        });
    });



    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection from pool: ' + err.stack);
            return;
        }


        const dataToInsert2 = {
            BLUE: 蓝,
            RED: 红
        };

        const sql = 'INSERT INTO TEAMS SET ?';
        connection.query(sql, dataToInsert2, (err, results) => 
        {
          // Release the connection back to the pool
          connection.release();
      
          if (err) {
            console.error('Error executing MySQL query: ' + err.stack);
            return;
          }
      
          console.log('Inserted row with LINE:', results.insertId);
      
          // Close the connection pool (optional)
          
        });
    });
}
module.exports = insert;

