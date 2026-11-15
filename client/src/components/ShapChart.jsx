import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell
} from "recharts";
import { Layers, Sparkles, Filter } from "lucide-react";

export default function ShapChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModel, setActiveModel] = useState("ensemble_importance");

  useEffect(() => {
    const fetchShap = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/feature-importance");
        setData(res.data);
      } catch (err) {
        console.error("Error fetching feature importance:", err);
        setError("Could not load global SHAP importance.");
      } finally {
        setLoading(false);
      }
    };
    fetchShap();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-navy-700 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm text-slate-500 font-mono">Loading global SHAP rankings...</p>
      </div>
    );
  }

  if (error || !data || !data.top_10) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
        {error || "No SHAP feature importance data found."}
      </div>
    );
  }

  const modelOptions = [
    { key: "ensemble_importance", label: "Ensemble Consensus" },
    { key: "logistic_regression", label: "Logistic Regression" },
    { key: "random_forest", label: "Random Forest" },
    { key: "decision_tree", label: "Decision Tree" }
  ];

  // Prepare Chart Data: sorted by activeModel
  const sortedFeatures = [...data.top_10].sort((a, b) => (b[activeModel] || 0) - (a[activeModel] || 0));
  const chartData = [...sortedFeatures].reverse().map((item) => ({
    feature: item.feature,
    value: Number(((item[activeModel] || 0) * 100).toFixed(1)),
    raw: item[activeModel]
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-navy-800" />
            <h3 className="font-serif font-bold text-slate-900 text-base">
              Global Feature Importance (Mean |SHAP Value|)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked by overall influence on addiction level prediction across the entire cohort.
          </p>
        </div>

        {/* Model Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs">
          {modelOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setActiveModel(opt.key)}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeModel === opt.key
                  ? "bg-white text-navy-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 10, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" unit="%" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis
              type="category"
              dataKey="feature"
              tick={{ fontSize: 11, fill: "#334155" }}
              width={140}
            />
            <Tooltip
              formatter={(val) => [`${val}%`, "Relative Importance"]}
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#e2e8f0",
                borderRadius: "8px",
                fontSize: "12px"
              }}
            />
            <Bar dataKey="value" fill="#1e3a8a" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === chartData.length - 1 ? "#0f172a" : "#3b82f6"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Feature Narrative Callout */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-xs text-slate-700 leading-relaxed">
        <span className="font-semibold text-slate-900">Research Takeaway: </span>
        The global SHAP attribution across all three estimators consistently ranks{" "}
        <span className="font-bold text-navy-900">Daily Usage Hours</span> and{" "}
        <span className="font-bold text-navy-900">Time on Social Media</span> as the dominant positive drivers of smartphone addiction, followed closely by{" "}
        <span className="font-bold text-navy-900">Screen Time Before Bed</span>. Conversely, high Sleep Hours and positive Family Communication consistently operate as protective stabilizers.
      </div>
    </div>
  );
}
