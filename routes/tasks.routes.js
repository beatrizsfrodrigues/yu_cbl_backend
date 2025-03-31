const express = require("express");
const router = express.Router();

const tasksController = require("../controllers/tasks.controller");
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
  .get(authMiddleware, tasksController.getTasks)
  .post(authMiddleware, tasksController.createTask);

router.route("/complete").get(authMiddleware, tasksController.getCompleteTasks);

router
  .route("/complete/:id")
  .patch(authMiddleware, tasksController.completeTask);

router.route("/verify/:id").patch(authMiddleware, tasksController.verifyTask);

router
  .route("/remove-reject-message/:id")
  .patch(authMiddleware, tasksController.removeRejectMessage);

module.exports = router;
