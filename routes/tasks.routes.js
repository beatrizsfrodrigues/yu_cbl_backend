const express = require("express");
const router = express.Router();

const tasksController = require("../controllers/tasks.controller");
const authController = require("../controllers/auth.controller");

router.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    // finish event is emitted once the response is sent to the client
    const diffSeconds = (Date.now() - start) / 1000; // figure out how many seconds elapsed
    console.log(
      `${req.method} ${req.originalUrl} completed in ${diffSeconds} seconds`
    );
  });
  next();
});

// router.route("/tasks").post(tasksController.createTask);

router.route("/").get(tasksController.getTasks);

module.exports = router;
