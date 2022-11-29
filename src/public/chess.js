let length = 600;
let square_dim = length / 8;
let flipped = false;
var board = [  
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['_', '_', '_', '_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_', '_', '_', '_'],
    ['_', '_', '_', '_', '_', '_', '_', '_'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
]

const flip = () => {
    flipped = !flipped;
    draw_board();
}
const load_images = () => {
    
}

const draw_board = (ctx) => {
    for(let i = 0; i < 8; i++){
        for(let j = 0; j < 8; j++){
            const c = document.getElementById("chessboard");
            const ctx = c.getContext("2d");
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

            ctx.fillStyle = (i % 2 === 0 ^ j % 2 === 0)? "#AAAAFF":"#FFAAAA";
            ctx.fillRect(x, y, square_dim, square_dim);

            if(piece_code !== '_'){
                let color_code = (piece_code === piece_code.toUpperCase())? 'w':'b';
                let img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, x, y, square_dim, square_dim);
                }
                img.src = `http://127.0.0.1:3000/pieces/${color_code}${board[i][j]}.svg`;
            }
        }
    }
    
}
const chess_click = (evt) => {
    var c = document.getElementById("chessboard");
    console.log(get_clicked_square(evt));
}

const get_clicked_square = (evt) => {
    var canvas = document.getElementById('chessboard')
    var rect = canvas.getBoundingClientRect();
    return {
        x: ((evt.clientX - rect.left) / square_dim) >> 0,
        y: ((evt.clientY - rect.top) / square_dim) >> 0
    };
}