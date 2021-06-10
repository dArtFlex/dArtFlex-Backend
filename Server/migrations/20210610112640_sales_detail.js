
exports.up = function(knex, Promise) {
    return knex.schema
    .createTable('sales_detail', function(t) {
        t.increments('id').primary().notNullable()
        t.string('type').notNullable()
        t.string('start_price').notNullable()
        t.string('end_price').notNullable()
        t.string('start_time').notNullable()
        t.string('end_time').notNullable()
        t.string('platform_fee').notNullable()
        t.string('sales_token_contract').notNullable()
        t.timestamp('created_at').defaultTo(knex.fn.now())
        t.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('sales_detail')
};
