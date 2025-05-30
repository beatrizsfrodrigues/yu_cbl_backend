const jwt = require("jsonwebtoken");
const config = require("../config/db.config.js");

module.exports = (req, res, next) => {
  // Try to get token from Authorization header
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    // Fallback to token cookie
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, config.SECRET);
    req.user = decoded;

    if (req.user.role !== "admin" && req.user.role !== "user") {
      return res.status(403).json({
        message:
          "Acesso negado! Você não tem permissão para acessar esta rota.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido." });
  }
};
