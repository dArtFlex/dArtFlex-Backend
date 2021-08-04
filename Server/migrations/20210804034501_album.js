
exports.up = function(knex) {
    return knex.schema
    .createTable('album', function(t) {
        t.increments('id').primary().notNullable()
        t.integer('user_id').notNullable()
        t.string('image_url').notNullable().unique()
        t.timestamp('created_at').defaultTo(knex.fn.now())
        t.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('album')
};
