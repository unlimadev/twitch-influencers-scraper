const AbstractService = require('../AbstractService');

class TwitchApiKeyService extends AbstractService {
  static get table() {
    return 'twitch_api_keys';
  }

  static async getActiveRandom({ db }) {
    return db.table(this.table)
      .select('*')
      .where({ active: true })
      .orderByRaw('RANDOM()')
      .first();
  }
}

module.exports = TwitchApiKeyService;
