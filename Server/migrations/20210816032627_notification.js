
exports.up = function(knex) {
    return knex.schema
    .createTable('notification', function(t) {
        t.increments('id').primary().notNullable()
        t.integer('user_id').notNullable()
        t.integer('item_id').notNullable()
        t.string('message').notNullable()
        t.bool('read').notNullable()
        t.timestamp('created_at').defaultTo(knex.fn.now())
        t.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('notification')
};
