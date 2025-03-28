const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const usersController = require("../controllers/users.controller");
//const authController = require("../controllers/auth.controller");

/*
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
});    */

router.route("/signup").post(usersController.createUser);

router.route("/").get(usersController.findAll);

router.post("/login", usersController.login);

router.put("/connect-partner", authMiddleware, usersController.connectPartner);

router.put("/:id", authMiddleware, usersController.updateUser);

router.get("/partner", authMiddleware, usersController.getPartner);
router.get("/me", authMiddleware, usersController.getLoggedInUser);

// router
//   .route("/users/:userID")
//   .patch(authController.verifyToken, usersController.editProfile);

module.exports = router;
