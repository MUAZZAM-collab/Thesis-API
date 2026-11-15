import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Prediction from "./Prediction.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");
const FALLBACK_FILE = path.join(DATA_DIR, "predictions_local.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readLocalStore() {
  if (!fs.existsSync(FALLBACK_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(FALLBACK_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading local predictions fallback:", err);
    return [];
  }
}

function writeLocalStore(items) {
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to local predictions fallback:", err);
  }
}

export const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

export async function savePredictionRecord(recordData) {
  if (isMongoConnected()) {
    try {
      const pred = new Prediction(recordData);
      return await pred.save();
    } catch (e) {
      console.warn("MongoDB save failed, falling back to persistent local storage:", e.message);
    }
  }

  // Fallback persistent local JSON store
  const items = readLocalStore();
  const newRecord = {
    _id: "local_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
    createdAt: new Date().toISOString(),
    ...recordData
  };
  items.unshift(newRecord);
  // Cap local history to 200 items
  if (items.length > 200) items.length = 200;
  writeLocalStore(items);
  return newRecord;
}

export async function fetchPredictionHistory({ limit = 50, skip = 0, riskLevel = null }) {
  if (isMongoConnected()) {
    try {
      const filter = {};
      if (riskLevel && riskLevel !== "All") {
        filter.predictedClass = riskLevel;
      }
      const total = await Prediction.countDocuments(filter);
      const items = await Prediction.find(filter)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit));
      return { total, items };
    } catch (e) {
      console.warn("MongoDB fetch failed, falling back to local storage:", e.message);
    }
  }

  // Fallback local store
  let items = readLocalStore();
  if (riskLevel && riskLevel !== "All") {
    items = items.filter((it) => it.predictedClass === riskLevel);
  }
  const total = items.length;
  const paginated = items.slice(Number(skip), Number(skip) + Number(limit));
  return { total, items: paginated };
}

export async function fetchPredictionById(id) {
  if (isMongoConnected() && !id.startsWith("local_")) {
    try {
      return await Prediction.findById(id);
    } catch (e) {
      console.warn("MongoDB fetchById failed:", e.message);
    }
  }
  const items = readLocalStore();
  return items.find((it) => it._id === id || it.id === id) || null;
}

export async function removePredictionRecord(id) {
  if (isMongoConnected() && !id.startsWith("local_")) {
    try {
      await Prediction.findByIdAndDelete(id);
      return true;
    } catch (e) {
      console.warn("MongoDB delete failed:", e.message);
    }
  }
  let items = readLocalStore();
  items = items.filter((it) => it._id !== id && it.id !== id);
  writeLocalStore(items);
  return true;
}

export async function clearAllPredictionHistory() {
  if (isMongoConnected()) {
    try {
      await Prediction.deleteMany({});
    } catch (e) {
      console.warn("MongoDB deleteMany failed:", e.message);
    }
  }
  writeLocalStore([]);
  return true;
}
