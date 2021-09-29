
exports.up = function(knex) {
    return knex.schema.table("marketplace", function(table) {
        table.string("end_time").nullable().alter();
    });
};

exports.down = function(knex) {
    return knex.schema.table("marketplace", function(table) {
        table.string("end_time").notNullable().alter();
    });
};
