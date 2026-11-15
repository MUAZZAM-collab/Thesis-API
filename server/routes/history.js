import express from "express";
import {
  fetchPredictionHistory,
  fetchPredictionById,
  removePredictionRecord,
  clearAllPredictionHistory
} from "../models/storage.js";

const router = express.Router();

// GET /api/history
router.get("/history", async (req, res) => {
  try {
    const { limit = 50, skip = 0, riskLevel = "All" } = req.query;
    const historyData = await fetchPredictionHistory({
      limit: parseInt(limit, 10),
      skip: parseInt(skip, 10),
      riskLevel
    });
    return res.json(historyData);
  } catch (error) {
    console.error("Error retrieving history:", error);
    return res.status(500).json({ error: "Failed to retrieve prediction history" });
  }
});

// GET /api/history/:id
router.get("/history/:id", async (req, res) => {
  try {
    const record = await fetchPredictionById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: "Prediction record not found" });
    }
    return res.json(record);
  } catch (error) {
    console.error("Error retrieving record:", error);
    return res.status(500).json({ error: "Failed to retrieve record" });
  }
});

// DELETE /api/history/:id
router.delete("/history/:id", async (req, res) => {
  try {
    await removePredictionRecord(req.params.id);
    return res.json({ success: true, message: "Record deleted successfully" });
  } catch (error) {
    console.error("Error deleting record:", error);
    return res.status(500).json({ error: "Failed to delete record" });
  }
});

// DELETE /api/history (Clear all)
router.delete("/history", async (req, res) => {
  try {
    await clearAllPredictionHistory();
    return res.json({ success: true, message: "All history cleared" });
  } catch (error) {
    console.error("Error clearing history:", error);
    return res.status(500).json({ error: "Failed to clear history" });
  }
});

// GET /api/history/export/csv
router.get("/history-export/csv", async (req, res) => {
  try {
    const { items } = await fetchPredictionHistory({ limit: 1000, skip: 0 });
    if (!items || items.length === 0) {
      return res.status(404).send("No records available to export.");
    }

    const headers = [
      "ID",
      "Timestamp",
      "Predicted_Class",
      "Recommended_Model",
      "Confidence",
      "Daily_Usage_Hours",
      "Sleep_Hours",
      "Academic_Performance",
      "Screen_Time_Before_Bed",
      "Phone_Checks_Per_Day"
    ];

    const rows = items.map((it) => {
      const f = it.inputFeatures || {};
      const rec = it.recommendedModel || {};
      return [
        it._id || it.id,
        new Date(it.createdAt).toISOString(),
        it.predictedClass || it.riskLevel,
        rec.name || "N/A",
        rec.confidence ? (rec.confidence * 100).toFixed(1) + "%" : "N/A",
        f.Daily_Usage_Hours ?? "",
        f.Sleep_Hours ?? "",
        f.Academic_Performance ?? "",
        f.Screen_Time_Before_Bed ?? "",
        f.Phone_Checks_Per_Day ?? ""
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="prediction_history.csv"');
    return res.send(csvContent);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return res.status(500).send("Error exporting CSV.");
  }
});

export default router;
