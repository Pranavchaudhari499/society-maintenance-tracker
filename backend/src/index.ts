import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import complaintRoutes from "./routes/complaintRoutes";
import adminComplaintRoutes from "./routes/adminComplaintRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import noticeRoutes from "./routes/noticeRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import streamRoutes from "./routes/streamRoutes";
import chatbotRoutes from "./routes/chatbotRoutes";
import profileRoutes from "./routes/profileRoutes";
import notificationRoutes from "./routes/notificationRoutes";

dotenv.config();

const app = express();

// Trust Render's reverse proxy for correct IP identification in rate limiting
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ success: true, message: "Server is running" });
});

app.use("/auth", authRoutes);
app.use("/complaints", complaintRoutes);
app.use("/admin/complaints", adminComplaintRoutes);
app.use("/admin/settings", settingsRoutes);
app.use("/notices", noticeRoutes);
app.use("/admin/dashboard", dashboardRoutes);
app.use("/stream", streamRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/profile", profileRoutes);
app.use("/notifications", notificationRoutes);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});