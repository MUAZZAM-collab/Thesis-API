import React from "react";
import ModelComparisonChart from "../components/ModelComparisonChart.jsx";
import ShapChart from "../components/ShapChart.jsx";
import { BookOpen, HelpCircle } from "lucide-react";

export default function Insights() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">
          Empirical Model Comparison & Global Explainability
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Detailed benchmarks comparing Decision Tree, Logistic Regression, and Random Forest on Stratified 5-Fold Cross-Validation, accompanied by global SHAP attributions.
        </p>
      </div>

      {/* Model Benchmark Section */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-5 bg-navy-800 rounded-full"></span>
          <h2 className="text-lg font-serif font-bold text-slate-900">
            1. Comparative Performance Benchmarks
          </h2>
        </div>
        <ModelComparisonChart />
      </section>

      {/* Global SHAP Section */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-5 bg-navy-800 rounded-full"></span>
          <h2 className="text-lg font-serif font-bold text-slate-900">
            2. Global Feature Importance (SHAP)
          </h2>
        </div>
        <ShapChart />
      </section>

      {/* Academic Methodology Callout */}
      <div className="p-5 bg-navy-50/50 rounded-xl border border-navy-100 text-xs text-navy-900 space-y-2">
        <div className="font-semibold flex items-center space-x-1.5">
          <BookOpen className="w-4 h-4 text-navy-700" />
          <span>Evaluation Methodology</span>
        </div>
        <p className="leading-relaxed text-slate-600">
          Following recommended practices from the reference study, all models were tuned using Stratified Cross-Validation to guarantee equal representation across minority and majority classes. Class weights were balanced across Logistic Regression and Random Forest. Model explainability was verified using TreeExplainer and LinearExplainer to provide actionable fidelity for educators and parents.
        </p>
      </div>
    </div>
  );
}
