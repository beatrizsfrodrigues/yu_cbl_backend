const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const usersController = require("../controllers/users.controller");
const googleController = require("../controllers/google.controller");

router.route("/signup").post(usersController.createUser);

router.route("/google-login").post(googleController.login);

router.route("/").get(
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({
          message:
            "Acesso negado. Somente administradores podem acessar essa rota.",
        });
    }
    next();
  },
  usersController.findAll
);

router.post("/login", usersController.login);

router.put("/connect-partner", authMiddleware, usersController.connectPartner);

router.put("/:id", authMiddleware, usersController.updateUser);

router.get("/partner", authMiddleware, usersController.getPartner);
router.get("/me", authMiddleware, usersController.getLoggedInUser);

router.get("/accessories", authMiddleware, usersController.getUserAccessories);

router.post("/accessories", authMiddleware, usersController.buyAccessory);

router.put(
  "/accessories/equip",
  authMiddleware,
  usersController.equipAccessory
);

router.get(
  "/accessories-equipped",
  authMiddleware,
  usersController.getEquippedAccessories
);

router.delete("/:id", authMiddleware, usersController.deleteUser);

router.get("/stats/users", authMiddleware, usersController.getUserStats);

// router
//   .route("/users/:userID")
//   .patch(authController.verifyToken, usersController.editProfile);

module.exports = router;
