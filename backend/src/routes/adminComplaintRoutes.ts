import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import {
    getAllComplaints,
    updateComplaintStatus,
    updateComplaintPriority,
    exportComplaints,
} from "../controllers/adminComplaintController";

const router = Router();

// All admin complaint routes require a logged-in admin
router.use(authenticate, requireAdmin);

router.get("/", getAllComplaints);
router.get("/export", exportComplaints);
router.patch("/:id/status", updateComplaintStatus);
router.patch("/:id/priority", updateComplaintPriority);

export default router;