import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import complaintRoutes from "./routes/complaintRoutes";
import adminComplaintRoutes from "./routes/adminComplaintRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import noticeRoutes from "./routes/noticeRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";

dotenv.config();

const app = express();
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

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});