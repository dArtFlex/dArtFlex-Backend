
exports.up = function(knex, Promise) {
    return knex.schema
    .createTable('promotion', function(t) {
        t.increments('id').primary().notNullable()
        t.string('item_id').notNullable()
        t.timestamp('created_at').defaultTo(knex.fn.now())
        t.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('promotion')
};
