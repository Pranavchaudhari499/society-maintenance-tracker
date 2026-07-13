import { Router } from "express";
import { sseHandler } from "../controllers/streamController";

const router = Router();

router.get("/", sseHandler);

export default router;
