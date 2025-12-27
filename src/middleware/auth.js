const jwt = require('jsonwebtoken');
const AuthenticationError = require('../exceptions/AuthenticationError');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    const error = new AuthenticationError('Missing authentication');
    return res.status(error.statusCode).json({
      status: 'fail',
      message: error.message,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    req.auth = decoded;
    next();
  } catch (error) {
    const authError = new AuthenticationError('Invalid token');
    return res.status(authError.statusCode).json({
      status: 'fail',
      message: authError.message,
    });
  }
};

module.exports = { authenticateToken };
