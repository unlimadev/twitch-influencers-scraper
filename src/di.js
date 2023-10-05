const fs = require('fs');
const EventEmitter = require('events');
const db = require('./db');

class CustomEvent extends EventEmitter {
  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super();
  }
}

const di = () => {
  const injection = {
    controllers: {},
    services: {
      TwitchApiKeyService: require('./services/twitch/TwitchApiKeyService'),
      TwitchChannelService: require('./services/twitch/TwitchChannelService'),
      TwitchStreamService: require('./services/twitch/TwitchStreamService'),
      TwitchTagService: require('./services/twitch/TwitchTagService'),
      TwitchGameService: require('./services/twitch/TwitchGameService'),
    },
    jobs: {},
    libs: {
      Twitch: require('./libs/Twitch'),
    },
    middlewares: {},
    db: db({
      client: 'pg',
      connection: process.env.DB_CONNECTION,
      poolMin: process.env.DB_POOL_MIN,
      poolMax: process.env.DB_POOL_MAX,
      log: process.env.DB_LOG,
    }),
    event: new CustomEvent(),
    app: {},
    fs,
  };
  return injection;
};

module.exports = di;
