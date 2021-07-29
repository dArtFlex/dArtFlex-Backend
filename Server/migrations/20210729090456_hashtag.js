
exports.up = function(knex) {
    return knex.schema
    .createTable('hashtag', function(t) {
        t.increments('id').primary().notNullable()
        t.string('name').notNullable()
        t.timestamp('created_at').defaultTo(knex.fn.now())
        t.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('hashtag')
};
