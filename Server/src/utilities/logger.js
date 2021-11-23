const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");

const logDir = "logs";
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const myFormatFile = printf(({ level, message, label, timestamp }) => {
	return JSON.stringify({ label, level, message, timestamp });
});

const myFormatConsole = printf(({ level, message, label, timestamp }) => {
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

	// Label
	let coloredLabel = chalk.magenta(label);

	let logline = `${coloredLabel} | ${formattedTime} [${coloredLevel}]: ${message}`;
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
				label({ label: "LOG" }),
				timestamp(),
				myFormatFile
			),
		}),
		new transports.Console({
			//handleExceptions: true,
			format: format.combine(
				label({ label: "LOG" }),
				format.splat(),
				timestamp(),
				myFormatConsole
			),
		}),
	],
	exitOnError: false,
});

module.exports = logger;
