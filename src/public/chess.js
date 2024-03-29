var length = 600;
var square_dim = length / 8;
var half_square_dim = square_dim / 2
var flipped = false;
var selected_square = null;
var possible_moves = null;
var player_color = null;
var in_check = false;
var game_over = false;
var turn = null;

var selected_possible_moves = [];

const PI_2 = 2 * Math.PI;

const starting_board = [  
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['_', '_', '_', '_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_', '_', '_', '_'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
]
const blank_board = [  
    ['_', '_', '_', '_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_', '_', '_', '_']
]
var board = starting_board; 

const flip = () => {
    flipped = !flipped;
    draw_board();
}

const draw_board = () => {
    var c = document.getElementById("chessboard");
    var ctx = c.getContext("2d");
    for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++){
            let x, y;
            let piece_code = board[i][j];

            if(flipped){
                x = (7 - j) * square_dim;
                y = (7 - i) * square_dim;
            }
            else{
                x = j * square_dim;
                y = i * square_dim;
            }

            ctx.fillStyle = (i % 2 === 0 ^ j % 2 === 0)? "#AAAFFF":"#FFFAAA";

            if(selected_square !== null && i === selected_square.y && j === selected_square.x){
                ctx.fillStyle = "#00000080";
            }

            ctx.fillRect(x, y, square_dim, square_dim);

            if(piece_code !== '_'){
                let color_code = (piece_code === piece_code.toUpperCase())? 'w':'b';
                piece_code = piece_code.toLowerCase();
                let img = piece_images[`${color_code}${piece_code}`];
                if(!img.complete){
                    setTimeout(draw_board, 10);
                }
                ctx.drawImage(img, x, y, square_dim, square_dim);
                if(in_check){
                    if(in_check && turn[0] === color_code && piece_code === 'k'){
                        ctx.fillStyle = "#FF000080"
                        ctx.beginPath();
                        ctx.arc(x + half_square_dim, y + half_square_dim, 10, 0, PI_2);
                        ctx.fill();
                    }
                }
            }

            for(let possible of selected_possible_moves){
                if(i === possible.y && j === possible.x){
                    ctx.fillStyle = "#0000FF"
                    ctx.beginPath();
                    ctx.arc(x + half_square_dim, y + half_square_dim, 8, 0, PI_2);
                    ctx.fill();
                }
            }
        }
    }
}

const chess_click = (evt) => {
    var new_square = get_clicked_square(evt);
    if(selected_square === null){
        selected_possible_moves = [];
        selected_square = new_square;
        let possibilities = possible_moves[selected_square.uci];
        if(possibilities !== undefined){
            for(let possible of possibilities){
                let col = possible.charCodeAt(0) - 65;
                let row = 8 - parseInt(possible[1]);
                selected_possible_moves.push({x:col, y:row})
            }
        }
    }
    else if(new_square.uci === selected_square.uci){
        selected_square = null;
        selected_possible_moves = [];
    }
    else if(selected_square !== null){
        //console.log(`${selected_square.uci}${new_square.uci}`);
        let piece = board[selected_square.y][selected_square.x];
        if(player_color === 'White' && piece === piece.toUpperCase() || player_color === 'Black' && piece === piece.toLowerCase()){
            move(selected_square.uci, new_square.uci);
        }
        selected_square = null;
        selected_possible_moves = [];
    }
    draw_board();
}

const get_clicked_square = (evt) => {
    var rect = document.getElementById('chessboard').getBoundingClientRect();
    var x = ((evt.clientX - rect.left) / square_dim) >> 0
    var y = ((evt.clientY - rect.top) / square_dim) >> 0
    let col = (flipped)? String.fromCharCode(65 + (7-x)):String.fromCharCode(65 + x)
    let row = (flipped)? y+1:8-y;
    if(flipped){
        x = 7 - x;
        y = 7 - y;
    }
    return {uci:`${col}${row}`,x:x, y:y};
}

const move = (start, stop) => {
    socket.emit('move', {game_id:game_id, start:start, stop:stop})
}

const update_from_fen = (fen) => {
    board = blank_board.map((x) => {return {...x}});
    let pos_fen = fen.split(' ', 1)[0];
    let i = 0;
    let j = 0;
    for(c of pos_fen){
        if(c === '/'){
            i++;
            j = 0;
        }
        else if(isNaN(c)){
            board[i][j] = c;
            j++;
        }
        else{
            j += parseInt(c);
        }
    }
    draw_board();
}

const update_board = (data) => {
    possible_moves = data.possible_moves;
    if(data.turn !== undefined){
        turn = data.turn;
    }
    if(data.check !== undefined){
        in_check = data.check;
    }
    if(data.color !== undefined){
        player_color = data.color;
        if(player_color === 'Black'){
            flipped = true;
            draw_board();
        }
    }
    if(data.fen !== undefined){
        update_from_fen(data.fen);
    }
    if(data.opponent_id !== undefined){
        fetch(hostname + `/users/${data.opponent_id}`)
        .then(res => res.json())
        .then(data =>{
            console.log(data.avatar_url )
            opponent_avatar.src = `${hostname}/${data.avatar_url}`;
            opponent_username.innerHTML = data.username;
        })
    }
}