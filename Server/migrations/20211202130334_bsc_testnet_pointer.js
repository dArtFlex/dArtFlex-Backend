exports.up = async function (knex, Promise) {
	return knex.schema
		.createTable("bsc_testnet_pointer", function (t) {
			t.increments("id").primary().notNullable();
			t.integer("last_block").notNullable().defaultTo(0);
			t.timestamp("created_at").defaultTo(knex.fn.now());
			t.timestamp("updated_at").defaultTo(knex.fn.now());
		})
		.then(async () => {
			return knex("bsc_testnet_pointer").insert([
				{
					last_block: 0,
				},
			]);
		});
};

exports.down = function (knex, Promise) {
	return knex.schema.dropTableIfExists("bsc_testnet_pointer");
};
