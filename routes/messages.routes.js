const express = require("express");
const router = express.Router();

const messagesController = require("../controllers/messages.controller");
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
  .route("/:id")
  .get(authMiddleware, messagesController.getChat)
  .post(authMiddleware, messagesController.sendMessage);

router.get("/user/:userId", authMiddleware, messagesController.getChatByUser);

// router.post('/', authMiddleware, messagesController.createConversation);

module.exports = router;
