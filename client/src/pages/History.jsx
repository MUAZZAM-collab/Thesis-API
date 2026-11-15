import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  History as HistoryIcon,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/history?riskLevel=${filterClass}`);
      setItems(res.data.items || []);
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [filterClass]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this prediction record?")) return;
    try {
      await axios.delete(`/api/history/${id}`);
      setItems((prev) => prev.filter((it) => it._id !== id && it.id !== id));
      if (selectedRecord && (selectedRecord._id === id || selectedRecord.id === id)) {
        setSelectedRecord(null);
      }
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all history records?")) return;
    try {
      await axios.delete("/api/history");
      setItems([]);
      setSelectedRecord(null);
    } catch (err) {
      console.error("Error clearing history:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
            Prediction History & Longitudinal Auditing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Historical registry of all individual risk assessments with preserved SHAP explanations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href="/api/history-export/csv"
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-navy-800 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>

          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        <span className="text-xs font-semibold text-slate-700">Filter Risk:</span>
        {["All", "Low", "Medium", "High"].map((cls) => (
          <button
            key={cls}
            onClick={() => setFilterClass(cls)}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
              filterClass === cls
                ? "bg-navy-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cls}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-400">Loading history records...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No history records found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Predicted Risk</th>
                  <th className="py-3 px-4">Top Model</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Daily Usage</th>
                  <th className="py-3 px-4">Sleep Hours</th>
                  <th className="py-3 px-4">Bedtime Screen</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {items.map((it) => {
                  const pClass = it.predictedClass || it.riskLevel;
                  const f = it.inputFeatures || {};
                  const rec = it.recommendedModel || {};
                  const badgeClass =
                    pClass === "High"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : pClass === "Medium"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200";

                  return (
                    <tr key={it._id || it.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-sans">
                        {new Date(it.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-sans font-bold border ${badgeClass}`}>
                          {pClass}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-800">{rec.name || "N/A"}</td>
                      <td className="py-3 px-4 font-bold text-navy-950">
                        {rec.confidence ? (rec.confidence * 100).toFixed(1) + "%" : "N/A"}
                      </td>
                      <td className="py-3 px-4">{f.Daily_Usage_Hours ? `${f.Daily_Usage_Hours} h` : "-"}</td>
                      <td className="py-3 px-4">{f.Sleep_Hours ? `${f.Sleep_Hours} h` : "-"}</td>
                      <td className="py-3 px-4">{f.Screen_Time_Before_Bed ? `${f.Screen_Time_Before_Bed} h` : "-"}</td>
                      <td className="py-3 px-4 text-right font-sans">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedRecord(it)}
                            className="p-1 text-navy-700 hover:text-navy-950 hover:bg-slate-100 rounded"
                            title="Inspect SHAP Breakdown"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(it._id || it.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-slate-900 text-base">
                  Historical Assessment Inspection
                </h3>
                <p className="text-xs text-slate-500">
                  Record ID: {selectedRecord._id || selectedRecord.id} •{" "}
                  {new Date(selectedRecord.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary Banner */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 uppercase block font-medium">Result</span>
                  <span className="text-lg font-serif font-bold text-slate-900">
                    {selectedRecord.predictedClass} Addiction Risk
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 uppercase block font-medium">Model Used</span>
                  <span className="text-sm font-mono font-bold text-navy-900">
                    {selectedRecord.recommendedModel?.name} (
                    {(selectedRecord.recommendedModel?.confidence * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Explanatory summary text */}
              {selectedRecord.explanationSummary && (
                <div className="text-xs text-slate-700 bg-navy-50/40 p-3 rounded-lg border border-navy-100 leading-relaxed">
                  {selectedRecord.explanationSummary}
                </div>
              )}

              {/* Top SHAP Drivers */}
              <div>
                <h4 className="text-xs font-serif font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Top SHAP Feature Drivers
                </h4>
                <div className="space-y-2">
                  {selectedRecord.shapTopFeatures?.logistic_regression?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs flex items-start justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{item.feature}</span>
                        <p className="text-slate-600 text-[11px] mt-0.5">{item.description}</p>
                      </div>
                      <span
                        className={`font-mono font-bold text-xs shrink-0 ml-3 ${
                          item.shap_value >= 0 ? "text-rose-700" : "text-emerald-700"
                        }`}
                      >
                        {item.shap_value >= 0 ? `+${item.shap_value}` : item.shap_value} SHAP
                      </span>
                    </div>
                  )) || <p className="text-xs text-slate-400">No SHAP records stored.</p>}
                </div>
              </div>

              {/* Input Features Table */}
              <div>
                <h4 className="text-xs font-serif font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Recorded Participant Features
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  {Object.entries(selectedRecord.inputFeatures || {}).map(([k, v]) => (
                    <div key={k} className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-[10px] text-slate-500 block truncate font-sans">{k}</span>
                      <span className="font-bold text-slate-800">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
