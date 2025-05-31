const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.get("/api/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ user: decoded });
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
});

module.exports = router;
