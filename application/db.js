const mysql = require('mysql2');
const dbname = test_db_scholareats;
const connection = mysql.createConnection({
    host:       'localhost',
    user:       'root',
    password:   'password',
    database:   dbname
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to ' + dbname);
});

module.exports = connection;