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

const chess_engine = require('js-chess-engine');

const active_games = {};

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
    jwt.verify(socket.handshake.auth.token, process.env.TOKEN_SECRET, (err, decoded) => {
        if(err) {
            console.log(err);
        }
        else{
            console.log("JOINING", `game_${socket.handshake.query.game_id}`);
            socket.join(`game_${socket.handshake.query.game_id}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('move', (msg) => {
        let game = active_games[msg.game_id];
        try{
            game.move(msg.start, msg.stop);
            io.of("/").to(`game_${msg.game_id}`).emit('game_event', {fen:game.exportFEN()});
        }
        catch{
            console.log('ILLEGAL_MOVE')
        }
    });
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
    db.execute('SELECT id FROM users WHERE username = ?', [req.body.opponent], 
    (err, user_results, fields) => {
        if(err) {
            console.error(err);
            res.sendStatus(400); 
        }
        else if(user_results.length){
            let data = [];
            if(req.body.color === "Random"){
               req.body.color =  (Math.random() < 0.5)? 'White':'Black';
            }
            if(req.body.color === 'White'){
                data.push(req.jwt.id);
                data.push(user_results[0].id);
            }
            else if(req.body.color === 'Black'){
                data.push(user_results[0].id);
                data.push(req.jwt.id);
            }
            data.push(req.body.time_limit);
            db.execute('INSERT INTO GAMES(white_id, black_id, time_limit) VALUES(?, ?, ?)', data,
            (err, results, fields) => {
                if(err){
                    console.error(err);
                    res.sendStatus(400);
                }
                else{
                    active_games[results.insertId] = new chess_engine.Game();
                    res.json({game_id:results.insertId});
                }
            });
        }
    });
});
/** 
 * Login.
 * Request: [username, password], ()
 * Response: [Token]
 */
app.post('/login', async (req, res) => {
    db.execute('SELECT id, passhash FROM users WHERE username = ?', [req.body.username], 
    (err, results, fields) => {
        if(err) {
            console.error(err);
            res.sendStatus(400); 
        }
        else if(results.length){
            argon2.verify(results[0].passhash, req.body.password)
            .then((verified) => {
                if(verified){
                    var token = jwt.sign({id:results[0].id, username:req.body.username}, process.env.TOKEN_SECRET, {expiresIn:1000});
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
    db.execute('SELECT avatar_url FROM users WHERE id = ?', [req.jwt.id], 
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
            db.execute('UPDATE users SET avatar_url = ? WHERE id = ?', [path, req.jwt.id], (err, results, fields) => {
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
    db.execute('SELECT id, username, fullname, avatar_url, created_at FROM users WHERE id = ?', [req.jwt.id], (err, results, fields) => {
        if(err) console.log(err);
        else{
            res.json(results[0]);
        }
    })
});
/** 
 * Get the authenticated user.
 * Requires Authorization Bearer Token.
 * Request: None
 * Response: [id, username, fullname, avatar_url, created_at]
 */
 app.get('/friends', middleware.hasAuth, (req, res) => {
    db.execute('SELECT friend_id FROM friends WHERE owner_id = ?', [req.jwt.id], (err, results, fields) => {
        if(err) console.log(err);
        else{
            res.json(results);
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
server.listen(3000, () => {
    console.log('Server Started...')
});