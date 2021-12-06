exports.up = async function (knex, Promise) {
	return knex.schema.createTable("eth_pointer", function (t) {
		t.increments("id").primary().notNullable();
		t.string("last_block").notNullable();
		t.timestamp("created_at").defaultTo(knex.fn.now());
		t.timestamp("updated_at").defaultTo(knex.fn.now());
	});
};

exports.down = function (knex, Promise) {
	return knex.schema.dropTableIfExists("eth_pointer");
};
