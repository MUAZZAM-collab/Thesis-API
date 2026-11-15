import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";

import predictRouter from "./routes/predict.js";
import historyRouter from "./routes/history.js";
import authRouter from "./routes/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/teen_phone_addiction";

// Middlewares
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Mount API Routes
app.use("/api", predictRouter);
app.use("/api", historyRouter);
app.use("/api/auth", authRouter);

// Root informational endpoint
app.get("/", (req, res) => {
  res.json({
    project: "Teen Smartphone Addiction Risk Prediction System",
    stack: "MERN Stack + Python FastAPI ML Microservice",
    version: "2.0.0",
    status: "online",
    endpoints: {
      predict: "POST /api/predict",
      compare: "GET /api/models/compare",
      feature_importance: "GET /api/feature-importance",
      batch_predict: "POST /api/batch-predict",
      history: "GET /api/history",
      auth: "/api/auth",
      health: "GET /api/health"
    }
  });
});

// Database Connection with Resilient Fallback
async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2500
    });
    console.log("MongoDB connected successfully at:", MONGODB_URI);
  } catch (err) {
    console.warn("Notice: MongoDB connection not detected. Operating with resilient persistent local store.");
    console.warn("  (All prediction records and history are saved to disk in server/data/predictions_local.json)");
  }
}

connectDatabase();

app.listen(PORT, () => {
  console.log(`Node/Express Server running on http://localhost:${PORT}`);
  console.log(`Proxying ML inference to FastAPI on: ${process.env.FASTAPI_URL || "http://localhost:8000"}`);
});
