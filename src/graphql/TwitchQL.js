class TwitchQL {
  static async channelsByUUID(di, { uuid }) {
    const map = new Map();
    const list = await di.services.TwitchChannelService.getByUUIDs(di.db, uuid);
    list.forEach((channel) => {
      map.set(channel.uuid, channel);
    });
    return uuid.map((g) => {
      const channel = map.get(g);
      return di.services.TwitchChannelService.decorator(di, channel);
    });
  }

  static async channelsByGID(di, { gid }) {
    const map = new Map();
    const list = await di.services.TwitchChannelService.getByGIDs(di.db, gid);
    list.forEach((channel) => {
      map.set(channel.uuid, channel);
    });
    return gid.map((g) => {
      const channel = map.get(g);
      return di.services.TwitchChannelService.decorator(di, channel);
    });
  }

  static async channelsTop(di, {
    search,
    views,
    followers,
    limit = 10,
    offset = 0,
    order,
  }) {
    const response = {
      filters: {
        search,
        views,
        followers,
        order,
      },
      pagination: {
        count: 0,
        limit,
        offset,
      },
      list: [],
    };

    const query = di.services.TwitchChannelService.query(di);
    if (search && search.length > 0) {
      query.whereRaw('title ilike %?%', [search]);
    }
    const count = query.clone()
      .count('id as count')
      .first();

    response.pagination.count = count.count;

    switch (order) {
      case '-views':
        query.orderBy('views', 'desc');
        break;
      case 'views':
        query.orderBy('views', 'asc');
        break;
      case '-followers':
        query.orderBy('followers', 'desc');
        break;
      case 'followers':
        query.orderBy('followers', 'asc');
        break;
      case '-publishedAt':
        query.orderBy('published_at', 'desc');
        break;
      case 'publishedAt':
        query.orderBy('published_at', 'asc');
        break;
      default:
        query.orderBy('followers', 'desc');
    }
    const list = await query.limit(limit)
      .offset(offset);

    response.list = list.map((item) => di.services.TwitchChannelService.decorator(di, item));

    return response;
  }

  static async channelsNew(di, {
    search,
    views,
    followers,
    limit = 10,
    offset = 0,
    order,
  }) {
    const response = {
      filters: {
        search,
        views,
        followers,
        order,
      },
      pagination: {
        count: 0,
        limit,
        offset,
      },
      list: [],
    };

    const query = di.services.TwitchChannelService.query(di)
      .where('published_at', '>=', new Date(Date.now() - 30 * 3600 * 24 * 1000).toISOString);

    if (search && search.length > 0) {
      query.where('title ilike %?%', [search]);
    }
    const count = query.clone()
      .count('id as count')
      .first();

    response.pagination.count = count.count;

    switch (order) {
      case '-views':
        query.orderBy('views', 'desc');
        break;
      case 'views':
        query.orderBy('views', 'asc');
        break;
      case '-followers':
        query.orderBy('followers', 'desc');
        break;
      case 'followers':
        query.orderBy('followers', 'asc');
        break;
      case '-publishedAt':
        query.orderBy('published_at', 'desc');
        break;
      case 'publishedAt':
        query.orderBy('published_at', 'asc');
        break;
      default:
        query.orderBy('followers', 'desc');
    }
    const list = await query.limit(limit)
      .offset(offset);

    response.list = list.map((item) => di.services.TwitchChannelService.decorator(di, item));

    return response;
  }

  static async channelsTypeahead(di, {
    search,
    internal,
    external,
  }) {
    const response = {
      filters: {
        search,
        internal,
        external,
      },
      internal: [],
      external: [],
    };

    const isUrl = search.toLowerCase()
      .indexOf('https://') === 0;
    const uuid = di.libs.Twitch.getUUIDByUrl(search);

    if (internal) {
      let list = [];
      if (isUrl) {
        list = await di.services.TwitchChannelService.getByUUIDs(di, [uuid]);
      } else {
        list = await di.services.TwitchChannelService.query(di)
          .where('title ilike %?%', [search])
          .limit(10);
      }
      list.forEach((item) => {
        response.internal.push(di.services.TwitchChannelService.decorator(di, item));
      });
    }

    if (external) {
      if ((isUrl && response.internal.length === 0) || (!isUrl && response.internal.length < 5)) {
        const key = await di.services.TwitchApiKeyService.getActiveRandom(di);
        if (key) {
          const apiClient = di.libs.Twitch.getApiClient({
            clientId: key.data.clientId,
            clientSecret: key.data.clientSecret,
          });
          const data = await di.libs.Twitch.getUserByName(apiClient, {
            username: isUrl ? uuid : search,
          });
          data.forEach((channel) => {
            response.external.push({
              gid: channel.id,
              uuid: channel.name,
              title: channel.title,
              thumbnail: channel.profilePictureUrl,
              link: `https://www.twitch.tv/${channel.name}`,
            });
          });
        }
      }
    }

    return response;
  }

  static async channelLastStream(di, channel, {
    limit = 10,
    offset = 0,
  }) {
    const streams = await di.services.TwitchStreamService.getByChannelGID(di.db, {
      channelGID: channel.gid,
      limit,
      offset,
    });
    return streams.map((stream) => di.services.TwitchStreamService.decorator(di, stream));
  }

  static async streamTags(di, stream) {
    if (!Array.isArray(stream.tagsUUID) || stream.tagsUUID.length === 0) {
      return [];
    }
    return [];
  }

  static async streamGame(di, stream) {
    if (!stream.gameUUID) {
      return null;
    }
    return null;
  }

  static async channelStreamsAggregates(di, channel) {
    const data = await di.services.TwitchStreamService.getAggregatesByChannel(di.db, channel.gid, {
      timeFrom: new Date(Date.now() - 3600 * 24 * 30 * 1000),
    });
    return data.map((x) => ({
      date: x.date,
      viewers: x.viewers,
      duration: (x.duration / 3600).toFixed(2),
    }));
  }

  static async streamsTop(di, {
    search,
    limit = 100,
    offset = 0,
    order,
  }) {
    const response = {
      filters: {
        search,
        order,
      },
      pagination: {
        count: 0,
        limit,
        offset,
      },
      list: [],
    };

    const query = di.services.TwitchStreamService.query(di);
    if (search && search.length > 0) {
      query.whereRaw('title ilike %?%', [search]);
    }

    const count = await query.clone()
      .count('* as count')
      .first();
    response.pagination.count = count.count;

    const list = await query.orderBy('viewers', 'desc')
      .limit(limit)
      .offset(offset);

    response.list = list.map((item) => di.services.TwitchStreamService.decorator(di, item));

    return response;
  }

  static async streamsChannelsLoader(di, streams) {
    const gid = streams.map((x) => x.obj.channelGID);
    const list = await di.services.TwitchChannelService.getByGIDs(di.db, gid);
    const map = new Map();
    list.forEach((row) => {
      map.set(row.gid, row);
    });
    return streams.map((x) => {
      const channel = map.get(x.obj.channelGID);
      return di.services.TwitchChannelService.decorator(di, channel);
    });
  }

  static async streamsGamesLoader(di, streams) {
    const uuid = streams.map((x) => x.obj.game);
    const list = await di.services.TwitchGameService.getByUUIDs(di.db, uuid);
    const map = new Map();
    list.forEach((row) => {
      map.set(row.uuid, row);
    });
    return streams.map((x) => {
      const game = map.get(x.obj.game);
      return game?.title;
    });
  }

  static async streamsTagsLoader(di, streams) {
    const uuid = [];
    streams.forEach((x) => {
      if (Array.isArray(x.obj.tags)) {
        x.obj.tags.forEach((u) => uuid.push(u));
      }
    });
    const list = await di.services.TwitchTagService.getByUUIDs(di.db, uuid);
    const map = new Map();
    list.forEach((row) => {
      map.set(row.uuid, row);
    });
    return streams.map((x) => {
      const tags = [];
      if (Array.isArray(x.obj.tags)) {
        x.obj.tags.forEach((u) => {
          const tag = map.get(u);
          if (tag) {
            tags.push(tag.title);
          }
        });
      }
      return tags;
    });
  }

  static async channelLastStreamsWeek(di, channel) {
    const streams = await di.services.TwitchStreamService.getByChannelPeriodGID(di.db, {
      channelGID: channel.gid,
      timeTo: new Date().toISOString(),
      timeFrom: new Date(Date.now() - 3600 * 24 * 1000 * 7).toISOString(),
    });
    return streams.map((stream) => di.services.TwitchStreamService.decorator(di, stream));
  }

  static async channelsSearchFilters() {
    return null;
  }

  static async channelUpsert() {
    return null;
  }
}

module.exports = TwitchQL;
