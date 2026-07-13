import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { upload } from "../middleware/upload";
import {
    createComplaint,
    getMyComplaints,
    getMyComplaintById,
} from "../controllers/complaintController";

const router = Router();

// All complaint routes require a logged-in user
router.use(authenticate);

router.post("/", upload.array("photos", 5), createComplaint);
router.get("/mine", getMyComplaints);
router.get("/mine/:id", getMyComplaintById);

export default router;