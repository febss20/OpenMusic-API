const express = require('express');

const usersRoutes = (handler) => {
  const router = express.Router();

  router.post('/', handler.postUserHandler);
  router.get('/:id', handler.getUserByIdHandler);

  return router;
};

module.exports = usersRoutes;
