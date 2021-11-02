
exports.up = function(knex) {
    return knex.schema
    .createTable('token_price', function(t) {
        t.increments('id').primary().notNullable()
        t.string('token_name').notNullable()
        t.string('usd_price').notNullable()
        t.timestamp('created_at').defaultTo(knex.fn.now())
        t.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('token_price')
};
