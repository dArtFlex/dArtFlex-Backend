const secrets = require("../../secrets.js").database;
const { exec } = require("child_process");

console.log(secrets);

const createBackup = async () => {
	return new Promise((resolve, reject) => {
		const CMD = `PGPASSWORD="${secrets.connection.password}" PGUSER="${secrets.connection.user}" pg_dump -h "${secrets.connection.host}" -p "${secrets.connection.port}" -U "${secrets.connection.user}" -d "${secrets.connection.database}"  -f "backup.dump" -F t`;

		const bakup = exec(CMD, { env: process.env }, (err) =>
			err ? reject(err) : resolve()
		);

		// Forward stdout+stderr to this process
		bakup.stdout.pipe(process.stdout);
		bakup.stderr.pipe(process.stderr);
	});
};

const restoreBackup = async () => {
	return new Promise((resolve, reject) => {
		const CMD = `PGPASSWORD="${secrets.connection.password}" PGUSER="${secrets.connection.user}" pg_restore -c -h "${secrets.connection.host}" -p "${secrets.connection.port}" -U "${secrets.connection.user}" -d "${secrets.connection.database}" -1 backup.dump`;

		const bakup = exec(CMD, { env: process.env }, (err) =>
			err ? reject(err) : resolve()
		);

		// Forward stdout+stderr to this process
		bakup.stdout.pipe(process.stdout);
		bakup.stderr.pipe(process.stderr);
	});
};

const main = () => {
	let args = process.argv;
	let command = args[2];
	if (command == "backup") {
		createBackup();
	} else if (command == "restore") {
		restoreBackup();
	} else {
		console.log("Unknown command");
	}
};
main();
