const AbstractService = require('../AbstractService');

class TagService extends AbstractService {
  static get table() {
    return 'twitch_tags';
  }

  static decorator(di, tag) {
    if (!tag) {
      return null;
    }
    return {
      uuid: tag.uuid,
      title: tag.title,
      link: `https://www.twitch.tv/directory/all/tags/${tag.uuid}`,
    };
  }

  static async upsert(db, data, select = ['*']) {
    return db.table(this.table)
      .insert(data, select)
      .onConflict('uuid')
      .merge();
  }

  static async getByUUIDs(db, uuid, select = ['*']) {
    return db.table(this.table)
      .select(select)
      .whereIn('uuid', uuid);
  }
}

module.exports = TagService;
