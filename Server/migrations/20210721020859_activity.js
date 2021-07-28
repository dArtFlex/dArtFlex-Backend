
exports.up = function(knex, Promise) {
    return knex.schema
    .createTable('activity', function(t) {
        t.increments('id').primary().notNullable()
        t.string('from').notNullable()
        t.string('to').notNullable()
        t.string('item_id').notNullable()
        t.string('market_id').notNullable()
        t.string('order_id').notNullable()
        t.string('bid_id').notNullable()
        t.string('bid_amount').notNullable()
        t.string('sales_token_contract').notNullable()
        t.string('status').notNullable()
        t.timestamp('created_at').defaultTo(knex.fn.now())
        t.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('activity')
};
