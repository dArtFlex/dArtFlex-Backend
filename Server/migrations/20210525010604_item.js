
exports.up = function(knex, Promise) {
    return knex.schema
    .createTable('item', function(t) {
        t.increments('id').primary().notNullable()
        t.string('contract').notNullable()
        t.string('token_id').notNullable().unique()
        t.string('uri').notNullable()
        t.string('creator').notNullable()
        t.string('owner').notNullable()
        t.string('royalty')
        t.string('royalty_fee')
        t.string('signature').notNullable()
        t.bool('ban').notNullable()
        t.bool('lazymint')
        t.timestamp('created_at').defaultTo(knex.fn.now())
        t.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('item')
};
