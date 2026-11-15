import React from "react";
import { X, BookOpen, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ResearchPaperModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-navy-800" />
            <h3 className="font-serif font-bold text-slate-900 text-base">
              Reference Study & Methodology Context
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-700 leading-relaxed font-sans">
          {/* Reference Paper Citation */}
          <div className="p-4 bg-navy-50 rounded-lg border border-navy-200 text-navy-950 font-serif">
            <span className="text-[10px] uppercase font-bold text-navy-700 block mb-1">
              Primary Reference Literature
            </span>
            <p className="font-bold text-sm">
              “Teen Smartphone Addiction Level Prediction Using Machine Learning Models: A Comparative Study”
            </p>
            <p className="text-xs text-navy-800 mt-1 italic">
              Comparative Analysis of Decision Tree, Random Forest, and Logistic Regression with Model Explainability.
            </p>
          </div>

          <div>
            <h4 className="font-serif font-bold text-slate-900 text-sm mb-1.5">
              1. Theoretical Rationale & Early Intervention
            </h4>
            <p>
              Smartphone addiction among adolescents has been shown to induce circadian sleep disruption, academic decline, and heightened anxiety. Rather than relying on late-stage symptomatic evaluations, machine learning enables preemptive identification of behavioral risk patterns.
            </p>
          </div>

          <div>
            <h4 className="font-serif font-bold text-slate-900 text-sm mb-1.5">
              2. Target Discretization & Class Balance
            </h4>
            <p>
              The continuous addiction score (1–10) is partitioned into three clinical risk tiers:
            </p>
            <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-600">
              <li><strong className="text-slate-800">Low Risk (Score ≤ 4):</strong> Balanced, healthy usage with intact sleep and academic functioning.</li>
              <li><strong className="text-slate-800">Moderate Risk (Score 4–7):</strong> Developing reliance, bedtime browsing, or mild anxiety.</li>
              <li><strong className="text-slate-800">High Risk (Score &gt; 7):</strong> Compulsive checking, severe sleep deprivation, social withdrawal.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-bold text-slate-900 text-sm mb-1.5">
              3. The Role of SHAP (SHapley Additive exPlanations)
            </h4>
            <p>
              Machine learning models cannot be "black boxes" in adolescent wellness. SHAP computes the exact marginal contribution of each lifestyle and psychological variable toward the predicted risk, empowering parents and school counselors to implement tailored behavioral interventions instead of blanket phone bans.
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
            <div className="text-[11px] leading-normal">
              <strong>Ethical Notice:</strong> This prediction system is designed as an educational and preventive screening aid. It is intended to support constructive dialogue between teens, parents, and educators.
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
