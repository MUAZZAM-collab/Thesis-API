import mongoose from "mongoose";

const PredictionSchema = new mongoose.Schema(
  {
    inputFeatures: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    predictedClass: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true
    },
    riskLevel: {
      type: String,
      required: true
    },
    recommendedModel: {
      key: { type: String },
      name: { type: String },
      reason: { type: String },
      confidence: { type: Number },
      f1_score: { type: Number },
      accuracy: { type: Number }
    },
    modelPredictions: [
      {
        model_key: { type: String },
        model_name: { type: String },
        predicted_class: { type: String },
        confidence: { type: Number },
        probabilities: { type: mongoose.Schema.Types.Mixed }
      }
    ],
    shapTopFeatures: {
      type: mongoose.Schema.Types.Mixed
    },
    explanationSummary: {
      type: String
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    clientIp: {
      type: String,
      default: null
    },
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Prediction || mongoose.model("Prediction", PredictionSchema);
