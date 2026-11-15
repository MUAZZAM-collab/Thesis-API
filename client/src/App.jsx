import React, { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import HeroSection from "./components/HeroSection.jsx";
import Predict from "./pages/Predict.jsx";
import Insights from "./pages/Insights.jsx";
import BatchPredict from "./pages/BatchPredict.jsx";
import History from "./pages/History.jsx";
import ResearchPaperModal from "./components/ResearchPaperModal.jsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("predict");
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-slate-800 font-sans selection:bg-navy-200">
      {/* Sticky Academic Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Hero Section */}
      <HeroSection
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Scroll Anchor */}
      <div id="main-content-anchor" className="scroll-mt-20"></div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === "predict" && <Predict />}
        {activeTab === "insights" && <Insights />}
        {activeTab === "batch" && <BatchPredict />}
        {activeTab === "history" && <History />}
      </main>

      {/* Research Paper Citation Modal */}
      <ResearchPaperModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Academic Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-serif font-bold text-slate-700 flex items-center justify-center sm:justify-start space-x-2">
              <span className="font-serif text-amber-600 font-bold">Ψ</span>
              <span>Teen Smartphone Addiction Risk Prediction System</span>
            </p>
            <p>
              Reference Paper: “Teen Smartphone Addiction Level Prediction Using Machine Learning Models: A Comparative Study”
            </p>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-400">
            <span>FastAPI (Port 8000)</span>
            <span>•</span>
            <span>Node/Express (Port 5000)</span>
            <span>•</span>
            <span>React Vite (Port 5173)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
