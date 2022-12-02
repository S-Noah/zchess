var length = 600;
var square_dim = length / 8;
var flipped = false;
var selected_square = null;
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
                ctx.fillStyle ="#00000080";
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
            }
        }
    }
}

const chess_click = (evt) => {
    var new_square = get_clicked_square(evt);
    if(selected_square === null){
        selected_square = new_square;
    }
    else if(new_square === selected_square){
        selected_square = null;
    }
    else if(selected_square !== null){
        console.log(`${selected_square.uci}${new_square.uci}`);
        move(selected_square.uci, new_square.uci);
        selected_square = null;
    }
    draw_board();
}

const get_clicked_square = (evt) => {
    var rect = document.getElementById('chessboard').getBoundingClientRect();
    var x = ((evt.clientX - rect.left) / square_dim) >> 0
    var y = ((evt.clientY - rect.top) / square_dim) >> 0
    let col = (flipped)? String.fromCharCode(65 + (7-x)):String.fromCharCode(65 + x)
    let row = (flipped)? y+1:8-y;
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