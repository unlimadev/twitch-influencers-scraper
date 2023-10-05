exports.up = function (knex) {
  return knex.raw(`
      CREATE TABLE twitch_streams
      (
          uuid        VARCHAR(100) PRIMARY KEY,
          channel_gid VARCHAR(100) NOT NULL,
          title       VARCHAR(512),
          started_at  timestamptz  NOT NULL,
          viewers     bigint,
          game_uuid   VARCHAR(100),
          tags_uuid   jsonb,
          created_at  timestamptz  NOT NULL DEFAULT now(),
          updated_at  timestamptz,
          deleted_at  timestamptz,
          UNIQUE (channel_gid, uuid, started_at)
      );
  `);
};

exports.down = function (knex) {
  return knex.schema.dropTable('twitch_streams');
};
