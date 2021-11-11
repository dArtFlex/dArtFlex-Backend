const { exec } = require('child_process');

new Promise((resolve, reject) => {
	const migrate = exec('knex migrate:latest', { env: process.env }, (err) =>
		err ? reject(err) : resolve()
	);

	// Forward stdout+stderr to this process
	migrate.stdout.pipe(process.stdout);
	migrate.stderr.pipe(process.stderr);
});
