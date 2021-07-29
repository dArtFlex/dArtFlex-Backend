
exports.up = function(knex) {
    return knex.schema
    .createTable('hashtag_item', function(t) {
        t.increments('id').primary().notNullable()
        t.integer('hashtag_id').notNullable()
        t.integer('item_id').notNullable()
        t.timestamp('created_at').defaultTo(knex.fn.now())
        t.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('hashtag_item')
};
