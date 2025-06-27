/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management and authentication
 *
 * components:
 *   schemas:
 *     UserSignup:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: johndoe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: strongPassword123
 *
 *     UserLogin:
 *       type: object
 *       required:
 *         - emailOrUsername
 *         - password
 *       properties:
 *         emailOrUsername:
 *           type: string
 *           example: johndoe
 *         password:
 *           type: string
 *           format: password
 *           example: strongPassword123
 *
 *     PartnerConnect:
 *       type: object
 *       required:
 *         - code
 *       properties:
 *         code:
 *           type: string
 *           example: AB123
 *
 *     AccessoryPurchase:
 *       type: object
 *       required:
 *         - accessoryId
 *       properties:
 *         accessoryId:
 *           type: string
 *           example: 64b12345fa6789cdef123456
 *
 *     AccessoryEquip:
 *       type: object
 *       required:
 *         - accessoryId
 *         - type
 *       properties:
 *         accessoryId:
 *           type: string
 *           example: 64b12345fa6789cdef123456
 *         type:
 *           type: string
 *           description: Accessory type (e.g., Backgrounds, Shirts, Bigode, Cachecol, Chapeu, Ouvidos, Oculos)
 *           example: Shirts
 *
 * /users/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserSignup'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Validation error (missing fields or email/username already in use)
 *       500:
 *         description: Internal server error
 *
 * /users/google-login:
 *   post:
 *     summary: Login with Google OAuth token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google OAuth token
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized or invalid token
 *       500:
 *         description: Internal server error
 *
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *       401:
 *         description: Unauthorized (no or invalid token)
 *       403:
 *         description: Forbidden (not admin)
 *
 * /users/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     accessoriesOwned:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 *
 * /users/connect-partner:
 *   put:
 *     summary: Connect a user to a partner by code
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PartnerConnect'
 *     responses:
 *       200:
 *         description: Partner connected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/UserSignup'
 *       400:
 *         description: Bad request (missing code or partner already connected)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Partner user not found
 *       500:
 *         description: Internal server error
 *
 * /users/{id}:
 *   put:
 *     summary: Update user info by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: User ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Fields to update (password will be hashed automatically)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               username: newusername
 *               email: newemail@example.com
 *               password: newPassword123
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: No data provided for update
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: User ID to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted successfully (no content)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *
 * /users/partner:
 *   get:
 *     summary: Get connected partner info for logged-in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Partner info retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Partner not found or not connected
 *
 * /users/me:
 *   get:
 *     summary: Get logged-in user's info
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User info retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *
 * /users/accessories:
 *   get:
 *     summary: Get user's owned accessories
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of accessories
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User or accessories not found
 *   post:
 *     summary: Buy an accessory
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Accessory purchase info
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccessoryPurchase'
 *     responses:
 *       200:
 *         description: Accessory bought successfully
 *       400:
 *

 */

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
      return res.status(403).json({
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
