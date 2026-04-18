const express = require("express");
const {
  search,
  show,
  saveRecipe,
  listSaved,
  removeSaved
} = require("../controllers/recipeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/search", search);
router.get("/saved", listSaved);
router.post("/saved", saveRecipe);
router.delete("/saved/:id", removeSaved);
router.get("/:id", show);

module.exports = router;

