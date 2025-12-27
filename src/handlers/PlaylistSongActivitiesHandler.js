const ClientError = require('../exceptions/ClientError');

class PlaylistSongActivitiesHandler {
  constructor(playlistSongActivitiesService, playlistsService) {
    this._playlistSongActivitiesService = playlistSongActivitiesService;
    this._playlistsService = playlistsService;

    this.getPlaylistActivitiesHandler = this.getPlaylistActivitiesHandler.bind(this);
  }

  async getPlaylistActivitiesHandler(req, res) {
    try {
      const { id: playlistId } = req.params;
      const { id: credentialId } = req.auth;

      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
      const activities = await this._playlistSongActivitiesService.getActivities(playlistId);

      return res.json({
        status: 'success',
        data: {
          playlistId,
          activities,
        },
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return res.status(error.statusCode).json({
          status: 'fail',
          message: error.message,
        });
      }

      console.error(error);
      return res.status(500).json({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
    }
  }
}

module.exports = PlaylistSongActivitiesHandler;
