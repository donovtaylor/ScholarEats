const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'csc648database.cfgu0ky6ydzi.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: 'vdpE9YYQiaGl6VWibkiO',
  database: 'ScholarEats',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;
