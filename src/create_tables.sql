CREATE TABLE users (
    id BINARY(16) PRIMARY KEY DEFAULT (uuid_to_bin(uuid())),
    token_secret NOT NULL,
    username VARCHAR(255) UNIQUE,
    passhash VARCHAR(255),
    fullname VARCHAR(100),
    avatar_url VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE games (
    id BINARY(16) PRIMARY KEY DEFAULT (uuid_to_bin(uuid())),
    white_id BINARY(16) NOT NULL,
    black_id BINARY(16) NOT NULL,
    time_limit INT,
    white_time INT,
    black_time INT,
    is_active BOOLEAN DEFAULT 1,
    fen VARCHAR(120),
    pgn TEXT(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `ga_white_id_idx` (`white_id` ASC) VISIBLE,
    INDEX `ga_black_id_idx` (`black_id` ASC) VISIBLE,
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
);

CREATE TABLE friends (
    owner_id BINARY(16) NOT NULL,
    friend_id BINARY(16) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `fr_owner_id_idx` (`owner_id` ASC) VISIBLE,
    INDEX `fr_friend_id_idx` (`friend_id` ASC) VISIBLE,
    CONSTRAINT `fk_owner_id`
        FOREIGN KEY (`owner_id`)
        REFERENCES `zchess`.`users` (`id`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT `fk_friend_id`
        FOREIGN KEY (`friend_id`)
        REFERENCES `zchess`.`users` (`id`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);

CREATE TABLE messages (
    owner_id BINARY(16),
    game_id BINARY(16),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content TEXT(100),
    INDEX `me_owner_id_idx` (`owner_id` ASC) VISIBLE,
    INDEX `me_game_id_idx` (`game_id` ASC) VISIBLE,
    CONSTRAINT `me_fk_owner_id`
        FOREIGN KEY (`owner_id`)
        REFERENCES `zchess`.`users` (`id`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT `me_fk_game_id`
        FOREIGN KEY (`game_id`)
        REFERENCES `zchess`.`games` (`id`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);