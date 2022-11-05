const hostname = "http://127.0.0.1:3000"
const fileToBase64 = async (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (e) => reject(e)
});
const update = (avatar_url) => {
    var timestamp = new Date().getTime();
    img_avatar.src = `${hostname}/${avatar_url}?t=${timestamp}`;
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
                    cache:'no-cache',
                    headers:{
                        'Content-Type':'application/json',
                        'Authorization':`Bearer ${bearer}`
                    },
                    body:JSON.stringify({type:type, data:data})
                }
                fetch(hostname + '/uploads', options)
                .then(response => response.json())
                .then((data) => {
                    update(data.avatar_url);
                })
            });
        }
    }
}
const sign_up = () => {
    options = {
        method:'post',
        mode:'cors',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({username:'zero', password:'testing123', fullname:'zerothechosen'})
    }
    fetch(hostname + '/users', options)
}
const log_in = () => {
    options = {
        method:'post',
        mode:'cors',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({username:'zero', password:'testing123'})
    }
    fetch('http://127.0.0.1:3000/login', options)
    .then(response => response.json())
    .then((data) => {
        localStorage.setItem('bearer', data.token)
        me();
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
        cache:'no-cache',
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