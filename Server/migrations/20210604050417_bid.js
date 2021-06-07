
exports.up = function(knex, Promise) {
    return knex.schema
    .createTable('bid', function(t) {
        t.increments('id').primary().notNullable()
        t.string('item_id').notNullable()
        t.string('order_id').notNullable()
        t.string('user_id').notNullable()
        t.string('bid_amount').notNullable()
        t.string('bid_contract').notNullable()
        t.string('status').notNullable()
        t.timestamp('created_at').defaultTo(knex.fn.now())
        t.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('bid')
};
