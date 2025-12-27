const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const routes = (handler) => {
  const router = express.Router();

  router.use(authenticateToken);

  router.post('/', handler.postCollaborationHandler);
  router.delete('/', handler.deleteCollaborationHandler);

  return router;
};

module.exports = routes;
