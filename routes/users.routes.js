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

router.route("/")
  .get(authMiddleware, (req, res, next) => {
   
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Somente administradores podem acessar essa rota.' });
    }
    next(); 
  }, usersController.findAll);


router.post("/login", usersController.login);

router.put("/connect-partner", authMiddleware, usersController.connectPartner);

router.put("/:id", authMiddleware, usersController.updateUser);

router.get("/partner", authMiddleware, usersController.getPartner);
router.get("/me", authMiddleware, usersController.getLoggedInUser);

router.get('/accessories', authMiddleware, usersController.getUserAccessories);

router.post('/accessories', authMiddleware, usersController.buyAccessory);

router.delete('/:id', authMiddleware, usersController.deleteUser);

router.get('/stats/users', authMiddleware, usersController.getUserStats);

// router
//   .route("/users/:userID")
//   .patch(authController.verifyToken, usersController.editProfile);

module.exports = router;
