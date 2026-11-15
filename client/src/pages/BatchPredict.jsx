import React, { useState } from "react";
import axios from "axios";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter
} from "lucide-react";

export default function BatchPredict() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [filterClass, setFilterClass] = useState("All");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError(null);
      const res = await axios.post("/api/batch-predict", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResults(res.data);
    } catch (err) {
      console.error("Batch predict error:", err);
      setError(
        err.response?.data?.details ||
          err.response?.data?.error ||
          "Failed to process CSV file."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const headers = [
      "Age",
      "Gender",
      "Location",
      "School_Grade",
      "Daily_Usage_Hours",
      "Sleep_Hours",
      "Academic_Performance",
      "Social_Interactions",
      "Exercise_Hours",
      "Anxiety_Level",
      "Depression_Level",
      "Self_Esteem",
      "Parental_Control",
      "Screen_Time_Before_Bed",
      "Phone_Checks_Per_Day",
      "Apps_Used_Daily",
      "Time_on_Social_Media",
      "Time_on_Gaming",
      "Time_on_Education",
      "Phone_Usage_Purpose",
      "Family_Communication",
      "Weekend_Usage_Hours"
    ];

    const sampleRow1 = "16,Female,Urban,10th,7.5,5.2,74,4,0.5,8,7,4,0,2.5,120,18,4.2,1.8,0.5,Social Media,4,9.0";
    const sampleRow2 = "15,Male,Suburban,9th,2.2,8.5,89,8,2.0,2,2,8,1,0.4,30,7,0.8,0.4,1.0,Education,8,3.0";
    const sampleRow3 = "17,Other,Central,11th,4.5,6.8,82,6,1.2,4,4,6,0,1.2,70,12,1.8,1.2,1.5,Browsing,6,6.0";

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), sampleRow1, sampleRow2, sampleRow3].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "teen_addiction_batch_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadResultsCSV = () => {
    if (!results || !results.results) return;

    const headers = ["Row_Index", "Predicted_Class", "Confidence", "Model_Consensus", "Top_Driver"];
    const rows = results.results.map((r) =>
      [
        r.row_index,
        r.predicted_class,
        (r.recommended_confidence * 100).toFixed(1) + "%",
        `"${r.model_consensus}"`,
        `"${r.top_driver}"`
      ].join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "classified_addiction_predictions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredItems = results
    ? results.results.filter(
        (r) => filterClass === "All" || r.predicted_class === filterClass
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
            Batch CSV Prediction & Cohort Screening
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload institutional student cohorts or clinical datasets to screen large populations simultaneously.
          </p>
        </div>

        <button
          onClick={downloadSampleTemplate}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-navy-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Sample CSV Template</span>
        </button>
      </div>

      {/* Upload Box (Inspired by formulaharmony.com/import) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <div className="border-2 border-dashed border-slate-300 hover:border-navy-600 rounded-xl p-8 transition-colors bg-slate-50/50 flex flex-col items-center justify-center cursor-pointer">
            <UploadCloud className="w-12 h-12 text-navy-700 mb-3" />
            <span className="text-sm font-medium text-slate-800">
              {file ? file.name : "Select or drag & drop CSV cohort file"}
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Supports standard tabular CSV format up to 50MB
            </span>

            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="mt-4 block text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-navy-900 file:text-white hover:file:bg-navy-800 cursor-pointer"
            />
          </div>

          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-md text-left">
              {error}
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Classifying Cohort via FastAPI...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Run Batch Prediction</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results View */}
      {results && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <span className="text-xs text-slate-500 block">Total Processed</span>
              <span className="text-2xl font-mono font-bold text-slate-900">
                {results.total_processed}
              </span>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm text-center">
              <span className="text-xs text-emerald-700 block">Low Risk</span>
              <span className="text-2xl font-mono font-bold text-emerald-900">
                {results.summary.Low || 0}
              </span>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm text-center">
              <span className="text-xs text-amber-700 block">Moderate Risk</span>
              <span className="text-2xl font-mono font-bold text-amber-900">
                {results.summary.Medium || 0}
              </span>
            </div>

            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 shadow-sm text-center">
              <span className="text-xs text-rose-700 block">High Risk</span>
              <span className="text-2xl font-mono font-bold text-rose-900">
                {results.summary.High || 0}
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-700">Filter by Classification:</span>
                {["All", "Low", "Medium", "High"].map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setFilterClass(cls)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                      filterClass === cls
                        ? "bg-navy-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>

              <button
                onClick={downloadResultsCSV}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-md shadow-2xs transition-colors self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Classified CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-[460px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-medium sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Row #</th>
                    <th className="py-2.5 px-4">Predicted Risk</th>
                    <th className="py-2.5 px-4">Confidence</th>
                    <th className="py-2.5 px-4">Model Consensus</th>
                    <th className="py-2.5 px-4">Top Feature Driver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                  {filteredItems.map((r) => {
                    const badgeClass =
                      r.predicted_class === "High"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : r.predicted_class === "Medium"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200";

                    return (
                      <tr key={r.row_index} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-slate-500">{r.row_index}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-sans font-bold border ${badgeClass}`}>
                            {r.predicted_class}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">
                          {(r.recommended_confidence * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 text-[11px]">{r.model_consensus}</td>
                        <td className="py-2.5 px-4 text-navy-900 font-sans font-medium">{r.top_driver}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
