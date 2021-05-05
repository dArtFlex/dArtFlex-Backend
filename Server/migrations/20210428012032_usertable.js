exports.up = async function(knex, Promise) {
    return knex.schema
        .createTable('users', function(t) {
            t.increments('id').primary().notNullable()
            t.string('fullname').notNullable()
            t.string('userid').notNullable()
            t.string('email').notNullable()
            t.string('wallet').notNullable()
            t.string('overview')
            t.string('profile_image')
            t.string('cover_image')
            t.timestamp('created_at').defaultTo(knex.fn.now())
            t.timestamp('updated_at').defaultTo(knex.fn.now())
        })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('users')
};
