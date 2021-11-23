const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");

const logDir = "logs";
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

function isEmpty(obj) {
	for (var prop in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, prop)) {
			return false;
		}
	}

	return JSON.stringify(obj) === JSON.stringify({});
}

const formatFile = printf((object) => {
	let { level, label, timestamp } = object;
	let { method, url, statusCode, responseTime, statusMessage, sendData } =
		object.message;

	let status = String(statusCode);

	var logObject = {
		label,
		level,
		method,
		status,
		url,
		timestamp,
		responseTime,
		statusMessage,
	};

	if (statusCode.startsWith("4") || statusCode.startsWith("5")) {
		logObject.sendData = sendData;
	}

	return JSON.stringify(logObject);
});

const formatConsole = printf((object) => {
	let { level, label, timestamp } = object;
	let { method, url, statusCode, responseTime, statusMessage, sendData } =
		object.message;

	let status = String(statusCode);

	// Label
	let coloredLabel = chalk.magenta(label);

	// Time
	let formattedTime = `[${moment(timestamp)
		.format("YY-MM-DD hh:mm:ss")
		.trim()}]`;

	// Level
	let coloredLevel = "";
	switch (level) {
		case "info":
			coloredLevel = chalk.blue(level.toUpperCase());
			break;
		case "warn":
			coloredLevel = chalk.yellow(level.toUpperCase());
			break;
		case "error":
			coloredLevel = chalk.red(level.toUpperCase());
			break;
		default:
			coloredLevel = chalk.blue(level.toUpperCase());
			break;
	}
	// method and status
	let coloredStatus = "";
	let coloredMethod = "";
	if (status.startsWith("2") || status.startsWith("3")) {
		coloredStatus = chalk.green(status);
		coloredMethod = chalk.green(method);
	} else if (status.startsWith("4") || status.startsWith("5")) {
		coloredStatus = chalk.red(status);
		coloredMethod = chalk.red(method);
	} else {
		coloredStatus = chalk.yellow(status);
		coloredMethod = chalk.yellow(method);
	}

	// request time
	let formattedRequestTime = "";
	if (responseTime > 100) {
		formattedRequestTime = chalk.red("+" + responseTime + "ms");
	} else {
		formattedRequestTime = chalk.green("+" + responseTime + "ms");
	}

	var logline = `${coloredLabel} | ${formattedTime} [${coloredLevel}] | ${coloredMethod} ${coloredStatus} ${url} ${formattedRequestTime}`;

	if (status.startsWith("4") || status.startsWith("5")) {
		if (statusMessage) {
			logline += ` ${chalk.red(statusMessage)}`;
		}
		if (sendData) {
			logline += ` ${chalk.red(sendData)}`;
		}
	}

	return logline;
});

const logger = createLogger({
	level: "info",
	transports: [
		new transports.File({
			filename: path.join("logs", "error.log"),
			level: "error",
		}),
		new transports.File({
			filename: path.join("logs", "combined.log"),
			format: format.combine(
				label({ label: "EXPRESS" }),
				timestamp(),
				formatFile
			),
		}),
		new transports.Console({
			//handleExceptions: true,
			format: format.combine(
				label({ label: "EXPRESS" }),
				format.splat(),
				timestamp(),
				formatConsole
			),
		}),
	],
	exitOnError: false,
});

const loggerMiddleware = function (req, res, next) {
	let method = req.method;
	let url = req.originalUrl;

	let oldSend = res.send;
	let sendData = null;
	res.send = function (data) {
		sendData = data;
		res.send = oldSend;
		return res.send(data);
	};

	res.on("finish", function () {
		let responseTime = parseInt(this.responseTime);
		let statusCode = String(this.statusCode);
		let statusMessage = this.statusMessage;
		if (statusCode.startsWith("2") || statusCode.startsWith("3")) {
			logger.info({
				method,
				url,
				responseTime,
				statusCode,
				statusMessage,
			});
		} else {
			logger.error({
				method,
				url,
				responseTime,
				statusCode,
				statusMessage,
				sendData,
			});
		}
	});
	next();
};

module.exports = loggerMiddleware;
