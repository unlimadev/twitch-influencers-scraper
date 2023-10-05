const AbstractService = require('../AbstractService');

class TwitchStreamService extends AbstractService {
  static get table() {
    return 'twitch_streams';
  }

  static decorator(di, stream) {
    if (!stream) {
      return null;
    }
    return {
      uuid: stream.uuid,
      channelGID: stream.channel_gid,
      title: stream.title,
      startedAt: stream.started_at?.toISOString(),
      updatedAt: stream.updated_at?.toISOString(),
      gameUUID: stream.game_uuid,
      tagsUUID: stream.tags_uuid,
      thumbnail: stream.thumbnail,
      viewers: stream.viewers,
    };
  }

  static cdnThumbnail(stream) {
    if (!stream?.thumbnail) {
      return null;
    }
    return `${stream.thumbnail.replace('{width}x{height}', '120x90')}?${stream.uuid}`;
  }

  static async upsert({ db }, data, select = ['*']) {
    return db.table(this.table)
      .insert(data, select)
      .onConflict('uuid')
      .merge();
  }

  static async upsertViewers({ db }, data, select = ['*']) {
    return db.table(this.table)
      .insert(data, select)
      .onConflict(['channel_gid', 'uuid', 'started_at'])
      .merge({
        updated_at: data[0].updated_at,
        viewers: db.raw(`GREATEST(${this.table}.viewers, EXCLUDED.viewers)`),
      });
  }

  static async getByChannelGID({ db }, {
    channelGID,
    limit,
    offset,
  }, select = ['*']) {
    return db.table(this.table)
      .select(select)
      .limit(limit)
      .offset(offset)
      .orderBy('started_at', 'desc')
      .where('channel_gid', channelGID);
  }

  static async getByChannelPeriodGID({ db }, {
    channelGID,
    timeFrom,
    timeTo,
  }, select = ['*']) {
    return db.table(this.table)
      .select(select)
      .orderBy('started_at', 'asc')
      .where('channel_gid', channelGID)
      .where('started_at', '>=', timeFrom)
      .where('started_at', '<=', timeTo);
  }

  static async getAggregatesByChannel(db, gid, {
    timeFrom,
    timeTo,
  }) {
    const query = db.table(this.table)
      .where('channel_gid', gid)
      .select(db.raw('date(started_at at time zone \'America/Los_Angeles\') as date'))
      .select(db.raw('sum(viewers) as viewers'))
      .select(db.raw('sum(EXTRACT(EPOCH FROM (updated_at - started_at))) as duration'))
      .groupBy('date')
      .orderBy('date');
    if (timeFrom) {
      query.where('started_at', '>=', timeFrom);
    }
    if (timeTo) {
      query.where('started_at', '<=', timeTo);
    }
    return query;
  }
}

module.exports = TwitchStreamService;
