import express from "express";
import { signup, login, logout } from "../controllers/authController.js";
import { limiterForAuth } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/signup", limiterForAuth, signup);
router.post("/login", limiterForAuth, login);
router.post("/logout", logout);

export default router;