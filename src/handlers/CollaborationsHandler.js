const ClientError = require('../exceptions/ClientError');

class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, usersService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(req, res) {
    try {
      this._validator.validateCollaborationPayload(req.body);
      const { playlistId, userId } = req.body;
      const { id: credentialId } = req.auth;

      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      await this._usersService.getUserById(userId);

      const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId);

      return res.status(201).json({
        status: 'success',
        message: 'Kolaborasi berhasil ditambahkan',
        data: {
          collaborationId,
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

  async deleteCollaborationHandler(req, res) {
    try {
      this._validator.validateCollaborationPayload(req.body);
      const { playlistId, userId } = req.body;
      const { id: credentialId } = req.auth;

      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      await this._collaborationsService.deleteCollaboration(playlistId, userId);

      return res.json({
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
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

module.exports = CollaborationsHandler;
