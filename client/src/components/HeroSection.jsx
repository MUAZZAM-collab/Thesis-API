import React from "react";
import {
  Activity,
  BarChart3,
  UploadCloud,
  ArrowRight,
  ShieldCheck,
  BookOpen
} from "lucide-react";

export default function HeroSection({ activeTab, setActiveTab, onOpenAbout }) {
  const sections = [
    {
      id: "predict",
      title: "Risk Assessment",
      subtitle: "Interactive Behavioral Screening",
      desc: "Input 21 behavioral & demographic indicators for instant Tri-Tier Risk (Low / Medium / High) and local SHAP factor breakdown.",
      icon: Activity,
      color: "from-blue-600 to-indigo-600",
      accent: "text-blue-400",
      border: "border-blue-500/30",
      hoverBg: "hover:border-blue-400/60"
    },
    {
      id: "insights",
      title: "Model Insights",
      subtitle: "Comparative Research Benchmarks",
      desc: "Examine ROC-AUC (0.999), 5-Fold Stratified CV tables, multi-metric radar charts, and global SHAP feature importance.",
      icon: BarChart3,
      color: "from-teal-600 to-emerald-600",
      accent: "text-emerald-400",
      border: "border-teal-500/30",
      hoverBg: "hover:border-teal-400/60"
    },
    {
      id: "batch",
      title: "Batch CSV Import",
      subtitle: "Institutional Population Screening",
      desc: "Upload classroom or clinical cohort CSV files to classify hundreds of participant records simultaneously with exportable reports.",
      icon: UploadCloud,
      color: "from-amber-600 to-orange-600",
      accent: "text-amber-400",
      border: "border-amber-500/30",
      hoverBg: "hover:border-amber-400/60"
    }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0a192f] via-[#0d2240] to-[#122b52] text-white border-b border-navy-700/60 pt-12 pb-14 px-4 sm:px-6 lg:px-8">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* 1. Psi Emblem Badge */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-600/30 border border-indigo-400/30 backdrop-blur-md flex items-center justify-center shadow-lg shadow-indigo-950/50 mb-3.5 transition-transform hover:scale-105">
          <span className="font-serif font-black text-3xl text-amber-300 drop-shadow-[0_2px_10px_rgba(251,191,36,0.35)] leading-none">
            Ψ
          </span>
        </div>

        {/* 2. Main Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
          Teen Addiction Predictor
        </h1>

        {/* 3. Microservice Version Pill */}
        <div className="mt-3 inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-medium shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>v2.0 ML Microservice</span>
        </div>

        {/* 4. Unified Algorithm Subheading Bar */}
        <div className="mt-4 px-4 sm:px-6 py-2 rounded-xl bg-white/[0.08] border border-white/15 backdrop-blur-md text-xs sm:text-sm text-slate-200 font-mono tracking-wide flex flex-wrap items-center justify-center gap-2 sm:gap-3 shadow-sm max-w-2xl">
          <span className="text-white font-medium">Decision Tree</span>
          <span className="text-slate-400 font-bold">•</span>
          <span className="text-white font-medium">Logistic Regression</span>
          <span className="text-slate-400 font-bold">•</span>
          <span className="text-white font-medium">Random Forest</span>
          <span className="text-amber-300 font-bold bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded text-[11px] sm:text-xs">
            (SHAP Explainable)
          </span>
        </div>

        {/* Clinical / Research Description */}
        <p className="mt-4 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Production-grade machine learning platform delivering multi-model risk classification (Low / Medium / High), local SHAP attribution vectors, and evidence-based guidance for early risk identification.
        </p>

        {/* Live Empirical Stats Strip */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-2 px-5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-xs text-slate-300">
          <div className="flex items-center space-x-1.5">
            <span className="text-emerald-400 font-bold font-mono text-sm">98.0%</span>
            <span className="text-slate-400">Accuracy (LR)</span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-cyan-400 font-bold font-mono text-sm">0.999</span>
            <span className="text-slate-400">ROC-AUC</span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-indigo-300 font-bold font-mono text-sm">3,000</span>
            <span className="text-slate-400">Records</span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-amber-300 font-bold font-mono text-sm">&lt;85ms</span>
            <span className="text-slate-400">Inference</span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <button
            onClick={onOpenAbout}
            className="flex items-center space-x-1 text-slate-300 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
            <span>Study Reference</span>
          </button>
        </div>

        {/* Three Aligned Interactive Action Cards */}
        <div className="mt-9 w-full grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 text-left">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeTab === sec.id;

            return (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveTab(sec.id);
                  const el = document.getElementById("main-content-anchor");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className={`group relative p-5 rounded-xl text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  isActive
                    ? "bg-white/15 border-2 border-white/40 shadow-xl shadow-black/20 ring-2 ring-white/20 translate-y-[-2px]"
                    : `bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 ${sec.hoverBg} hover:shadow-lg`
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${sec.color} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isActive ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-navy-950 px-2 py-0.5 rounded-full shadow-xs">
                        Active View
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 group-hover:text-white flex items-center space-x-1 transition-colors">
                        <span>Launch</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-white text-base sm:text-lg group-hover:text-amber-200 transition-colors">
                    {sec.title}
                  </h3>
                  <span className={`text-[11px] font-medium block mt-0.5 ${sec.accent}`}>
                    {sec.subtitle}
                  </span>

                  <p className="mt-2 text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {sec.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 group-hover:text-slate-200">
                    {sec.id === "predict" && "21 Clinical Indicators"}
                    {sec.id === "insights" && "DT • LR • RF Matrices"}
                    {sec.id === "batch" && "CSV Import / Export"}
                  </span>
                  <span className={`font-semibold ${isActive ? "text-white" : "text-slate-300"}`}>
                    {isActive ? "Viewing Now" : "Switch Tab →"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
