const express = require('express')
const bodyParser = require('body-parser')
const port = process.argv[2] || 8888
const app = express()
const secrets= require('./secrets.js')
var RouterImage = require('./src/router/Image');
var RouterUser = require('./src/router/User');

app.locals.root = secrets.images_root ? secrets.images_root : 'https://s3.amazonaws.com/dartflex/imgs/';

const IMAGE_STATE = {
    INITIAL: 0,
    SELECTED: 1
}

function random_slice(arr, n) {
    const i = Math.max(0, Math.floor(Math.random()*arr.length - n))
    return arr.slice(i, i+n)
}

app.use(express.static('public'))
app.use(bodyParser.json())
app.use('/api/image', RouterImage);
app.use('/api/user', RouterUser);

app.listen(port, () => console.log('Server running on', port))
