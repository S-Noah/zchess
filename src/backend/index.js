// Imports.
require('dotenv').config(); // Import Environment Variables.
const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const fs = require('fs');
const crypto = require('crypto');
const argon2 = require('argon2');
/**
 * @function hasAuth ensures the user supplied a valid JWT token and decodes it. stores it in the request, and routes to the next middleware or endpoint.
 * @param {*} req request from previous middleware or endpoint.
 * @param {*} res request from previous middleware or endpoint.
 * @param {*} next next middleware or endpoint to route to.
 */
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
/** 
 * Create User.
 * Parmeters: [email, username, password], (fullname)
 * Response: None
 */
app.post('/users', async (req, res) =>{
    const passhash = await argon2.hash(req.body.password);
    db.execute('INSERT INTO users(username, passhash, fullname) VALUES(?, ?, ?)',
    [req.body.username, passhash, req.body.fullname], (err, results, fields) => {
        res.json();
    });
});
/** 
 * Login.
 * Request: [email | username, password], ()
 * Response: None
 */
app.post('/login', async (req, res) => {
    db.execute('SELECT (bin_to_uuid(id)), passhash FROM users WHERE username = ?',
    [req.body.username], (err, results, fields) => {
        argon2.verify(results[0].passhash, req.body.password)
        .then((verified) => {
            if(verified){
                var token = jwt.sign({id:results[0]['(bin_to_uuid(id))'], username:req.body.username}, process.env.TOKEN_SECRET, {expiresIn:1000});
                res.json({token:token});
            }
            else{
                res.sendStatus(403)
            }
        });
    });
});
/**
 * Change Profile Picture.
 * Request: [type:(.png, .jpg, .gif, etc), data:base64]
 * Response: {avatar_url:"http://127.0.0.1:3000/uploads/example.png"}
 */
 app.post('/uploads', hasAuth, async (req, res) => {
    var buff = Buffer.from(req.body.data, 'base64');
    var path = `uploads/${req.jwt.username}.${req.body.type}`;
    db.execute('SELECT avatar_url FROM users WHERE bin_to_uuid(id) = ?', [req.jwt.id], (err, results, fields) => {
        if(err) console.log(err);
        else{
            var avatar_url = results[0].avatar_url;
            var fullpath = `${__dirname}/${avatar_url}`;
            if(avatar_url !== null && fs.existsSync(fullpath)){
                console.log('unlinking', fullpath)
                fs.unlink(fullpath, (err) =>{
                    if(err) console.log(err);
                });
            }
            db.execute('UPDATE users SET avatar_url = ? WHERE bin_to_uuid(id) = ?', [path, req.jwt.id], (err, results, fields) => {
                if(err) console.log(err);
            });
            fs.writeFile(path, buff, (err) =>{
                if(err) console.log(err);
            });
            res.json({avatar_url:path});
        }
    })
});
/** 
 * Get uploaded content.
 * @url the request url.
 * Request: None
 * Response: file@url
 */
 app.get('/me', hasAuth, (req, res) => {
    db.execute('SELECT (bin_to_uuid(id)), username, fullname, avatar_url, created_at FROM users WHERE (bin_to_uuid(id)) = ?', [req.jwt.id], (err, results, fields) => {
        if(err) console.log(err);
        else{
            results[0]['id'] = results[0]['(bin_to_uuid(id))'];
            delete results[0]['(bin_to_uuid(id))'];
            res.json(results[0]);
        }
    })
});
/** 
 * Get uploaded content.
 * @url the request url.
 * Request: None
 * Response: file@url
 */
app.get('/uploads/*', (req, res) => {
    var sliced =  req.url.slice(0, req.url.indexOf('?'));
    console.log(sliced);
    var path = __dirname + sliced;
    if(fs.existsSync(path)){
        res.sendFile(path);
    }
    else{
        res.sendStatus(404);
    }
});

/** 
 * Get uploaded content.
 * @url the request url.
 * Request: None
 * Response: file@url
 */
 app.get('/stream', async (req, res) => {
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    let i = 0;
    for(let i = 0; i < 100; i++){
        if(i % 4 == 0){
            res.write(JSON.stringify({test:i}) + '\n');
        }
        else{
            res.write("\n");
        }
        
        await new Promise((res) => {setTimeout(res, 1000)});
    }
    
    res.end();
});

// Start Server.
app.listen(3000, () => console.log('Server Started...'));
