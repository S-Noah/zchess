const mysql = require('mysql2');
const fs = require('fs');

// Database Configuration.
const db = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASS,
    database:process.env.DB_NAME,
    multipleStatements: true
});
/**
 * Starts the connection to the database.
 * Tries to run create_tables.sql.
 */
db.connect((err) =>{
    if(err) return console.log(err);
    console.log('Connected to zchess database...');
    console.log("loading schema...");
    var create_statements = fs.readFileSync('db/create_tables.sql').toString();
    db.query(create_statements, (err, results, fields) => {
        if(err)console.log(err);
    })
});

module.exports = db