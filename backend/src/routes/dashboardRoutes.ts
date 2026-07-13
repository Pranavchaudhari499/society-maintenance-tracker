import { Router } from "express";
import { getDashboard } from "../controllers/dashboardController";
import { requireAdmin, authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, requireAdmin, getDashboard);

export default router;
