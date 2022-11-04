// Imports.
require('dotenv').config(); // Import Environment Variables.
const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const fs = require('fs');
const crypto = require('crypto')
const argon2 = require('argon2')

// Methods.

const hasAuth = async (req, res, next) => {
    var header = req.headers['authorization'];
    if(typeof header === 'undefined'){
        res.sendStatus(401);
    }
    else{
        var token = header.split(' ');
        token = token[1];
        jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
            if(err) {
                res.sendStatus(403);
            }
            else{
                req.token = token;
                req.jwt = decoded;
                next();
            }
        });
    }
}

// Server Configuration.
const app = new express();
app.use(express.json({limit: '5mb'}))
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


// Endpoints
app.post('/users', async (req, res) =>{
    const passhash = await argon2.hash(req.body.password);
    db.execute('INSERT INTO users(username, passhash, fullname) VALUES(?, ?, ?)',
    [req.body.username, passhash, req.body.fullname], (err, results, fields) => {
        res.json();
    });
});
app.post('/login', async (req, res) => {
    db.execute('SELECT (bin_to_uuid(id)), passhash FROM users WHERE username = ?',
    [req.body.username], (err, results, fields) => {
        console.log(results);
        argon2.verify(results[0].passhash, req.body.password)
        .then((verified) => {
            if(verified){
                var token = jwt.sign({id:results[0]['(bin_to_uuid(id))'], username:req.body.username}, process.env.TOKEN_SECRET, {expiresIn:1000});
                res.json({token:token});
            }
            else{
                res.json({error:'Unauthorized'});
            }
        });
    });
});
app.get('/uploads/*', (req, res) => {
    res.sendFile(__dirname + req.url);
})
app.post('/upload', hasAuth, async (req, res) => {
    var buff = Buffer.from(req.body.data, 'base64');
    var path = `uploads/${req.jwt.username}.${req.body.type}`;
    var host = 'http://127.0.0.1:3000/'
    db.execute('SELECT avatar_url FROM users WHERE bin_to_uuid(id) = ?', [req.jwt.id], (err, results, fields) => {
        if(err) console.log(err);
        fs.unlink(results[0].avatar_url, (err) =>{
            if(err) console.log(err);
        });
    })
    db.execute('UPDATE users SET avatar_url = ? WHERE bin_to_uuid(id) = ?', [path, req.jwt.id], (err, results, fields) => {
        if(err) console.log(err);
    });
    fs.writeFile(path, buff, (err) =>{
        if(err) console.log(err);
    });
    res.json({avatar_url:host + path});
})

// Start Server.
app.listen(3000, () => console.log('Server Started...'));
