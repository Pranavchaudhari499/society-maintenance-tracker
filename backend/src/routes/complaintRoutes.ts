import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
    createComplaint,
    getMyComplaints,
    getMyComplaintById,
} from "../controllers/complaintController";

const router = Router();

// All complaint routes require a logged-in user
router.use(authenticate);

router.post("/", createComplaint);
router.get("/mine", getMyComplaints);
router.get("/mine/:id", getMyComplaintById);

export default router;