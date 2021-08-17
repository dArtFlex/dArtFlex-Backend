exports.up = async function(knex, Promise) {
    return knex.schema
        .createTable('users', function(t) {
            t.increments('id').primary().notNullable()
            t.string('fullname').notNullable()
            t.string('userid').notNullable().unique()
            t.string('email').notNullable()
            t.string('wallet').notNullable().unique()
            t.string('overview')
            t.string('profile_image')
            t.string('cover_image')
            t.string('role')
            t.string('website')
            t.string('twitter')
            t.string('instagram')
            t.string('discord')
            t.string('facebook')
            t.string('youtube')
            t.string('tiktok')
            t.string('other_url')
            t.bool('ban').notNullable()
            t.timestamp('created_at').defaultTo(knex.fn.now())
            t.timestamp('updated_at').defaultTo(knex.fn.now())
        })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('users')
};
