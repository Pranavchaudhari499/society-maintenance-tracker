import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import {
    getAllComplaints,
    updateComplaintStatus,
    updateComplaintPriority,
} from "../controllers/adminComplaintController";

const router = Router();

// All admin complaint routes require a logged-in admin
router.use(authenticate, requireAdmin);

router.get("/", getAllComplaints);
router.patch("/:id/status", updateComplaintStatus);
router.patch("/:id/priority", updateComplaintPriority);

export default router;