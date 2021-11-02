exports.up = function (knex) {
  return knex('promotion')
    .whereIn('promotion.id', (subQueryBuilder) => {
      subQueryBuilder
        .from('promotion')
        .select('promotion.id')
        .leftJoin('marketplace', 'promotion.item_id', 'marketplace.item_id')
        .whereNull('marketplace.item_id');
    })
    .del();
};

exports.down = function (knex) {
};
