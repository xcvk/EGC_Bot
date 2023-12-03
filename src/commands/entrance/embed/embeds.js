const {db_host,db,db_password,db_username} = require('../../../config.json');

const mysql = require('mysql2/promise');


const pool = mysql.createPool({
  host: db_host,
  user: db_username,
  password: db_password,
  database: db,
  port: 3306,
});

async function make_embed(interaction) {
  
    const [results] = await pool.execute(`SELECT STEPS, TEAM, DICE FROM PLAYER WHERE id = ?`, [interaction.user.username]);
    console.log(results);
    return results;
    
}

module.exports = make_embed;