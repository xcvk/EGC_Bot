const { db_host, db, db_password, db_username } = require("../config.json");
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: db_host,
  user: db_username,
  password: db_password,
  database: db,
  port: 3306,
  maxIdle: 10,
  connectionLimit: 10,
});

module.exports = pool;
