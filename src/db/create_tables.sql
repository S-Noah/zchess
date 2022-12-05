CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(320) UNIQUE NOT NULL,
    passhash VARCHAR(255),
    fullname VARCHAR(100),
    avatar_url VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    white_id INT,
    black_id INT,
    pgn TEXT(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `white_id_idx` (`white_id`),
    INDEX `black_id_idx` (`black_id`),
    CONSTRAINT `fk_white_id`
        FOREIGN KEY (`white_id`)
        REFERENCES `users` (`id`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT `fk_black_id`
        FOREIGN KEY (`black_id`)
        REFERENCES `users` (`id`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS friends (
    owner_id INT,
    friend_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `owner_id_idx` (`owner_id`),
    INDEX `friend_id_idx` (`friend_id`),
    CONSTRAINT `fk_owner_id`
        FOREIGN KEY (`owner_id`)
        REFERENCES `users` (`id`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT `fk_friend_id`
        FOREIGN KEY (`friend_id`)
        REFERENCES `users` (`id`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS messages (
    owner_id INT,
    game_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content TEXT(100),
    INDEX `message_owner_id_idx` (`owner_id`),
    INDEX `message_game_id_idx` (`game_id`),
    CONSTRAINT `fk_message_owner_id`
        FOREIGN KEY (`owner_id`)
        REFERENCES `users` (`id`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT `fk_message_game_id`
        FOREIGN KEY (`game_id`)
        REFERENCES `games` (`id`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);