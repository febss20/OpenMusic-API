const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const routes = (handler) => {
  const router = express.Router();

  router.use(authenticateToken);

  router.post('/', handler.postPlaylistHandler);
  router.get('/', handler.getPlaylistsHandler);
  router.delete('/:id', handler.deletePlaylistByIdHandler);

  router.post('/:id/songs', handler.postSongToPlaylistHandler);
  router.get('/:id/songs', handler.getSongsFromPlaylistHandler);
  router.delete('/:id/songs', handler.deleteSongFromPlaylistHandler);

  return router;
};

module.exports = routes;
