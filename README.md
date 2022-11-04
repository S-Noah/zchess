# zchess

##### Noah Sarge, fall - 2022

Zchess is a web application that allows 2 people to play chess restfully. 

### Requirements
  - Node.js
    - argon2 - Used to hash passwords and verify them.
    - cors - Used to black/white list certain traffic.
    - crypto - Used to generate secrets.
    - express - Used to process requests, passed off to custom handlers.
    - openssl - Used to create .pem certs to host HTTPS.
    - jsonwebtoken - Used to sign and verify Auth Tokens.
    - mysql2 - Database Wrapper.
    - fs - Javascript Async FileSystem.
    

### Installation
  1. Clone repository from 

### Backend
- Uses `Node.js` and `MySQL`. Allows the user to RESTfully manipulate their:
  - Data Model in MYSQL:
    - *users*:
      - id : `BINARY(16)` - uuid,
      - username: `VARCHAR(255)`,
      - passhash: `VARCHAR(255)`,
      - fullname: `VARCHAR(255)`,
      - avatar_url: `VARCHAR(100)`,
      - created_at: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      - updated_at: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    
    - *games*:
      - id : `BINARY(16)` - uuid,
      - white_id : `BINARY(16) FOREIGN KEY REFERENCES users` - uuid, 
      - black_id : `BINARY(16) FOREIGN KEY REFERENCES users` - uuid, 
      - time_limit: `INT`,
      - white_time: `INT`,
      - black_time: `INT`,
      - is_active: `BOOLEAN DEFAULT 1`,
      - fen: `VARCHAR(120)`,
      - created_at: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      - updated_at: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
      - pgn `TEXT(500)`,
    - *messages*:
      - owner_id : `BINARY(16) FOREIGN KEY REFERENCES users` - uuid, 
      - game_id : `BINARY(16) FOREIGN KEY REFERENCES users` - uuid, 
      - created_at: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      - content: `TEXT(500)`,
    - *friends*
      - owner_id : `BINARY(16) FOREIGN KEY REFERENCES users` - uuid, 
      - friend_id : `BINARY(16) FOREIGN KEY REFERENCES users` - uuid, 
      - created_at: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
   
 ### Frontend
- Uses `HTML`, `JavaScript`, and `CSS`.
  - Shows a chatlog.
  - Shows a chessboard using a `<canvas/>` tag.
  - Shows a move list & times for the current game.

