exports.up = function (knex) {
	return knex.schema.alterTable("item", function (t) {
		t.integer("chain_id").notNullable();
	});
};

exports.down = function (knex) {
	return knex.schema.alterTable("item", function (t) {
		t.dropColumn("chain_id").notNullable();
	});
};
