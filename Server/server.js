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
// var RouterLazyMint = require('./src/router/LazyMint');
var RouterItem = require('./src/router/Item');
var RouterOrder = require('./src/router/Order');
var RouterMarketplace = require('./src/router/Marketplace');
var RouterBid = require('./src/router/Bid');
var RouterSuperAdmin = require('./src/router/SuperAdmin');

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
                url: "https://dartflex-dev:8888/"
            },
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

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use('/api/image', RouterImage);
app.use('/api/user', RouterUser);
app.use('/api/metadata', RouterMetadata);
// app.use('/api/lazymint', RouterLazyMint);
app.use('/api/item', RouterItem);
app.use('/api/order', RouterOrder);
app.use('/api/marketplace', RouterMarketplace);
app.use('/api/bid', RouterBid);
app.use('/api/super_admin', RouterSuperAdmin);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));
app.listen(port, () => console.log('Server running on', port));
