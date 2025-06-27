/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Endpoints for messaging and conversations
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         senderId:
 *           type: string
 *         receiverId:
 *           type: string
 *         message:
 *           type: string
 *         seen:
 *           type: boolean
 *         date:
 *           type: string
 *           format: date-time
 *
 *     Conversation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         usersId:
 *           type: array
 *           items:
 *             type: string
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 */

/**
 * @swagger
 * /messages/all:
 *   get:
 *     summary: Get all messages (admin only)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all conversations with messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (non-admin)
 */

/**
 * @swagger
 * /messages/{id}:
 *   get:
 *     summary: Get conversation by ID
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Conversation ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chat:
 *                   $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Conversation not found
 *
 *   post:
 *     summary: Send a message in a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Conversation ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Hello, how can I help you?"
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 msg:
 *                   type: string
 *                 conversation:
 *                   $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Conversation not found
 */

/**
 * @swagger
 * /messages/user/{userId}:
 *   get:
 *     summary: Get messages between logged-in user and specific user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Other user's ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chatId:
 *                   type: string
 *                 totalMessages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: No conversation or messages found
 */

/**
 * @swagger
 * /messages/mark-seen/{userId}:
 *   patch:
 *     summary: Mark all messages received by a user as seen
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User ID whose received messages should be marked as seen
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages marked as seen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 result:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

const express = require("express");
const router = express.Router();

const messagesController = require("../controllers/messages.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { messages } = require("../models");

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

router.get(
  "/all",
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
  messagesController.getAllMessages
);

router
  .route("/:id")
  .get(authMiddleware, messagesController.getChat)
  .post(authMiddleware, messagesController.sendMessage);

router.get("/user/:userId", authMiddleware, messagesController.getChatByUser);

// router.post('/', authMiddleware, messagesController.createConversation);

router.patch(
  "/mark-seen/:userId",
  authMiddleware,
  messagesController.markAllAsSeen
);

module.exports = router;
