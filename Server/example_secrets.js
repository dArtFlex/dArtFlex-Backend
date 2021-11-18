// Update with your config settings.
module.exports = {
	ganurl256: "http://localhost:5000",
	database: {
		client: "postgresql",
		connection: {
			host: "127.0.0.1",
			port: 5432,
			database: "postgres",
			user: "postgres",
			password: "password",
		},
		pool: {
			min: 2,
			max: 20,
		},
		migrations: {
			tableName: "knex_migrations",
		},
	},
	images_root: "http://localhost:8888/img/",
	local_images: true,
	infura: {
		id: "0c28b71c188849858e21b69b76866bc3",
		secret: "d306855960a74d349d64eab22e522514",
	},
	aws: {
		accessKeyId: "",
		secretAccessKey: "",
	},
};
