const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fileupload = require('express-fileupload');
const port = process.argv[2] || 8888
const app = express()
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const secrets= require('./secrets.js')
var RouterImage = require('./src/router/Image');
var RouterUser = require('./src/router/User');
var RouterMetadata = require('./src/router/Metadata');
var RouterLazyMint = require('./src/router/LazyMint');

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Library API",
            version: "1.0.0",
            description: "Express API server"
        },
        servers: [
            {
                url: "http://3.11.202.153:8888"
            },
            {
                url: "http://localhost:8888"
            }
        ]       
    },
    apis: ["./src/router/*.js"]
}

const specs = swaggerJsDoc(options);



app.locals.root = secrets.images_root ? secrets.images_root : 'https://s3.amazonaws.com/dartflex/imgs/';

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());
app.use(fileupload());
app.use('/api/image', RouterImage);
app.use('/api/user', RouterUser);
app.use('/api/metadata', RouterMetadata);
app.use('/api/lazymint', RouterLazyMint);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));
app.listen(port, () => console.log('Server running on', port));
