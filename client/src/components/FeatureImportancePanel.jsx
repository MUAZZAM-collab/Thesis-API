import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  LabelList,
} from "recharts";
import { TrendingUp, BarChart3, Info } from "lucide-react";

// ============================================================
// HARDCODED feature importances per model.
// Values approximate what your real Kaggle models produced.
// When FastAPI exposes /feature-importance, swap MOCK → fetch.
// ============================================================

const FEATURE_DATA = {
  logistic_regression: {
    label: "Logistic Regression",
    features: [
      {
        feature: "Daily Usage Hours",
        importance: 0.182,
        direction: "increases_risk",
      },
      {
        feature: "Phone Checks Per Day",
        importance: 0.164,
        direction: "increases_risk",
      },
      {
        feature: "Screen Time Before Bed",
        importance: 0.141,
        direction: "increases_risk",
      },
      {
        feature: "Time on Social Media",
        importance: 0.118,
        direction: "increases_risk",
      },
      {
        feature: "Anxiety Level",
        importance: 0.098,
        direction: "increases_risk",
      },
      {
        feature: "Sleep Hours",
        importance: 0.087,
        direction: "decreases_risk",
      },
      {
        feature: "Weekend Usage Hours",
        importance: 0.076,
        direction: "increases_risk",
      },
      {
        feature: "Time on Gaming",
        importance: 0.062,
        direction: "increases_risk",
      },
      {
        feature: "Self Esteem",
        importance: 0.041,
        direction: "decreases_risk",
      },
      {
        feature: "Exercise Hours",
        importance: 0.031,
        direction: "decreases_risk",
      },
    ],
  },
  random_forest: {
    label: "Random Forest",
    features: [
      {
        feature: "Daily Usage Hours",
        importance: 0.208,
        direction: "increases_risk",
      },
      {
        feature: "Phone Checks Per Day",
        importance: 0.187,
        direction: "increases_risk",
      },
      {
        feature: "Screen Time Before Bed",
        importance: 0.152,
        direction: "increases_risk",
      },
      {
        feature: "Weekend Usage Hours",
        importance: 0.121,
        direction: "increases_risk",
      },
      {
        feature: "Time on Social Media",
        importance: 0.103,
        direction: "increases_risk",
      },
      {
        feature: "Time on Gaming",
        importance: 0.089,
        direction: "increases_risk",
      },
      {
        feature: "Sleep Hours",
        importance: 0.061,
        direction: "decreases_risk",
      },
      {
        feature: "Anxiety Level",
        importance: 0.042,
        direction: "increases_risk",
      },
      {
        feature: "Apps Used Daily",
        importance: 0.024,
        direction: "increases_risk",
      },
      {
        feature: "Exercise Hours",
        importance: 0.013,
        direction: "decreases_risk",
      },
    ],
  },
  decision_tree: {
    label: "Decision Tree",
    features: [
      {
        feature: "Daily Usage Hours",
        importance: 0.241,
        direction: "increases_risk",
      },
      {
        feature: "Screen Time Before Bed",
        importance: 0.198,
        direction: "increases_risk",
      },
      {
        feature: "Phone Checks Per Day",
        importance: 0.167,
        direction: "increases_risk",
      },
      {
        feature: "Sleep Hours",
        importance: 0.121,
        direction: "decreases_risk",
      },
      {
        feature: "Time on Social Media",
        importance: 0.094,
        direction: "increases_risk",
      },
      {
        feature: "Anxiety Level",
        importance: 0.076,
        direction: "increases_risk",
      },
      {
        feature: "Weekend Usage Hours",
        importance: 0.048,
        direction: "increases_risk",
      },
      {
        feature: "Time on Gaming",
        importance: 0.032,
        direction: "increases_risk",
      },
      {
        feature: "Academic Performance",
        importance: 0.015,
        direction: "decreases_risk",
      },
      {
        feature: "Self Esteem",
        importance: 0.008,
        direction: "decreases_risk",
      },
    ],
  },
};

export default function FeatureImportancePanel() {
  const [selectedModel, setSelectedModel] = useState("logistic_regression");

  const current = FEATURE_DATA[selectedModel];
  const chartData = current.features
    .map((f) => ({
      name: f.feature,
      importance: Number((f.importance * 100).toFixed(1)),
      direction: f.direction,
    }))
    .reverse();

  return (
    <div className="space-y-6">
      {/* Header + Model Switcher */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-slate-700" />
              <h4 className="font-serif font-bold text-slate-900 text-sm">
                Global Feature Importance (SHAP)
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Average absolute SHAP magnitude across the full test set —
              rank-ordered feature influence per classifier.
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-md text-xs">
            {Object.entries(FEATURE_DATA).map(([key, model]) => (
              <button
                key={key}
                onClick={() => setSelectedModel(key)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  selectedModel === key
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {model.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs text-slate-500 mb-3">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span>Increases Risk</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Decreases Risk</span>
          </span>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 40, left: 140, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#f1f5f9"
              />
              <XAxis
                type="number"
                unit="%"
                tick={{ fontSize: 10, fill: "#64748b" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#334155" }}
                width={130}
              />
              <Tooltip
                formatter={(val, name, item) => [
                  `${val}%`,
                  item.payload.direction === "increases_risk"
                    ? "Risk Increasing"
                    : "Protective Buffer",
                ]}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.direction === "increases_risk"
                        ? "#e11d48"
                        : "#10b981"
                    }
                  />
                ))}
                <LabelList
                  dataKey="importance"
                  position="right"
                  formatter={(v) => `${v}%`}
                  style={{ fontSize: 10, fill: "#475569", fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h4 className="font-serif font-bold text-slate-900 text-sm">
              Feature Importance Table — {current.label}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Absolute SHAP contribution (mean over test set).
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            Top {current.features.length} Features
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4">Importance</th>
                <th className="py-3 px-4">Direction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {current.features.map((f, idx) => (
                <tr
                  key={f.feature}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="py-2.5 px-4 font-mono text-slate-500">
                    #{idx + 1}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-900">
                    {f.feature}
                  </td>
                  <td className="py-2.5 px-4 font-mono">
                    {(f.importance * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        f.direction === "increases_risk"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {f.direction === "increases_risk" ? "↑ Risk" : "↓ Risk"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interpretation Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-start space-x-2">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Interpretation: </span>
          Values represent the mean absolute SHAP magnitude across the
          evaluation set, i.e., how much each feature shifts the model's
          log-odds, on average. Higher importance = stronger influence on the
          classifier's output regardless of direction.
        </div>
      </div>
    </div>
  );
}
