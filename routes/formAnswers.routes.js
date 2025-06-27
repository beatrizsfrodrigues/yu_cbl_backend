/**
 * @swagger
 * tags:
 *   - name: Form Answers
 *     description: Submit and retrieve form answers
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FormAnswerItem:
 *       type: object
 *       required:
 *         - question
 *         - answer
 *       properties:
 *         question:
 *           type: string
 *           description: ID of the question
 *           example: "60d0fe4f5311236168a109ca"
 *         answer:
 *           type: string
 *           description: The answer provided
 *           example: "John Doe"
 *
 *     FormAnswer:
 *       type: object
 *       required:
 *         - userId
 *         - date
 *         - answers
 *       properties:
 *         _id:
 *           type: string
 *           example: "665c63c1123a1f2b9d5a9a1f"
 *         userId:
 *           type: string
 *           example: "60cf6f6e0e4f1b001efad7d9"
 *         date:
 *           type: string
 *           description: Submission timestamp
 *           example: "20250627093210"
 *         answers:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/FormAnswerItem"
 *
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
 * /form-answers:
 *   get:
 *     summary: Get all submitted form answers
 *     tags: [Form Answers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: (Admin only) Filter answers by user ID
 *     responses:
 *       200:
 *         description: List of form answers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 answers:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/FormAnswer"
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       403:
 *         description: Forbidden - access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *
 *   post:
 *     summary: Submit form answers
 *     tags: [Form Answers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   $ref: "#/components/schemas/FormAnswerItem"
 *             required:
 *               - answers
 *     responses:
 *       201:
 *         description: Form submitted successfully
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
 *                   example: "Formulário preenchido com sucesso!"
 *                 formAnswer:
 *                   $ref: "#/components/schemas/FormAnswer"
 *       400:
 *         description: Invalid or missing data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       401:
 *         description: Unauthorized - no token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */

const express = require("express");
const router = express.Router();

const formAnswersController = require("../controllers/formAnswers.controller");
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
  .get(authMiddleware, formAnswersController.getAnswers)
  .post(authMiddleware, formAnswersController.fillForm);

module.exports = router;
