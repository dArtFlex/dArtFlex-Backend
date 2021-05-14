
exports.up = function(knex, Promise) {
    return knex.schema
    .createTable('metadata', function(t) {
        t.increments('id').primary().notNullable()
        t.string('name').notNullable().unique()
        t.string('image').notNullable().unique()
        t.string('image_data').notNullable()
        t.string('attribute')
        t.string('description')
        t.timestamp('created_at').defaultTo(knex.fn.now())
        t.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('metadata')
};
