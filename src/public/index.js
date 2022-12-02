const hostname = "http://127.0.0.1:3000";

const fileToBase64 = async (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (e) => reject(e)
});

const setHidden = (element, isHidden=true) => {
    if(isHidden){
        element.classList.add('hidden')
    }
    else{
        element.classList.remove('hidden')
    }
}

const parse_form = (form_name) => {
    let form = document.forms[form_name];
    let data = {}
    for(let x of form){
        data[x.name] = x.value;
    }
    return data;
}

const update = (data) => {
    if(data === undefined){
        image_avatar.src = "";
        setHidden(og_home);
        setHidden(og_login, false);
        return;
    }
    else{
        var timestamp = new Date().getTime();
        if(data.avatar_url !== undefined){
            image_avatar.src = `${hostname}/${data.avatar_url}?t=${timestamp}`;
        }
        if(data.username !== undefined){
            h_username.innerHTML = data.username;
        }
        setHidden(og_login);
        setHidden(og_home, false);
    }
    
}


const upload_image = () => {
    var bearer = localStorage.getItem('bearer');
    if(bearer !== null){
        var file = image_chooser.files[0];
        if(file !== undefined){
            fileToBase64(file)
            .then((encoded) => {
                var type = encoded.slice(encoded.indexOf('/') + 1, encoded.indexOf(';base64'));
                var data = encoded.substr(encoded.indexOf(',') + 1)
                options = {
                    method:'post',
                    mode:'cors',
                    headers:{
                        'Content-Type':'application/json',
                        'Authorization':`Bearer ${bearer}`
                    },
                    body:JSON.stringify({type:type, data:data})
                }
                fetch(`${hostname}/avatars`, options)
                .then(response => response.json())
                .then((data) => {
                    update(data);
                })
            });
        }
    }
}

const sign_up = () => {
    sign_up_data = parse_form('signup');
    options = {
        method:'post',
        mode:'cors',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(sign_up_data)
    }
    fetch(hostname + '/users', options)
    setHidden(og_login,false);
    setHidden(og_signup);
}

const log_in = () => {
    log_in_data = parse_form('login');
    options = {
        method:'post',
        mode:'cors',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(log_in_data)
    }
    fetch(hostname + '/login', options)
    .then(response => response.json())
    .then((data) => {
        localStorage.setItem('bearer', data.token)
        me();
        // setHidden(og_home);
        // setHidden(og_login);
    })
}

const me = async () => {
    var bearer = localStorage.getItem('bearer');
    if(bearer !== null){
        options = {
        method:'get',
        mode:'cors',
            headers:{
                'Authorization':`Bearer ${bearer}`
            },
        }
        fetch(hostname + '/me', options)
        .then(res => res.json())
        .then(data => {
            update(data);
        });
    }
}
const get_friends = () => {
    var bearer = localStorage.getItem('bearer');
    if(bearer !== null){
        options = {
        method:'get',
        mode:'cors',
        headers:{
            'Authorization':`Bearer ${bearer}`
        },
        }
        fetch(hostname + '/friends', options)
        .then(res => res.json())
        .then(data => {
            console.log(data);
        });
    }
}
const log_out = () => {
    localStorage.clear();
    setHidden(og_home);
    setHidden(og_login, false);
    update()
}

const register = () => {
    setHidden(og_login);
    setHidden(og_signup, false);
}

const play_game = () => {
    game_data = parse_form('play');
    var bearer = localStorage.getItem('bearer');
    if(bearer !== null){
        options = {
            method:'post',
            mode:'cors',
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${bearer}`
            },
            body: JSON.stringify(game_data)
        }
        fetch(hostname + '/games', options)
        .then(response => response.json())
        .then((data) => {
            console.log(data.game_id);
            setHidden(og_play);
            setHidden(og_chessboard, false);
            draw_board();
            game_id = data.game_id;
            game_socket(data.game_id)
        })
    }
}

const game_socket = (id) => {
    socket = new io({
        auth:{token:localStorage.getItem('bearer')},
        query:{game_id:id}
    });
    socket.on('game_start', (msg) => {
        update_board(msg);
    });
    socket.on('game_event', (msg) => {
        update_board(msg);
    });
}

const join_game = () => {
    data = parse_form('join');
    game_socket(data.game_id);
    game_id = data.game_id;
    setHidden(og_chessboard, false);
    setHidden(og_play);
}