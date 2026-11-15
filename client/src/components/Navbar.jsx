import React, { useState, useEffect } from "react";
import { Activity, BarChart3, UploadCloud, History, BookOpen, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import axios from "axios";

export default function Navbar({ activeTab, setActiveTab, onOpenAbout }) {
  const [health, setHealth] = useState({ status: "checking" });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get("/api/health");
        setHealth(res.data);
      } catch (e) {
        setHealth({ status: "offline" });
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: "predict", label: "Risk Assessment", icon: Activity },
    { id: "insights", label: "Model Insights", icon: BarChart3 },
    { id: "batch", label: "Batch CSV Import", icon: UploadCloud },
    { id: "history", label: "History Log", icon: History }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Paper Citation Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("predict")}>
            <div className="w-10 h-10 rounded-lg bg-navy-900 text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              Ψ
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  Teen Addiction Predictor
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono bg-navy-50 text-navy-800 border border-navy-200 rounded">
                  v2.0
                </span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-navy-800 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Research Paper Context Button */}
            <button
              onClick={onOpenAbout}
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-navy-700 bg-navy-50 border border-navy-200 rounded-md hover:bg-navy-100 transition-colors"
              title="Reference Paper & Methodology"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Study Context</span>
            </button>
          </nav>

          {/* Microservice Live Status Indicator */}
          <div className="hidden xl:flex items-center space-x-2 pl-3 border-l border-slate-200 text-xs">
            {health.status === "ok" ? (
              <span className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>FastAPI + Express Live</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Checking Services</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
