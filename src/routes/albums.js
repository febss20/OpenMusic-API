const express = require('express');
const { upload, handleUploadError } = require('../middleware/upload');

const albumsRoutes = (handler) => {
  const router = express.Router();

  router.post('/', handler.postAlbumHandler);
  router.get('/:id', handler.getAlbumByIdHandler);
  router.put('/:id', handler.putAlbumByIdHandler);
  router.delete('/:id', handler.deleteAlbumByIdHandler);
  router.post('/:id/covers', upload.single('cover'), handler.postUploadImageHandler, handleUploadError);

  return router;
};

module.exports = albumsRoutes;
