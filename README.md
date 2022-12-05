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
| /users/:user_id | GET | false | None | `{"id":"", "username":"", "email":"", "fullname":"", "avatar_url":"", "created_at":"", "updated_at":""}` | Gets a user |
| /login | POST | false | `{username:"", password:""}` | `{token:""}` | Handles login and returns a token |
| /me | GET | TRUE | None | `{"id":"", "username":"", "email":"", "fullname":"", "avatar_url":"", "created_at":"", "updated_at":""}` | Gets the authed user |
| /games | POST | true | `{opponent_id:"", color:"", time_limit:""}` | `{game_id:""}` | Creates a new game and challenges the players |
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
    - created_at: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
    - updated_at: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
   
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
  "color":"White",
  "opponent_id":1,
  "fen":null,
  "possible_moves":[],
  "check":false,
  "checkmate":false,
  "turn":"white"
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
- [x] Create chessboard.
- [x] Add chess logic to javascript board controller.
- [x] Add chess logic to backend.
- [x] Stream a game as json events over time.
- [x] Create a game.
- [x] Challenge another user to the game.
- [x] Play the game.
- [x] Add more feedback on chess board.
- [x] Show possible moves for a piece.


