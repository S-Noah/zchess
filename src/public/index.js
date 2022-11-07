const hostname = "http://127.0.0.1:3000"
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

const update = (avatar_url) => {
    console.log(avatar_url)
    if(avatar_url === undefined){
        img_avatar.src = "";
        setHidden(og_home);
        setHidden(og_login, false);
    }
    else{
        var timestamp = new Date().getTime();
        img_avatar.src = `${hostname}/${avatar_url}?t=${timestamp}`;
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
                    update(data.avatar_url);
                })
            });
        }
    }
}

const sign_up = () => {
    sign_up_data = {
        email:'nsarge@mail.endicott.edu',
        username:'zero', 
        password:'testing123', 
        fullname:'zerothechosen'
    }
    options = {
        method:'post',
        mode:'cors',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(sign_up_data)
    }
    fetch(hostname + '/users', options)
}

const log_in = () => {
    let username = input_username_login.value;
    let password = input_password_login.value;
    if(username === '' || password === ''){
        return;
    }
    log_in_data = {
        username: username, 
        password: password
    }
    options = {
        method:'post',
        mode:'cors',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(log_in_data)
    }
    fetch('http://127.0.0.1:3000/login', options)
    .then(response => response.json())
    .then((data) => {
        localStorage.setItem('bearer', data.token)
        me();
        setHidden(og_home);
        setHidden(og_login);
    })
}

const stream = async () => {
    fetch(hostname +'/stream')
    .then(res => {
        let reader = res.body.getReader();
        let done, value;
        while (!done) {
            ({ value, done } = reader.read());
            if (done) {
            return chunks;
            }
            console.log(value);
        }
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
            update(data.avatar_url);
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