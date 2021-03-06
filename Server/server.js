require("dotenv").config();

if (process.env.NODE_ENV == "development") {
	require("./src/utilities/migration.js");
}

var url = require("url");
const express = require("express");
const responseTime = require("response-time");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileupload = require("express-fileupload");
const cron = require("node-cron");
const port = 8888;
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		// methods: ["GET", "POST"],
		// credentials: true
	},
});

const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const secrets = require("./secrets.js");
var RouterImage = require("./src/router/Image");
var RouterAlbum = require("./src/router/Album");
var RouterUser = require("./src/router/User");
var RouterMetadata = require("./src/router/Metadata");
// var RouterLazyMint = require('./src/router/LazyMint');
var RouterItem = require("./src/router/Item");
var RouterHashtag = require("./src/router/Hashtag");
var RouterPromotion = require("./src/router/Promotion");
var RouterOrder = require("./src/router/Order");
var RouterMarketplace = require("./src/router/Marketplace");
var RouterBid = require("./src/router/Bid");
var RouterActivity = require("./src/router/Activity");
var RouterTokenPrice = require("./src/router/TokenPrice");
var RouterSuperAdmin = require("./src/router/SuperAdmin");
var RouterProfile = require("./src/router/Profile");
var RouterTradeHistory = require("./src/router/TradeHistory");
var RouterBidsAndOffers = require("./src/router/BidsAndOffers");
var RouterSales = require("./src/router/Sales");
var RouterManagement = require("./src/router/Management");

var loggerMiddleware = require("./src/utilities/logger-middleware");
var logger = require("./src/utilities/logger");

var { watchEtherTransfers } = require("./src/controller/SubscribeController");
var {
	getNotificationByUser,
	updateNotificationStatus,
} = require("./src/controller/NotificationController");
var { checkMarket } = require("./src/controller/MarketplaceController");
var { updateTokenPrice } = require("./src/controller/TokenPriceController");
const { request } = require("express");
server.listen(port, () => logger.info(`Listening on port ${port}`));

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Library API",
			version: "1.0.0",
			description: "Express API server",
		},
		servers: [
			{
				url: "https://dartflex-dev.ml:8887/",
			},
			{
				url: "https://dartflex-dev:8888/",
			},
			{
				url: "http://3.11.202.153:8888",
			},
			{
				url: "http://localhost:8888",
			},
		],
	},
	apis: ["./src/router/*.js"],
};

const specs = swaggerJsDoc(options);

io.on("connection", async function (socket) {
	const userId = socket.handshake.query.userId;
	const data = await getNotificationByUser(parseInt(userId));
	if (data.length > 0) {
		if (socket.handshake.query.userId == data[0]["user_id"])
			socket.emit("notification", data);
	}

	socket.on("message", function (data) {
		updateNotificationStatus(data.id, data.read);
	});
});

app.locals.root = secrets.images_root
	? secrets.images_root
	: "https://s3.amazonaws.com/dartflex/imgs/";

app.use(function (request, response, next) {
	request.io = io;
	next();
});

app.use(express.static("public"));
// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(fileupload());

app.use(
	responseTime(function (res, res, time) {
		res.responseTime = time;
	})
);

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
	res.header(
		"Access-Control-Allow-Headers",
		"Accept, Content-Type, Authorization, X-Requested-With"
	);
	next();
});

app.use(loggerMiddleware);
app.use("/api/image", RouterImage);
app.use("/api/album", RouterAlbum);
app.use("/api/user", RouterUser);
app.use("/api/metadata", RouterMetadata);
// app.use('/api/lazymint', RouterLazyMint);
app.use("/api/item", RouterItem);
app.use("/api/hashtag", RouterHashtag);
app.use("/api/promotion", RouterPromotion);
app.use("/api/order", RouterOrder);
app.use("/api/marketplace", RouterMarketplace);
app.use("/api/bid", RouterBid);
app.use("/api/activity", RouterActivity);
app.use("/api/token_price", RouterTokenPrice);
app.use("/api/super_admin", RouterSuperAdmin);
app.use("/api/profile", RouterProfile);
app.use("/api/trade-history", RouterTradeHistory);
app.use("/api/bids-and-offers", RouterBidsAndOffers);
app.use("/api/sales", RouterSales);
app.use("/api/management", RouterManagement);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

//watchEtherTransfers();

cron.schedule("* * * * *", function () {
	checkMarket();
	updateTokenPrice();
});
checkMarket();

require("./src/blockchain/listener")(io);
