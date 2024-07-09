const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'csc648database.cfgu0ky6ydzi.us-east-2.rds.amazonaws.com',       // Replace with your database host
  user: 'admin',   // Replace with your database username
  password: 'vdpE9YYQiaGl6VWibkiO', // Replace with your database password
  database: 'ScholarEats'    // Replace with your database name
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected...');
});

module.exports = db;
