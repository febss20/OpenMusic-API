const express = require('express');

const songsRoutes = (handler) => {
  const router = express.Router();

  router.post('/', handler.postSongHandler);
  router.get('/', handler.getSongsHandler);
  router.get('/:id', handler.getSongByIdHandler);
  router.put('/:id', handler.putSongByIdHandler);
  router.delete('/:id', handler.deleteSongByIdHandler);

  return router;
};

module.exports = songsRoutes;
