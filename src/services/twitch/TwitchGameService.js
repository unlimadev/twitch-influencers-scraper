const AbstractService = require('../AbstractService');

class TwitchGameService extends AbstractService {
  static get table() {
    return 'twitch_games';
  }

  static decorator(di, item) {
    if (!item) {
      return null;
    }
    return {
      uuid: item.uuid,
      title: item.title,
      thumbnail: item.thumbnail.replace('{width}x{height}', '100x100'),
      link: `https://www.twitch.tv/directory/game/${encodeURIComponent(item.title)}`,
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

module.exports = TwitchGameService;
