exports.up = function (knex) {
  return knex.raw(`
      CREATE TABLE twitch_channels
      (
          id           SERIAL PRIMARY KEY,
          gid          VARCHAR(100) NOT NULL,
          uuid         VARCHAR(100) NOT NULL,
          title        VARCHAR(512),
          description  TEXT,
          thumbnail    text,
          published_at timestamptz,
          created_at   timestamptz  NOT NULL DEFAULT now(),
          updated_at   timestamptz,
          views        bigint,
          followers    bigint,
          subscribers  bigint,
          deleted_at   timestamptz,
          UNIQUE (gid),
          UNIQUE (uuid)
      );
  `);
};

exports.down = function (knex) {
  return knex.schema.dropTable('twitch_channels');
};
