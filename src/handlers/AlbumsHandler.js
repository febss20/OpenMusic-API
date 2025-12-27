class AlbumsHandler {
  constructor(service, validator, storageService, uploadsValidator) {
    this._service = service;
    this._validator = validator;
    this._storageService = storageService;
    this._uploadsValidator = uploadsValidator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postAlbumHandler(req, res) {
    try {
      this._validator.validateAlbumPayload(req.body);
      const { name, year } = req.body;

      const albumId = await this._service.addAlbum({ name, year });

      return res.status(201).json({
        status: 'success',
        data: {
          albumId,
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

  async getAlbumByIdHandler(req, res) {
    try {
      const { id } = req.params;
      const album = await this._service.getAlbumById(id);

      const { created_at, updated_at, ...albumData } = album;

      return res.json({
        status: 'success',
        data: {
          album: albumData,
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

  async putAlbumByIdHandler(req, res) {
    try {
      this._validator.validateAlbumPayload(req.body);
      const { id } = req.params;

      await this._service.editAlbumById(id, req.body);

      return res.json({
        status: 'success',
        message: 'Album berhasil diperbarui',
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

  async deleteAlbumByIdHandler(req, res) {
    try {
      const { id } = req.params;
      await this._service.deleteAlbumById(id);

      return res.json({
        status: 'success',
        message: 'Album berhasil dihapus',
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

  async postUploadImageHandler(req, res) {
    try {
      const { id } = req.params;
      if (!req.file) {
        return res.status(400).json({
          status: 'fail',
          message: 'File tidak ditemukan',
        });
      }

      const { buffer, mimetype, originalname } = req.file;

      this._uploadsValidator.validateImageHeaders({ 'content-type': mimetype });

      const fileMetadata = {
        filename: originalname,
        headers: { 'content-type': mimetype }
      };

      const filename = await this._storageService.writeFile(buffer, fileMetadata);
      const fileUrl = this._storageService.getFileUrl(filename);

      await this._service.updateAlbumCover(id, fileUrl);

      return res.status(201).json({
        status: 'success',
        message: 'Sampul berhasil diunggah',
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

module.exports = AlbumsHandler;
