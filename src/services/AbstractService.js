class AbstractService {
  static query({ db }) {
    return db.table(this.table);
  }

  static async getById({ db }, id, select = ['*']) {
    return db.table(this.table)
      .select(select)
      .where({ id })
      .first();
  }

  static async getByIds({ db }, id, select = ['*']) {
    return db.table(this.table)
      .select(select)
      .whereIn('id', id);
  }

  static async insert({ db }, data, select = ['*']) {
    return db.table(this.table)
      .insert(data, select);
  }

  static async updateById({ db }, id, data, select = ['*']) {
    return db.table(this.table)
      .where('id', id)
      .update(data, select);
  }

  static async updateByIds({ db }, ids, data, select = ['*']) {
    return db.table(this.table)
      .whereIn('id', ids)
      .update(data, select);
  }

  static async deleteById({ db }, id) {
    return db.table(this.table)
      .where('id', id)
      .del();
  }

  static async updateMany({ db }, rows) {
    const {
      sql,
      bindings,
    } = db.updateManyHelper(this.table, 'id', this.cast, rows);

    return db.raw(sql, bindings);
  }

  static async getChunk(db, {
    limit,
    lastId,
    select = ['id'],
  }) {
    return db.table(this.table)
      .select(select)
      .where('id', '>', lastId)
      .orderBy('id', 'asc')
      .limit(limit);
  }
}

module.exports = AbstractService;
