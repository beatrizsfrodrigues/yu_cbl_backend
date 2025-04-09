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
  .get(authMiddleware, formController.getForm)
  .post(authMiddleware, formController.createQuestion)
  .delete(authMiddleware, formController.deleteQuestion);

module.exports = router;
