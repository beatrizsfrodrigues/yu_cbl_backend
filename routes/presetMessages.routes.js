const express = require("express");
const router = express.Router();

const presetMessagesController = require("../controllers/presetMessages.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const diffSeconds = (Date.now() - start) / 1000;
    console.log(
      `${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`
    );
  });
  next();
});

router
  .route("/")
  .get(presetMessagesController.getMessages)
  .post(authMiddleware, presetMessagesController.createMessage);

module.exports = router;
