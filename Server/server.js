const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fileupload = require('express-fileupload');
const port = 8888
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const secrets= require('./secrets.js')
var RouterImage = require('./src/router/Image');
var RouterAlbum = require('./src/router/Album');
var RouterUser = require('./src/router/User');
var RouterMetadata = require('./src/router/Metadata');
var RouterLazyMint = require('./src/router/LazyMint');
var RouterItem = require('./src/router/Item');
var RouterHashtag = require('./src/router/Hashtag');
var RouterPromotion = require('./src/router/Promotion');
var RouterOrder = require('./src/router/Order');
var RouterMarketplace = require('./src/router/Marketplace');
var RouterBid = require('./src/router/Bid');
var RouterActivity = require('./src/router/Activity');
var RouterSuperAdmin = require('./src/router/SuperAdmin');
var {watchEtherTransfers} = require('./src/controller/SubscribeController');
var {getNotificationByUser, updateNotificationStatus} = require('./src/controller/NotificationController');
const { request } = require('express');
server.listen(port, () => console.log(`Listening on port ${port}...`));

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
                url: "https://dartflex-dev.ml:8887/"
            },
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

io.on('connection',async function(socket){
    const userId =socket.handshake.query.userId;
    const data = await getNotificationByUser(parseInt(userId));
    socket.emit('notification', data);

    socket.on('message', function(data){
        console.log(data)
        updateNotificationStatus(data.id, data.read);
    });
});


app.locals.root = secrets.images_root ? secrets.images_root : 'https://s3.amazonaws.com/dartflex/imgs/';

app.use(function(request, response, next){
    request.io = io;
    next();
});

app.use(express.static('public'));
// app.use(bodyParser.json());
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({limit: '500mb', extended: true}));
app.use(cors());
app.use(fileupload());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
    res.header("Access-Control-Allow-Headers", "Accept, Content-Type, Authorization, X-Requested-With");
    next();
});


app.use('/api/image', RouterImage);
app.use('/api/album', RouterAlbum);
app.use('/api/user', RouterUser);
app.use('/api/metadata', RouterMetadata);
app.use('/api/lazymint', RouterLazyMint);
app.use('/api/item', RouterItem);
app.use('/api/hashtag', RouterHashtag);
app.use('/api/promotion', RouterPromotion);
app.use('/api/order', RouterOrder);
app.use('/api/marketplace', RouterMarketplace);
app.use('/api/bid', RouterBid);
app.use('/api/activity', RouterActivity);   
app.use('/api/super_admin', RouterSuperAdmin);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

watchEtherTransfers();