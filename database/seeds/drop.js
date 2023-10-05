exports.seed = function (knex) {
  return knex.raw('DROP SCHEMA public CASCADE')
    .then(() => {
      return knex.raw('CREATE SCHEMA public');
    });
};
