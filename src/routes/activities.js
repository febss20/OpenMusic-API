const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const routes = (handler) => {
  const router = express.Router();

  router.use(authenticateToken);

  router.get('/:id/activities', handler.getPlaylistActivitiesHandler);

  return router;
};

module.exports = routes;
