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

router.get("/stats", authMiddleware, tasksController.getTasksStats);

router
  .route("/")
  .get(authMiddleware, tasksController.getTasks)
  .post(authMiddleware, tasksController.createTask);

router.get("/notifications", authMiddleware, async (req, res) => {
  const userId = req.query.userId;
  const tasks = await Task.find({
    userId,
    completed: true,
    notification: true,
  });
  res.json({ tasks });
});

router
  .route("/:id")
  .delete(authMiddleware, tasksController.deleteTasks)
  .put(authMiddleware, tasksController.editTasks);

router
  .route("/:id/complete")
  .patch(authMiddleware, tasksController.completeTask);

router.route("/:id/verify").patch(authMiddleware, tasksController.verifyTask);

router
  .route("/:id/remove-reject-message")
  .patch(authMiddleware, tasksController.removeRejectMessage);

router
  .route("/:id/notification")
  .patch(authMiddleware, tasksController.notifyTasks);

module.exports = router;
