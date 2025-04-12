const express = require("express");
const router = express.Router();
const accessoriesController = require("../controllers/accessories.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/",  accessoriesController.findAll);

router.get("/stats", authMiddleware, accessoriesController.getAccessoriesStats);

module.exports = router;