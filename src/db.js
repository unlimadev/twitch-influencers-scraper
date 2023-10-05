const Knex = require('knex');
const { types } = require('pg');

types.setTypeParser(1082, (val) => val); // date
types.setTypeParser(20, (val) => parseInt(val, 10)); // int8

function updateManyHelper(table, pk, cast, rows) {
  const keys = [];
  const bindings = [];
  const set = [];
  Object.keys(rows[0])
    .forEach((key) => {
      keys.push(key);
      set.push(`${key} = data.${key}::${cast[key]}`);
    });
  rows.forEach((row) => {
    keys.forEach((key) => {
      bindings.push(row[key]);
    });
  });
  const values = Array.from(
    { length: rows.length },
    () => `(${Array.from({ length: keys.length }, () => '?')
      .join(',')})`,
  )
    .join(',');

  const sql = `update ${table} as t
               set ${set.join(',')}
               from (values ${values}) as data (${keys.join(',')})
               where t.${pk}::${cast[pk]} = data.${pk}::${cast[pk]}`;

  return {
    keys,
    sql,
    values,
    bindings,
  };
}

const db = ({
  connection,
  client,
  poolMin,
  poolMax,
  log,
}) => {
  const knex = Knex({
    client,
    connection,
    asyncStackTraces: true,
    pool: {
      min: parseInt(poolMin || 1, 10),
      max: parseInt(poolMax || 1, 10),
      afterCreate(conn, done) {
        conn.query('SET timezone="utc";', (err) => {
          done(err, conn);
        });
      },
    },
  });
  if (log) {
    knex.on('query', (q) => {
      // console.log(q);
      // eslint-disable-next-line no-console
      console.info([q.sql, q.bindings]);
    });
    /*
    knex.on('query-response', function(response, obj, builder) {
      console.log(obj);
    });
     */
  }
  knex.updateManyHelper = updateManyHelper;
  return knex;
};

module.exports = db;
