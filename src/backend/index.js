// Imports.
require('dotenv').config(); // Import Environment Variables.
const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const fs = require('fs');
const crypto = require('crypto')
const argon2 = require('argon2')

//var decoded = jwt.verify(token, process.env.TOKEN_SECRET)

// Server Configuration.
const app = new express();
app.use(express.json())
app.use(cors({origin: '*', allowedHeaders:['Content-Type, Authorization']}))

// Database Configuration.
const db = mysql.createConnection({
    host:'localhost',
    user:'zero',
    password:process.env.DBPASS,
    database:'zchess'
});

db.connect((err) =>{
    if(err) console.log(err);
    else console.log('Connected to zchess database');
});

app.post('/test', (req, res) => {
    var buff = Buffer.from(req.body.data, 'base64');
    var ryansObj = {
        age:20,
        name:'ryan',
    }
    fs.writeFileSync('testimg.jpg', buff);
    res.json({data:'success'});
})
app.post('/signup', async (req, res) =>{
    const passhash = await argon2.hash(req.body.password);
    db.execute('INSERT INTO users(username, passhash, fullname) VALUES(?, ?, ?)',
    [req.body.username, passhash, req.body.fullname], (err, results, fields) => {
        res.json('SUCCESS');
    });
});
app.post('/login', async (req, res) => {
    db.execute('SELECT passhash FROM users WHERE username = ?',
    [req.body.username], (err, results, fields) => {
        argon2.verify(results[0].passhash, req.body.password)
        .then((verified) => {
            if(verified){
                var token = jwt.sign({username:req.body.username}, process.env.TOKEN_SECRET, {expiresIn:1000});
                res.json({token:token});
            }
            else{
                res.json({error:'Unauthorized'});
            }
        });
    });
});
app.post('/token/verify', (req, res) => {
    jwtValid(req.body.token);
    res.send("SUCCESS");
});

// Start Server.
app.listen(3000, () => console.log('Server Started...'));


// Methods.

const jwtValid = (token) => {
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if(err) return console.log(err);
        else return console.log(decoded);
    });
}