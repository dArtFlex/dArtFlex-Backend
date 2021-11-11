exports.up = function (knex) {
	return knex.schema.alterTable("users", function (t) {
		t.string("task_id");
	});
};

exports.down = function (knex) {
	return knex.schema.alterTable("products", function (t) {
		t.dropColumn("task_id");
	});
};
