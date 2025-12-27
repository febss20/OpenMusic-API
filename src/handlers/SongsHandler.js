class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(req, res) {
    try {
      this._validator.validateSongPayload(req.body);
      const { title, year, genre, performer, duration, albumId } = req.body;

      const songId = await this._service.addSong({
        title, year, genre, performer, duration, albumId,
      });

      return res.status(201).json({
        status: 'success',
        data: {
          songId,
        },
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          status: 'fail',
          message: error.message,
        });
      }
      return res.status(500).json({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
    }
  }

  async getSongsHandler(req, res) {
    try {
      const { title, performer } = req.query;
      const songs = await this._service.getSongs(title, performer);

      return res.json({
        status: 'success',
        data: {
          songs,
        },
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          status: 'fail',
          message: error.message,
        });
      }
      return res.status(500).json({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
    }
  }

  async getSongByIdHandler(req, res) {
    try {
      const { id } = req.params;
      const song = await this._service.getSongById(id);

      return res.json({
        status: 'success',
        data: {
          song,
        },
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          status: 'fail',
          message: error.message,
        });
      }
      return res.status(500).json({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
    }
  }

  async putSongByIdHandler(req, res) {
    try {
      this._validator.validateSongPayload(req.body);
      const { id } = req.params;

      await this._service.editSongById(id, req.body);

      return res.json({
        status: 'success',
        message: 'Lagu berhasil diperbarui',
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          status: 'fail',
          message: error.message,
        });
      }
      return res.status(500).json({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
    }
  }

  async deleteSongByIdHandler(req, res) {
    try {
      const { id } = req.params;
      await this._service.deleteSongById(id);

      return res.json({
        status: 'success',
        message: 'Lagu berhasil dihapus',
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          status: 'fail',
          message: error.message,
        });
      }
      return res.status(500).json({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
    }
  }
}

module.exports = SongsHandler;
