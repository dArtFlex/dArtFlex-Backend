
exports.up = function(knex, Promise) {
    return knex.schema
    .createTable('order', function(t) {
        t.increments('id').primary().notNullable()
        t.string('type').notNullable()
        t.string('maker').notNullable()
        t.string('make_asset_type_class').notNullable()
        t.string('make_asset_type_data').notNullable()
        t.string('make_asset_value').notNullable()
        t.string('taker').notNullable()
        t.string('take_asset_type_class').notNullable()
        t.string('take_asset_type_data').notNullable()
        t.string('take_asset_value').notNullable()
        t.string('salt').notNullable()
        t.string('start').notNullable()
        t.string('end').notNullable()
        t.string('data', 2000).notNullable()
        t.string('signature').notNullable()
        t.timestamp('created_at').defaultTo(knex.fn.now())
        t.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('order')
};
