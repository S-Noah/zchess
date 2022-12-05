# Zchess

#### By Noah Sarge, fall - 2022

### Description

Zchess is a web application that allows 2 people to play chess restfully.
It allows users to create an account and upload a picture. It also allows them to start games and chat along the way. Built using Node.JS, MySQL, and HTML only.

### Directory

  - src
      - server.js - Backend Server.
      - middleware.js - Handles Auth.
      - create_tables.sql
      - package.json
      - .env - Safely stores database credentials and secret per machine.
    - public
      - avatars - All User Avatar Uploads
        - zero.gif
      - pieces - All Chess Piece Images.
        - br.svg
        - bn.svg
        - bb.svg
        - bk.svg
        - bq.svg
        - bp.svg
        - wr.svg
        - wn.svg
        - ww.svg
        - wk.svg
        - wq.svg
        - wp.svg
      - styles
        - main.css
      - favicon.ico
      - index.html - Frontend Index.
      - index.js
      - chess.js

### Live Hosts

<https://digdug.cs.endicott.edu/~nsarge/project>

<http://noahsarge.com>

### Requirements

  - MySQL
  - Node.js

### Installation

  1. Clone repository.
  2. cd to src
  3. Run `npm install` to install required packages.
  4. Open MySQL
  5. Create a database `your_db`
  6. Create a `user` with a `password`
  7. Grant all privileges for your `user` on `your_db`
  8. Flush privileges.
  9. Create .env file with `DB_HOST, DB_USER, DB_PASS`, `DB_NAME`, and `TOKEN_SECRET`.
  10. Run `npm start`

### API

| Url | Method | Requires Auth | Request | Response | Description |
| :-: | :----: | :-----------: | :-----: | :------: | :---------: |
| /*| GET | false | None | `file@public/url` | Gets the file at the public/url |
| /users | POST | false | `{username:"", password:"", email:"", fullname:""}` | None | Creates a new user |
| /login | POST | false | `{username:"", password:""}` | `{token:""}` | Handles login and returns a token |
| /me | GET | TRUE | None | `{"id":"", "username":"", "email":"", "fullname":"", "avatar_url":"", "created_at":"", "updated_at":""}` | Gets the authed user |s
| /games | POST | true | `{opponent_id:"", color:"", time_limit:""}` | `{game_id:""}` | Creates a new game and challenges the players |
| /messages | POST | true | `{game_id:"", content:""}` | None | Creates a chat message |
| /avatars | POST | true | `{type:"", data:base64("")}` | `{avatar_url:""}` | Uploads a users avatar |
| /socket.io | GET | true | `{game_id:""}` | `web socket` | socket to stream game events |

## Backend
### Uses `Node.js` and `MySQL`. Allows the user to RESTfully CRUD data model:

  #### Imports

  - argon2 - Used to hash passwords and verify them.
  - cors - Used to black/white list certain traffic.
  - crypto - Used to generate secrets.
  - dotenv - Used to safely store and load DB credentials and secrets.
  - express - Used to process requests, passed off to custom handlers.
  - openssl - Used to create .pem certs to host HTTPS.
  - jsonwebtoken - Used to sign and verify Auth Tokens.
  - mysql2 - Database Wrapper.
  - fs - Javascript Async FileSystem.
  - socket.io - Library for opening and managing websockets used in tandem with express.
  - js-chess-engine
  #### Models

  - **users**:
    - id : `INT`,
    - username: `VARCHAR(255)`,
    - email: `VARCHAR(320)`,
    - passhash: `VARCHAR(255)`,
    - fullname: `VARCHAR(255)`,
    - avatar_url: `VARCHAR(100)`,
    - created_at: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    - updated_at: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,

  - **games**:
    - id : `INT`,
    - white_id : `INT FOREIGN KEY REFERENCES users`, 
    - black_id : `INT FOREIGN KEY REFERENCES users`, 
    - time_limit: `INT`,
    - white_time: `INT`,
    - black_time: `INT`,
    - is_active: `BOOLEAN DEFAULT 1`,
    - fen: `VARCHAR(120)`,
    - created_at: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    - updated_at: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    - moves: `TEXT(500)`,
  - **messages**:
    - owner_id : `INT FOREIGN KEY REFERENCES users`, 
    - game_id : `INT FOREIGN KEY REFERENCES users`, 
    - created_at: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    - content: `TEXT(500)`,
  - **friends**
    - owner_id : `INT FOREIGN KEY REFERENCES users`, 
    - friend_id : `INT FOREIGN KEY REFERENCES users`, 
    - created_at: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
   
## Frontend

### Uses `HTML`, `JavaScript`, and `CSS`. Allows the user to manipulate their account and chessboard.

#### Models

##### me

```json
{
  "id":"1",
  "username":"zero",
  "email":"zero@noahsarge.com",
  "full name":"zero lamperouge",
  "avatar_url":"avatars/zero.gif",
  "created_at":"2022-11-08T04:38:46+0000",
  "updated_at":"2022-11-08T04:38:46+0000"
}
```
##### game

```json
{
  "id":"1",
  "white_id":"2",
  "black_id":"5",
  "time_limit":"5:00",
  "white_time":"5:00",
  "black_time":"5:00",
  "fen":"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  "moves":"c2c4 e7e5",
  "created_at":"2022-11-08T04:38:46+0000",
  "updated_at":"2022-11-08T04:38:46+0000"
}
```

##### message

```json
{
  "owner_id":"1",
  "game_id":"2",
  "content":"Great Move!",
  "created_at":"2022-11-08T04:38:46+0000"
}
```

##### friend

```json
{
  "owner_id":"2",
  "friend_id":"5",
  "created_at":"2022-11-08T04:38:46+0000"
}
```


## Features

- [x] Signup.
- [x] Login.
- [x] Get User Data from Token.
- [x] Upload User Avatar.
- [x] Delete Old User Avatar on change.
- [x] Add Authentication Middleware
- [x] Serve `public` folder on `/*`.
- [x] Use .env to store sensitive data.
- [x] Create login page.
- [x] Create register page.
- [x] Change picture from frontend.
- [x] Set game time limit.
- [x] Create home page.
- [x] Create play_game page.
- [ ] Create friends window.
- [x] Create chessboard.
- [ ] Create chatlog.
- [ ] Create movelog.
- [x] Add chess logic to javascript board controller.
- [x] Add chess logic to backend.
- [x] Stream a game as json events over time.
- [ ] Stream a chatlog as json events over time.
- [x] Create a game.
- [ ] Add a friend to the game.
- [x] Challenge another user to the game.
- [ ] Challenge a friend to the game.
- [x] Play the game.
- [ ] Chat in the game.
- [ ] Review old games.
- [ ] Add more feedback on chess board.
- [ ] Show possible moves for a piece.
- [ ] Show when the game is over.
- [ ] Allow a user to return to the play menu.
- [ ] Implement time into chess games.


