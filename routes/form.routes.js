/**
 * @swagger
 * tags:
 *   - name: Forms
 *     description: Endpoints for managing form questions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FormQuestion:
 *       type: object
 *       required:
 *         - question
 *         - answers
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier of the question
 *           example: "60d0fe4f5311236168a109ca"
 *         question:
 *           type: string
 *           description: The form question
 *           example: "What is your name?"
 *         answers:
 *           type: array
 *           description: List of possible answers
 *           items:
 *             type: string
 *           example: ["Option A", "Option B"]
 *         active:
 *           type: boolean
 *           description: Whether the question is active or not
 *           example: true
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         msg:
 *           type: string
 *           example: "Tens de ter um token para aceder a esta rota."
 */

/**
 * @swagger
 * /forms:
 *   get:
 *     summary: Get all form questions
 *     tags: [Forms]
 *     responses:
 *       200:
 *         description: List of form questions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 questions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FormQuestion'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   post:
 *     summary: Create a new form question
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - answers
 *             properties:
 *               question:
 *                 type: string
 *                 example: "What is your name?"
 *               answers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["John", "Jane"]
 *     responses:
 *       201:
 *         description: Question created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "Pergunta criada com sucesso!"
 *                 question:
 *                   $ref: '#/components/schemas/FormQuestion'
 *       400:
 *         description: Missing fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /forms/{id}:
 *   patch:
 *     summary: Toggle a question's active state
 *     tags: [Forms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the question to update
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Question updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 msg:
 *                   type: string
 *                   example: "Estado da pergunta trocado com sucesso!"
 *                 question:
 *                   $ref: '#/components/schemas/FormQuestion'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

const express = require("express");
const router = express.Router();

const formController = require("../controllers/form.controller");
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
  .get(formController.getForm)
  .post(authMiddleware, formController.createQuestion);

router.route("/:id").patch(authMiddleware, formController.activeQuestion);

module.exports = router;
