import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import {
    getNotices,
    createNotice,
    updateNotice,
    deleteNotice,
} from "../controllers/noticeController";

const router = Router();

router.use(authenticate);

// Any authenticated user can read the notice board
router.get("/", getNotices);

// Only admins can manage notices
router.post("/", requireAdmin, createNotice);
router.patch("/:id", requireAdmin, updateNotice);
router.delete("/:id", requireAdmin, deleteNotice);

export default router;