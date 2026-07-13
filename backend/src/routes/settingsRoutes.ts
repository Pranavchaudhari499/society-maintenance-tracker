import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import { getOverdueThreshold, updateOverdueThreshold } from "../controllers/settingsController";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/overdue-threshold", getOverdueThreshold);
router.patch("/overdue-threshold", updateOverdueThreshold);

export default router;