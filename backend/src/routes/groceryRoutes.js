const express = require("express");
const { listForPlan } = require("../controllers/groceryController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/:planId", listForPlan);

module.exports = router;

