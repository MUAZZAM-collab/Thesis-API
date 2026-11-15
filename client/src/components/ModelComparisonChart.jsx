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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { Award, Table, Eye, CheckCircle2 } from "lucide-react";

export default function ModelComparisonChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMatrixModel, setSelectedMatrixModel] = useState("logistic_regression");

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/models/compare");
        setData(res.data);
      } catch (err) {
        console.error("Error fetching comparison:", err);
        setError("Could not load model comparison metrics.");
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-navy-700 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm text-slate-500 font-mono">Loading research comparison metrics...</p>
      </div>
    );
  }

  if (error || !data || !data.models) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
        {error || "No model metrics available."}
      </div>
    );
  }

  const models = data.models;

  // Prepare Bar Chart Data for Accuracy, F1, and AUC
  const barChartData = models.map((m) => ({
    name: m.name,
    Accuracy: Number((m.accuracy * 100).toFixed(1)),
    "Macro F1": Number((m.f1_macro * 100).toFixed(1)),
    "ROC-AUC": Number((m.auc * 100).toFixed(1)),
    "CV Accuracy": Number((m.cv_mean * 100).toFixed(1))
  }));

  // Prepare Radar Chart Data for Multi-metric Comparison
  const radarMetrics = [
    { metric: "Accuracy", key: "accuracy" },
    { metric: "Precision (Macro)", key: "precision_macro" },
    { metric: "Recall (Macro)", key: "recall_macro" },
    { metric: "F1 Score (Macro)", key: "f1_macro" },
    { metric: "ROC-AUC", key: "auc" }
  ];

  const radarData = radarMetrics.map(({ metric, key }) => {
    const entry = { metric };
    models.forEach((m) => {
      entry[m.name] = Number(((m[key] || 0) * 100).toFixed(1));
    });
    return entry;
  });

  const activeModelObj = models.find((m) => m.key === selectedMatrixModel) || models[0];

  return (
    <div className="space-y-8">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {models.map((m) => {
          const isBest = m.key === "logistic_regression";
          return (
            <div
              key={m.key}
              className={`p-5 rounded-xl border transition-all ${
                isBest
                  ? "bg-navy-900 text-white border-navy-800 shadow-md ring-2 ring-navy-600/30"
                  : "bg-white text-slate-900 border-slate-200 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-mono uppercase tracking-wider ${isBest ? "text-navy-200" : "text-slate-500"}`}>
                  {m.name}
                </span>
                {isBest && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500 text-white flex items-center space-x-1">
                    <Award className="w-3 h-3" />
                    <span>Top Ranked</span>
                  </span>
                )}
              </div>

              <div className="text-3xl font-mono font-bold tracking-tight">
                {(m.accuracy * 100).toFixed(1)}%
                <span className={`text-xs ml-1 font-normal ${isBest ? "text-navy-300" : "text-slate-400"}`}>
                  Accuracy
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/20 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className={isBest ? "text-navy-300" : "text-slate-500"}>Macro F1:</span>{" "}
                  <span className="font-mono font-semibold">{(m.f1_macro * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className={isBest ? "text-navy-300" : "text-slate-500"}>ROC-AUC:</span>{" "}
                  <span className="font-mono font-semibold">{(m.auc * 100).toFixed(1)}%</span>
                </div>
                <div className="col-span-2">
                  <span className={isBest ? "text-navy-300" : "text-slate-500"}>5-Fold CV:</span>{" "}
                  <span className="font-mono font-semibold">
                    {(m.cv_mean * 100).toFixed(1)}% ± {(m.cv_std * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Chart Comparison: Bar Chart & Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metric Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h4 className="font-serif font-bold text-slate-900 text-sm">
              Comparative Benchmark Across Primary Metrics
            </h4>
            <p className="text-xs text-slate-500">
              Evaluated on stratified held-out test split (15% sample, N=450).
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: "#64748b" }} domain={[0, 100]} />
                <Tooltip
                  formatter={(val, name) => [`${val}%`, name]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="Accuracy" fill="#1e3a8a" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Macro F1" fill="#0d9488" radius={[3, 3, 0, 0]} />
                <Bar dataKey="ROC-AUC" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="CV Accuracy" fill="#d97706" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h4 className="font-serif font-bold text-slate-900 text-sm">
              Multi-Dimensional Performance Radar
            </h4>
            <p className="text-xs text-slate-500">
              Simultaneous balance between Precision, Recall, F1, and AUC.
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "#334155" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Tooltip
                  formatter={(val, name) => [`${val}%`, name]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px"
                  }}
                />
                <Radar name="Logistic Regression" dataKey="Logistic Regression" stroke="#1e3a8a" fill="#1e3a8a" fillOpacity={0.4} />
                <Radar name="Random Forest" dataKey="Random Forest" stroke="#0d9488" fill="#0d9488" fillOpacity={0.3} />
                <Radar name="Decision Tree" dataKey="Decision Tree" stroke="#d97706" fill="#d97706" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Research-Grade Metrics Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h4 className="font-serif font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Table className="w-4 h-4 text-navy-800" />
              <span>Table 1: Empirical Evaluation & Cross-Validation Summary</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              5-Fold Stratified Cross-Validation reporting Mean ± Standard Deviation, with held-out test split evaluation.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">N = 3,000 Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Classifier Algorithm</th>
                <th className="py-3 px-4">Test Accuracy</th>
                <th className="py-3 px-4">Macro Precision</th>
                <th className="py-3 px-4">Macro Recall</th>
                <th className="py-3 px-4">Macro F1</th>
                <th className="py-3 px-4">ROC-AUC</th>
                <th className="py-3 px-4">5-Fold CV Accuracy</th>
                <th className="py-3 px-4">5-Fold CV Macro F1</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {models.map((m) => (
                <tr key={m.key} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-semibold text-slate-900 flex items-center space-x-1.5">
                    {m.key === "logistic_regression" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>{m.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-navy-950">{(m.accuracy * 100).toFixed(2)}%</td>
                  <td className="py-3.5 px-4">{(m.precision_macro * 100).toFixed(2)}%</td>
                  <td className="py-3.5 px-4">{(m.recall_macro * 100).toFixed(2)}%</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{(m.f1_macro * 100).toFixed(2)}%</td>
                  <td className="py-3.5 px-4">{(m.auc * 100).toFixed(2)}%</td>
                  <td className="py-3.5 px-4 text-slate-800">
                    {(m.cv_mean * 100).toFixed(2)}% ± {(m.cv_std * 100).toFixed(2)}%
                  </td>
                  <td className="py-3.5 px-4 text-slate-800">
                    {(m.cv_f1_mean * 100).toFixed(2)}% ± {(m.cv_f1_std * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix Visualizer */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3 mb-4">
          <div>
            <h4 className="font-serif font-bold text-slate-900 text-sm">
              Empirical Confusion Matrix
            </h4>
            <p className="text-xs text-slate-500">
              Evaluated on 450 test split records across target classes: Low, Medium, High.
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-md text-xs">
            {models.map((m) => (
              <button
                key={m.key}
                onClick={() => setSelectedMatrixModel(m.key)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  selectedMatrixModel === m.key
                    ? "bg-white text-navy-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Matrix Rendering */}
        <div className="max-w-md mx-auto pt-2">
          <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-mono">
            {/* Header row */}
            <div className="p-2 text-slate-400 font-sans text-[11px]">True \ Pred</div>
            <div className="p-2 font-semibold text-slate-700 bg-slate-50 rounded">Low</div>
            <div className="p-2 font-semibold text-slate-700 bg-slate-50 rounded">Medium</div>
            <div className="p-2 font-semibold text-slate-700 bg-slate-50 rounded">High</div>

            {/* Matrix Data Rows */}
            {["Low", "Medium", "High"].map((rowLabel, rIdx) => (
              <React.Fragment key={rowLabel}>
                <div className="p-2 font-semibold text-slate-700 bg-slate-50 rounded flex items-center justify-center">
                  {rowLabel}
                </div>
                {["Low", "Medium", "High"].map((colLabel, cIdx) => {
                  const val = activeModelObj.confusion_matrix
                    ? activeModelObj.confusion_matrix[rIdx]?.[cIdx] ?? 0
                    : 0;
                  const isDiag = rIdx === cIdx;
                  return (
                    <div
                      key={colLabel}
                      className={`p-3 rounded font-bold text-sm flex flex-col items-center justify-center transition-all ${
                        isDiag
                          ? val > 0
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-slate-50 text-slate-400"
                          : val > 0
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-slate-50 text-slate-300"
                      }`}
                    >
                      <span>{val}</span>
                      <span className="text-[9px] font-normal text-slate-500 font-sans">
                        {isDiag ? "Correct" : "Error"}
                      </span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
