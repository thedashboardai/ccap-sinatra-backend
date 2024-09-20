const admin = require('../config/firebaseAdmin');
const { UnauthorizedError } = require('../errors/customErrors');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    req.user = decodedToken;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid token'));
  }
};

module.exports = authMiddleware;
