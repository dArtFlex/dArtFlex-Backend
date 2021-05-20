
exports.up = function(knex, Promise) {
    return knex.schema
    .createTable('lazymint', function(t) {
        t.increments('id').primary().notNullable()
        t.string('contract').notNullable()
        t.integer('tokenId').notNullable().unique()
        t.string('uri').notNullable()
        t.string('creator').notNullable()
        t.string('royalty')
        t.string('signatures').notNullable()
        t.timestamp('created_at').defaultTo(knex.fn.now())
        t.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('lazymint')
};
