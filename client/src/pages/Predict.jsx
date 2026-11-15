import React, { useState } from "react";
import axios from "axios";
import PredictionForm from "../components/PredictionForm.jsx";
import ResultsPanel from "../components/ResultsPanel.jsx";
import { Info, CheckCircle, AlertTriangle } from "lucide-react";

export default function Predict() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post("/api/predict", formData);
      setResult(res.data);
    } catch (err) {
      console.error("Prediction error:", err);
      setError(
        err.response?.data?.error?.detail ||
          err.response?.data?.error ||
          "Failed to obtain prediction from ML microservice."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
            Adolescent Smartphone Addiction Risk Classifier
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Predictive modeling using Decision Tree, Logistic Regression, and Random Forest with local SHAP feature explanations.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>FastAPI Microservice Active</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-rose-600" />
          <div>
            <span className="font-semibold">Prediction Failed: </span>
            {typeof error === "string" ? error : JSON.stringify(error)}
          </div>
        </div>
      )}

      {/* Main Grid: Form on Left (60%), Results on Right (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <PredictionForm onSubmit={handlePredict} loading={loading} />
        </div>

        <div className="lg:col-span-5 sticky top-20">
          <ResultsPanel result={result} />
        </div>
      </div>
    </div>
  );
}
