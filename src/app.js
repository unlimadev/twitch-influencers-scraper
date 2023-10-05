const fs = require('fs');
const fastify = require('fastify');
const cors = require('@fastify/cors');
const mercurius = require('mercurius');
const TwitchQL = require('./graphql/TwitchQL');

const schema = fs.readFileSync(`${__dirname}/graphql/schema.graphql`, 'utf8');

const app = (di) => {
  const server = fastify({
    bodyLimit: 1024 * 1024 * 5,
    logger: false,
  });
  server.register(cors, {});

  server.addHook('preHandler', (request, reply, done) => {
    reply.header('Expires', 0);
    done();
  });

  server.setErrorHandler((error, request, reply) => {
    reply.code(500)
      .send({
        code: 500,
        error: 'SERVER_ERROR',
        message: 'internal server error',
      });
    // eslint-disable-next-line no-console
    console.error(error);
    throw error;
  });

  const resolvers = {
    Query: {
      TwitchChannelsSearchFilters(root, args) {
        return TwitchQL.channelsSearchFilters(di, args);
      },
      TwitchChannelsByUUID(root, args) {
        return TwitchQL.channelsByUUID(di, args);
      },
      TwitchChannelsByGID(root, args) {
        return TwitchQL.channelsByGID(di, args);
      },
      TwitchChannelsTop(root, args) {
        return TwitchQL.channelsTop(di, args);
      },
      TwitchChannelsNew(root, args) {
        return TwitchQL.channelsNew(di, args);
      },
      TwitchChannelsTypeahead(root, args) {
        return TwitchQL.channelsTypeahead(di, args);
      },
      TwitchStreamsTop(root, args) {
        return TwitchQL.streamsTop(di, args);
      },
    },
    Mutation: {
      TwitchChannelUpsert(root, args) {
        return TwitchQL.channelUpsert(di, args);
      },
    },
    TwitchChannel: {
      lastStreams(root, args) {
        return TwitchQL.channelLastStream(di, root, args);
      },
      lastStreamsWeek(root, args) {
        return TwitchQL.channelLastStreamsWeek(di, root, args);
      },
      streamsAggregates(root, args) {
        return TwitchQL.channelStreamsAggregates(di, root, args);
      },
    },
    TwitchStream: {
      tags(root, args) {
        return TwitchQL.streamTags(di, root, args);
      },
      game(root, args) {
        return TwitchQL.streamGame(di, root, args);
      },
    },
  };

  const loaders = {
    TwitchStreamContent: {
      channel: {
        async loader(queries, { reply }) {
          return TwitchQL.streamsChannelsLoader(di, queries, reply);
        },
        opts: {
          cache: false,
        },
      },
      game: {
        async loader(queries, { reply }) {
          return TwitchQL.streamsGamesLoader(di, queries, reply);
        },
        opts: {
          cache: false,
        },
      },
      tags: {
        async loader(queries, { reply }) {
          return TwitchQL.streamsTagsLoader(di, queries, reply);
        },
        opts: {
          cache: false,
        },
      },
    },
  };
  server.register(mercurius, {
    schema,
    resolvers,
    loaders,
    graphiql: 'graphiql',
    path: '/api/graphql',
    cache: false,
  });

  return server;
};

module.exports = app;
