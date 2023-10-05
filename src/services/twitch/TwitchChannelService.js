const AbstractService = require('../AbstractService');

class TwitchChannelService extends AbstractService {
  static get table() {
    return 'twitch_channels';
  }

  static get cast() {
    return {
      id: 'bigint',
      gid: 'text',
      uuid: 'text',
      title: 'text',
      description: 'text',
      created_at: 'timestamptz',
      updated_at: 'timestamptz',
      published_at: 'timestamptz',
      thumbnail: 'text',
      views: 'bigint',
      followers: 'bigint',
      subscribers: 'bigint',
    };
  }

  static decorator(di, channel) {
    if (!channel) {
      return null;
    }
    return {
      id: channel.id,
      uuid: channel.uuid,
      gid: channel.gid,
      title: channel.title,
      description: channel.description,
      views: channel.views,
      followers: channel.followers,
      subscribers: channel.subscribers,
      thumbnail: channel.thumbnail,
      link: `https://www.twitch.tv/${channel.uuid}`,
      publishedAt: channel.published_at ? channel.published_at.toISOString() : null,
    };
  }

  static async upsert({ db }, data, select = ['*']) {
    return db.table(this.table)
      .insert(data, select)
      .onConflict('gid')
      .merge();
  }

  static async getByUUIDs({ db }, uuid, select = ['*']) {
    return db.table(this.table)
      .select(select)
      .whereIn('uuid', uuid);
  }

  static async getByGIDs({ db }, gid, select = ['*']) {
    return db.table(this.table)
      .select(select)
      .whereIn('gid', gid);
  }

  static async updateByUUID(db, uuid, update, select = ['*']) {
    return db.table(this.table)
      .where('uuid', uuid)
      .update(update, select);
  }
}

module.exports = TwitchChannelService;
