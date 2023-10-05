exports.up = function (knex) {
  return knex.raw(`
      CREATE TABLE twitch_api_keys
      (
          id            SERIAL PRIMARY KEY,
          title         VARCHAR(512),
          data          jsonb,
          active        boolean
      );
  `);
};

exports.down = function (knex) {
  return knex.schema.dropTable('twitch_api_keys');
};
