require('dotenv')
  .config({ path: `${__dirname}/../../.env` });
const di = require('../di')();

const count = process.argv.slice(2) || '100';
const iterations = Math.ceil(parseInt(count, 10) / 100);

// eslint-disable-next-line no-shadow
async function processStreams(di, {
  streams,
}) {
  const dataset = {
    streams: {
      map: new Map(),
      inserted: [],
    },
    channels: {
      map: new Map(),
      inserted: [],
      updated: [],
    },
  };
  const now = new Date();
  streams.forEach((stream) => {
    dataset.channels.map.set(stream.userId, {
      id: undefined,
      viewers: stream.viewers,
    });
    dataset.streams.inserted.push({
      channel_gid: stream.userId,
      uuid: stream.id,
      title: stream.title,
      started_at: stream.startDate,
      // thumbnail: stream.thumbnailUrl,
      game_uuid: stream.gameId,
      viewers: stream.viewers,
      tags_uuid: JSON.stringify(stream.tagIds),
      updated_at: now,
    });
  });
  if (dataset.streams.inserted.length > 0) {
    await di.services.TwitchStreamService.upsertViewers(di, dataset.streams.inserted, undefined);
  }
  return dataset;
}

// eslint-disable-next-line no-shadow
async function processChannels(di, {
  channels,
  apiClient,
}) {
  const now = new Date();
  const gids = Array.from(channels.keys());
  const usersExists = await di.services.TwitchChannelService.getByGIDs(di, gids);
  const dataset = {
    map: new Map(),
    inserted: [],
    updated: [],
  };
  usersExists.forEach((user) => {
    dataset.map.set(user.gid, user.id);
  });
  const usersData = await apiClient.users.getUsersByIds(gids);
  usersData.forEach((user) => {
    const decorated = {
      id: dataset.map.get(user.id) || undefined,
      gid: user.id,
      uuid: user.name,
      title: user.displayName,
      description: user.description,
      published_at: user.creationDate,
      updated_at: now,
      thumbnail: user.profilePictureUrl,
    };
    if (decorated.id) {
      dataset.updated.push(decorated);
    } else {
      dataset.inserted.push(decorated);
    }
  });
  if (dataset.inserted.length > 0) {
    await di.services.TwitchChannelService.upsert(di, dataset.inserted);
  }
  if (dataset.updated.length > 0) {
    await di.services.TwitchChannelService.updateMany(di, dataset.updated);
  }
}

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

(async () => {
  const key = await di.services.TwitchApiKeyService.getActiveRandom(di);
  if (!key) {
    throw new Error('API_KEY_REQUIRED');
  }
  const apiClient = di.libs.Twitch.getApiClient({
    clientId: key.data.clientId,
    clientSecret: key.data.clientSecret,
  });
  let iteration = 0;
  const filter = {
    type: 'live',
    limit: 100,
    after: undefined,
  };
  do {
    iteration += 1;
    console.info(`iteration = ${iteration}`);
    const {
      cursor,
      data,
    } = await apiClient.streams.getStreams(filter);
    filter.after = cursor;
    if (data.length === 0) {
      break;
    }
    const dataset = await processStreams(di, {
      streams: data,
    });
    await processChannels(di, {
      channels: dataset.channels.map,
      apiClient,
    });
    await sleep(1000);
  }
  while (iteration < iterations);
  await di.db.destroy();
})();
