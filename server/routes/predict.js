import express from "express";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
import { savePredictionRecord } from "../models/storage.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

// POST /api/predict
router.post("/predict", async (req, res) => {
  try {
    const inputFeatures = req.body;

    // 1. Call FastAPI microservice
    const fastApiResponse = await axios.post(`${FASTAPI_URL}/predict`, inputFeatures, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000
    });

    const mlResult = fastApiResponse.data;

    // 2. Persist record in database (MongoDB or local store)
    const recordToSave = {
      inputFeatures: mlResult.input_snapshot || inputFeatures,
      predictedClass: mlResult.predicted_class,
      riskLevel: mlResult.risk_level,
      recommendedModel: mlResult.recommended_model,
      modelPredictions: mlResult.model_predictions,
      shapTopFeatures: mlResult.shap_top_features,
      explanationSummary: mlResult.explanation_summary,
      userId: req.user ? req.user.id : null,
      notes: req.body.notes || ""
    };

    const savedRecord = await savePredictionRecord(recordToSave);

    return res.status(200).json({
      success: true,
      predictionId: savedRecord._id || savedRecord.id,
      ...mlResult
    });
  } catch (error) {
    console.error("Error in /api/predict:", error.message);
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data
      });
    }
    return res.status(502).json({
      success: false,
      error: "Unable to connect to Python ML Microservice on port 8000. Ensure FastAPI is running."
    });
  }
});

// GET /api/models/compare
router.get("/models/compare", async (req, res) => {
  try {
    const response = await axios.get(`${FASTAPI_URL}/models/compare`, { timeout: 8000 });
    return res.json(response.data);
  } catch (error) {
    console.error("Error fetching model comparison:", error.message);
    return res.status(502).json({
      error: "FastAPI ML service unavailable for model comparison.",
      details: error.message
    });
  }
});

// GET /api/feature-importance
router.get("/feature-importance", async (req, res) => {
  try {
    const response = await axios.get(`${FASTAPI_URL}/feature-importance`, { timeout: 8000 });
    return res.json(response.data);
  } catch (error) {
    console.error("Error fetching feature importance:", error.message);
    return res.status(502).json({
      error: "FastAPI ML service unavailable for feature importance.",
      details: error.message
    });
  }
});

// POST /api/batch-predict
router.post("/batch-predict", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No CSV file uploaded." });
    }

    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype || "text/csv"
    });

    const response = await axios.post(`${FASTAPI_URL}/batch-predict`, form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    return res.json(response.data);
  } catch (error) {
    console.error("Error proxying batch predict:", error.message);
    return res.status(502).json({
      error: "Batch prediction failed on FastAPI service.",
      details: error.message
    });
  }
});

// GET /api/health
router.get("/health", async (req, res) => {
  let fastApiStatus = "offline";
  try {
    const resp = await axios.get(`${FASTAPI_URL}/health`, { timeout: 3000 });
    fastApiStatus = resp.data.status;
  } catch (e) {
    fastApiStatus = "unreachable";
  }

  return res.json({
    status: "ok",
    express_server: "running",
    fastapi_ml_microservice: fastApiStatus,
    timestamp: new Date().toISOString()
  });
});

export default router;
