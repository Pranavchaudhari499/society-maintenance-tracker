import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ success: true, message: "Server is running" });
});

app.use("/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});