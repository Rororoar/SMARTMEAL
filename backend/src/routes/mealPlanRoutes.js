const express = require("express");
const {
  generate,
  current,
  show,
  history,
  addRecipeToCurrent,
  toggleGroceryItem,
  togglePrepTask,
  removeMeal,
  clearDay,
  clearWeek
} = require("../controllers/mealPlanController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.post("/generate", generate);
router.post("/current/meals", addRecipeToCurrent);
router.get("/current", current);
router.get("/history", history);
router.get("/:id", show);
router.delete("/:id/meals/:mealId", removeMeal);
router.delete("/:id/days", clearDay);
router.delete("/:id", clearWeek);
router.patch("/:id/grocery/:itemId", toggleGroceryItem);
router.patch("/:id/prep/:taskId", togglePrepTask);

module.exports = router;
