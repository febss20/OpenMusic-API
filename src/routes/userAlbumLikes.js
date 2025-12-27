const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const routes = (handler) => {
  const router = express.Router();

  router.post('/:albumId/likes', authenticateToken, handler.postLikeHandler);
  router.delete('/:albumId/likes', authenticateToken, handler.deleteLikeHandler);

  router.get('/:albumId/likes', handler.getLikesHandler);

  return router;
};

module.exports = routes;
