/**
 * @swagger
 * tags:
 *   - name: Accessories
 *     description: Endpoints for managing accessories
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Accessory:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - value
 *         - src
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the accessory
 *           example: "60c72b2f9c1b4b0015b8e4e1"
 *         name:
 *           type: string
 *           description: The name of the accessory
 *           example: "Red T-Shirt"
 *         type:
 *           type: string
 *           description: The type of accessory
 *           enum: [Backgrounds, Shirts, SkinColor, Bigode, Cachecol, Chapeu, Ouvidos]
 *           example: "Shirts"
 *         value:
 *           type: number
 *           description: The value or cost of the accessory
 *           example: 100
 *         src:
 *           type: string
 *           description: The source URL of the accessory image
 *           example: "https://example.com/images/red_tshirt.png"
 */

/**
 * @swagger
 * /accessories:
 *   get:
 *     summary: Get all accessories
 *     tags: [Accessories]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [Backgrounds, Shirts, SkinColor, Bigode, Cachecol, Chapeu, Ouvidos]
 *         description: Filter accessories by type
 *     responses:
 *       200:
 *         description: A list of accessories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Accessory'
 *       400:
 *         description: Invalid accessory type provided
 *       500:
 *         description: Server error
 *
 *   post:
 *     summary: Add a new accessory
 *     tags: [Accessories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Accessory'
 *     responses:
 *       201:
 *         description: Accessory created successfully
 *       400:
 *         description: Missing required fields or invalid accessory type
 *       403:
 *         description: Unauthorized - user is not an admin or token is missing
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /accessories/{id}:
 *   put:
 *     summary: Update an existing accessory
 *     tags: [Accessories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the accessory to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Accessory'
 *     responses:
 *       200:
 *         description: Accessory updated successfully
 *       400:
 *         description: Missing required fields or invalid accessory type
 *       403:
 *         description: Unauthorized - user is not an admin or token is missing
 *       404:
 *         description: Accessory not found
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete an accessory
 *     tags: [Accessories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the accessory to delete
 *     responses:
 *       200:
 *         description: Accessory deleted successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Accessory not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /accessories/stats:
 *   get:
 *     summary: Get accessory statistics
 *     tags: [Accessories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics for accessories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAccessories:
 *                   type: integer
 *                   description: The total number of accessories
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

const express = require("express");
const router = express.Router();

const accessoriesController = require("../controllers/accessories.controller");
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
  .get(accessoriesController.getAccessories)
  .post(authMiddleware, accessoriesController.addAccessory);

router
  .route("/:id")
  .put(authMiddleware, accessoriesController.updateAccessory)
  .delete(authMiddleware, accessoriesController.deleteAccessory);

router.get("/stats", authMiddleware, accessoriesController.getAccessoriesStats);

module.exports = router;
