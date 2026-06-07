const express = require("express");
const {
  requestRegistrationOtp,
  register,
  login,
  requestPasswordOtp,
  resetPassword,
  changePassword,
  me
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register/request-otp", requestRegistrationOtp);
router.post("/register", register);
router.post("/login", login);
router.post("/password/request-otp", requestPasswordOtp);
router.post("/password/reset", resetPassword);
router.post("/password/change", protect, changePassword);
router.get("/me", protect, me);

module.exports = router;
