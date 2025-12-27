const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistHandler(request, res) {
    this._validator.validateExportPlaylistPayload(request.body);

    const { playlistId } = request.params;
    const { id: userId } = request.auth;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const message = {
      playlistId,
      targetEmail: request.body.targetEmail,
    };

    try {
      await this._producerService.sendMessage('export:playlist', JSON.stringify(message));

      return res.status(201).json({
        status: 'success',
        message: 'Permintaan Anda dalam antrean',
      });
    } catch (error) {
      console.error('Export service error:', error.message);
      return res.status(503).json({
        status: 'fail',
        message: 'Layanan export sedang tidak tersedia. Silakan coba lagi nanti.',
      });
    }
  }
}

module.exports = ExportsHandler;
