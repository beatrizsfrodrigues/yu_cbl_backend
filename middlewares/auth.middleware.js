
const jwt = require('jsonwebtoken');
const config = require("../config/db.config.js");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer') {
    return res.status(401).json({ message: 'Formato de token inválido.' });
  }

  try {
 
    const decoded = jwt.verify(token, config.SECRET);
    req.user = decoded; 
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
};
