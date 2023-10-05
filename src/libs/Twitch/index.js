const { AppTokenAuthProvider } = require('@twurple/auth');
const { ApiClient } = require('@twurple/api');

class Twitch {
  static getApiClient({
    clientId,
    clientSecret,
  }) {
    const authProvider = new AppTokenAuthProvider(clientId, clientSecret);
    return new ApiClient({ authProvider });
  }

  static async getUserByName(apiClient, { username }) {
    const user = await apiClient.users.getUserByName(username);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      profilePictureUrl: user.profilePictureUrl,
      offlinePlaceholderUrl: user.offlinePlaceholderUrl,
      creationDate: user.creationDate,
      description: user.description,
      views: user.views,
      broadcasterType: user.broadcasterType,
    };
  }

  static async getUserById(apiClient, { userId }) {
    const user = await apiClient.users.getUserById(userId);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      profilePictureUrl: user.profilePictureUrl,
      offlinePlaceholderUrl: user.offlinePlaceholderUrl,
      creationDate: user.creationDate,
      description: user.description,
      views: user.views,
      broadcasterType: user.broadcasterType,
    };
  }

  static async getUsersByIds(apiClient, { userId }) {
    const users = await apiClient.users.getUsersByIds(userId);
    if (!users) {
      return [];
    }
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      profilePictureUrl: user.profilePictureUrl,
      offlinePlaceholderUrl: user.offlinePlaceholderUrl,
      creationDate: user.creationDate,
      description: user.description,
      views: user.views,
      broadcasterType: user.broadcasterType,
    }));
  }

  static async getChannelInfo(apiClient, { userId }) {
    const channel = await apiClient.channels.getChannelInfoById(userId);
    if (!channel) {
      return null;
    }
    return {
      delay: channel.delay,
      displayName: channel.displayName,
      gameId: channel.gameId,
      gameName: channel.gameName,
      id: channel.id,
      language: channel.language,
      name: channel.name,
      title: channel.title,
    };
  }

  static async getUserFollowersCount(apiClient, { userId }) {
    const result = await apiClient.users.getFollows({
      followedUser: userId,
    });
    return result ? result.total : null;
  }

  static async getVideos(apiClient, { userId }) {
    const { data: videos } = await apiClient.videos.getVideosByUser(userId, {
      limit: 100,
      orderBy: 'time',
    });
    return videos.map((video) => ({
      id: video.id,
      creationDate: video.creationDate,
      description: video.description,
      duration: video.duration,
      durationInSeconds: video.durationInSeconds,
      isPublic: video.isPublic,
      language: video.language,
      publishDate: video.publishDate,
      streamId: video.streamId,
      thumbnailUrl: video.thumbnailUrl,
      title: video.title,
      type: video.type,
      url: video.url,
      userDisplayName: video.userDisplayName,
      userId: video.userId,
      userName: video.userName,
      views: video.views,
    }));
  }

  static async getClips(apiClient, { userId }) {
    const { data: clips } = await apiClient.clips.getClipsForBroadcaster(userId, { limit: 100 });
    return clips.map((clip) => ({
      id: clip.id,
      broadcasterDisplayName: clip.broadcasterDisplayName,
      broadcasterId: clip.broadcasterId,
      creationDate: clip.creationDate,
      creatorDisplayName: clip.creatorDisplayName,
      creatorId: clip.creatorId,
      embedUrl: clip.embedUrl,
      gameId: clip.gameId,
      language: clip.language,
      thumbnailUrl: clip.thumbnailUrl,
      title: clip.title,
      url: clip.url,
      videoId: clip.videoId,
      views: clip.views,
    }));
  }

  static async getStreams(apiClient, { userId }) {
    const stream = await apiClient.streams.getStreamByUserId(userId);
    if (!stream) {
      return null;
    }
    return {
      id: stream.id,
      gameId: stream.gameId,
      gameName: stream.gameName,
      isMature: stream.isMature,
      language: stream.language,
      startDate: stream.startDate,
      tagIds: stream.tagIds,
      thumbnailUrl: stream.thumbnailUrl,
      title: stream.title,
      type: stream.type,
      userDisplayName: stream.userName,
      userId: stream.userId,
      userName: stream.userName,
      viewers: stream.viewers,
    };
  }

  static async channelSearch(apiClient, { search }) {
    const results = await apiClient.search.searchChannels(search, {
      limit: 10,
    });
    if (!Array.isArray(results?.data)) {
      return [];
    }
    return results.data.map((result) => ({
      gid: result.id,
      uuid: result.name,
      title: result.displayName,
      thumbnail: result.thumbnailUrl,
    }));
  }

  static async getChannelSchedule(apiClient, {
    userId,
    startDate,
  }) {
    const data = [];
    try {
      const result = await apiClient.schedule.getSchedule(userId, {
        startDate,
      });
      if (Array.isArray(result?.data?.segments)) {
        result.data.segments.forEach((x, index) => {
          if (index === 0) {
            data.push({
              startDate: x.startDate.toISOString(),
            });
          }
        });
      }
      // eslint-disable-next-line no-empty
    } catch (e) {

    }
    return data;
  }

  static async getStreamsTags(apiClient, {tags}) {
    const list = apiClient.tags.getStreamTagsByIds
  }

  static getUUIDByUrl(url) {
    const match = url.match(/^(https?:\/\/)?(?:(www|m)\.)?(twitch\.tv)\/([A-Za-z0-9-_.]+)/);
    return match && match[4] ? match[4].toLowerCase() : null;
  }
}

module.exports = Twitch;
