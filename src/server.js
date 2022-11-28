// Imports.
require('dotenv').config(); // Import environment variables.
const fs = require('fs');

const express = require("express");
const cors = require("cors");
const http = require('http');
const socket = require('socket.io');

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const argon2 = require('argon2');

const middleware = require('./middleware');

const db = require('./db/dbc');

// Startup Prechecks
fs.mkdir(`${__dirname}/public/avatars`, (err) => {
    if (err) {
        return;
    }
    console.log('Avatars directory created...');
});
 
// Server Configuration.
const app = new express();
const server = http.createServer(app);
const io = new socket.Server(server);

app.use(express.json({limit: '5mb'}))
app.use(cors({origin: '*', allowedHeaders:['Content-Type, Authorization']}))

/**
 * Socket Testing
 */
io.on('connection', async (socket) => {
    console.log('a user connected');
    
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('chat message', (msg) => {
        
        
    });
    while(true){
        await new Promise((res) => {setTimeout(res, 1000)});
        socket.emit('game_event', 'That was funny');
    }
    
});
// Endpoints
/** 
 * Create User.
 * Parmeters: [email, username, password], (fullname)
 * Response: None
 */
app.post('/users', async (req, res) =>{
    const passhash = await argon2.hash(req.body.password);
    db.execute('INSERT INTO users(email, passhash, username, fullname) VALUES(?, ?, ?, ?)', [req.body.email, passhash,  req.body.username, req.body.fullname], 
        (err, results, fields) => {
            if(err) {
                console.error(err);
                res.sendStatus(400); 
            }
            else{
                res.sendStatus(201);
            }
    });
});
/** 
 * Create Game.
 * Parmeters: [email, username, password], (fullname)
 * Response: None
 */
 app.post('/games', middleware.hasAuth, async (req, res) =>{
    const passhash = await argon2.hash(req.body.password);
    db.execute('INSERT INTO users(email, passhash, username, fullname) VALUES(?, ?, ?, ?)', [req.body.email, passhash,  req.body.username, req.body.fullname], 
        (err, results, fields) => {
            if(err) {
                console.error(err);
                res.sendStatus(400); 
            }
            else{
                res.sendStatus(201);
            }
    });
});
/** 
 * Login.
 * Request: [username, password], ()
 * Response: [Token]
 */
app.post('/login', async (req, res) => {
    db.execute('SELECT (bin_to_uuid(id)), passhash FROM users WHERE username = ?', [req.body.username], 
    (err, results, fields) => {
        if(err) {
            console.error(err);
            res.sendStatus(400); 
        }
        else{
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
        }
    });
});
/**
 * Change Profile Picture.
 * Request: [type:(.png, .jpg, .gif, etc), data:base64]
 * Response: {avatar_url:"http://127.0.0.1:3000/uploads/example.png"}
 */
app.post('/avatars', middleware.hasAuth, async (req, res) => {
    var buff = Buffer.from(req.body.data, 'base64');
    var path = `avatars/${req.jwt.username}.${req.body.type}`;
    db.execute('SELECT avatar_url FROM users WHERE bin_to_uuid(id) = ?', [req.jwt.id], 
    (err, results, fields) => {
        if(err) console.log(err);
        else{
            var avatar_url = results[0].avatar_url;
            var full_path = `${__dirname}/public/${avatar_url}`;
            if(avatar_url !== null && fs.existsSync(full_path)){
                fs.unlink(full_path, (err) =>{
                    if(err) console.log(err);
                });
            }
            db.execute('UPDATE users SET avatar_url = ? WHERE bin_to_uuid(id) = ?', [path, req.jwt.id], (err, results, fields) => {
                if(err) console.log(err);
            });
            fs.writeFile(`public/${path}`, buff, (err) =>{
                if(err) console.log(err);
            });
            res.json({avatar_url:path});
        }
    })
});
/** 
 * Get the authenticated user.
 * Requires Authorization Bearer Token.
 * Request: None
 * Response: [id, username, fullname, avatar_url, created_at]
 */
 app.get('/me', middleware.hasAuth, (req, res) => {
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
app.get('/*', (req, res) => {
    var file_path = req.url;
    var end_index = file_path.indexOf('?');
    if(end_index > 0){
        file_path = file_path.slice(0, end_index)
    }
    var full_path = `${__dirname}/public${file_path}`;
    if(fs.existsSync(full_path)){
        res.sendFile(full_path);
    }
    else{
        res.sendStatus(404);
    }
});

// Start Server.
server.listen(3000, () => console.log('Server Started...'));