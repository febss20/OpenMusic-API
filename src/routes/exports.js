const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const routes = (handler) => {
  const router = express.Router();

  router.use(authenticateToken);

  router.post('/export/playlists/:playlistId', handler.postExportPlaylistHandler);

  return router;
};

module.exports = routes;
