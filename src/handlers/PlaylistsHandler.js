const ClientError = require('../exceptions/ClientError');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler.bind(this);
    this.deleteSongFromPlaylistHandler = this.deleteSongFromPlaylistHandler.bind(this);
  }

  async postPlaylistHandler(req, res) {
    try {
      this._validator.validatePlaylistPayload(req.body);
      const { name } = req.body;
      const { id: credentialId } = req.auth;

      const playlistId = await this._service.addPlaylist({
        name,
        owner: credentialId,
      });

      return res.status(201).json({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: {
          playlistId,
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

  async getPlaylistsHandler(req, res) {
    try {
      const { id: credentialId } = req.auth;
      const playlists = await this._service.getPlaylists(credentialId);

      return res.json({
        status: 'success',
        data: {
          playlists,
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

  async deletePlaylistByIdHandler(req, res) {
    try {
      const { id } = req.params;
      const { id: credentialId } = req.auth;

      await this._service.verifyPlaylistOwner(id, credentialId);
      await this._service.deletePlaylistById(id);

      return res.json({
        status: 'success',
        message: 'Playlist berhasil dihapus',
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

  async postSongToPlaylistHandler(req, res) {
    try {
      this._validator.validatePlaylistSongPayload(req.body);
      const { songId } = req.body;
      const { id: playlistId } = req.params;
      const { id: credentialId } = req.auth;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.verifySongExists(songId);
      await this._service.addSongToPlaylist(playlistId, songId, credentialId);

      return res.status(201).json({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
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

  async getSongsFromPlaylistHandler(req, res) {
    try {
      const { id: playlistId } = req.params;
      const { id: credentialId } = req.auth;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      const { playlist, songs } = await this._service.getSongsFromPlaylist(playlistId);

      return res.json({
        status: 'success',
        data: {
          playlist: {
            ...playlist,
            songs,
          },
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

  async deleteSongFromPlaylistHandler(req, res) {
    try {
      this._validator.validatePlaylistSongPayload(req.body);
      const { songId } = req.body;
      const { id: playlistId } = req.params;
      const { id: credentialId } = req.auth;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.deleteSongFromPlaylist(playlistId, songId, credentialId);

      return res.json({
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
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

module.exports = PlaylistsHandler;
