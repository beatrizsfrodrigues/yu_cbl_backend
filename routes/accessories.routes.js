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



// router.get("/", accessoriesController.findAll);

router
  .route("/:id")
  .put(authMiddleware, accessoriesController.updateAccessory)
  .delete(authMiddleware, accessoriesController.deleteAccessory);

router.get("/stats", authMiddleware, accessoriesController.getAccessoriesStats);

module.exports = router;
