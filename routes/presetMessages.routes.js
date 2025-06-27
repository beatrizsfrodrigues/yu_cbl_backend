/**
 * @swagger
 * tags:
 *   name: Preset Messages
 *   description: Manage reusable preset messages for user interactions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PresetMessage:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier of the preset message
 *           example: 60b8d295f1d3c914b4e5c123
 *         message:
 *           type: string
 *           description: The message content
 *           example: "Olá, em que posso ajudar?"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2023-04-01T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2023-04-01T10:05:00Z"
 */

/**
 * @swagger
 * /preset-messages:
 *   get:
 *     summary: Retrieve all preset messages
 *     tags: [Preset Messages]
 *     responses:
 *       200:
 *         description: Successfully retrieved list of preset messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PresetMessage'
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Create a new preset message (admin only)
 *     tags: [Preset Messages]
 *     security:
 *       - bearerAuth: []
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
 *                 example: "Olá, em que posso ajudar?"
 *     responses:
 *       201:
 *         description: Preset message created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access only
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /preset-messages/{id}:
 *   put:
 *     summary: Update an existing preset message (admin only)
 *     tags: [Preset Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the message to update
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
 *                 example: "Esta é uma mensagem atualizada."
 *     responses:
 *       200:
 *         description: Preset message updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access only
 *       404:
 *         description: Preset message not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete a preset message (admin only)
 *     tags: [Preset Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the message to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message successfully deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access only
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */

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

router
  .route("/:id")
  .put(authMiddleware, presetMessagesController.updateMessage)
  .delete(authMiddleware, presetMessagesController.deleteMessage);

module.exports = router;
