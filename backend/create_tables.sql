CREATE TABLE users (
    id BINARY(16) PRIMARY KEY DEFAULT (uuid_to_bin(uuid())),
    username VARCHAR(255) UNIQUE,
    passhash VARCHAR(255),
    fullname VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

CREATE TABLE games (
    id BINARY(16) PRIMARY KEY DEFAULT (uuid_to_bin(uuid())),
    white_id BINARY(16) NOT NULL,
    black_id BINARY(16) NOT NULL,
    time_limit INT,
    white_time INT,
    black_time INT,
    is_active BOOLEAN DEFAULT 1,
    final_fen VARCHAR(120),
    pgn TEXT(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `fk_white_id_idx` (`white_id` ASC) VISIBLE,
    INDEX `fk_black_id_idx` (`black_id` ASC) VISIBLE,
    CONSTRAINT `fk_white_id`
        FOREIGN KEY (`white_id`)
        REFERENCES `zchess`.`users` (`id`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT `fk_black_id`
        FOREIGN KEY (`black_id`)
        REFERENCES `zchess`.`users` (`id`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
)

CREATE TABLE friends (
    owner_id BINARY(16),
    friend_id BINARY(16),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
)

CREATE TABLE messages (
    owner_id BINARY(16),
    game_id BINARY(16),
    recipient_id BINARY(16),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content TEXT(100)
)