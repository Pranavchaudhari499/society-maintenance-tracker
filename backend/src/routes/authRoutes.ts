import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login } from "../controllers/authController";

const router = Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: { code: "RATE_LIMITED", message: "Too many attempts, please try again later" },
    },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

export default router;