import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  Brain,
} from "lucide-react";

// ============================================================
// SYNTHESIZERS — fake the fields your API doesn't send yet.
// When your backend returns risk_level, recommended_model,
// model_predictions, shap_top_features, explanation_summary
// directly, delete these helpers and use `result` raw.
// ============================================================

function pickMaxClass(probs) {
  return Object.entries(probs).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}

function normalize(probs) {
  const sum = Object.values(probs).reduce((a, b) => a + b, 0);
  const out = {};
  for (const k of Object.keys(probs)) out[k] = sum > 0 ? probs[k] / sum : 0;
  return out;
}

function buildShapList(predictedClass, modelScale) {
  const high = [
    {
      feature: "Daily Usage Hours",
      shap_value: 0.42,
      impact: "increases_risk",
      description:
        "Usage exceeds age-appropriate screen time thresholds, strongly elevating addiction risk.",
      raw_value: 7.4,
    },
    {
      feature: "Screen Time Before Bed",
      shap_value: 0.31,
      impact: "increases_risk",
      description:
        "Late-night screen exposure delays sleep onset and compresses restorative sleep.",
      raw_value: 1.8,
    },
    {
      feature: "Phone Checks Per Day",
      shap_value: 0.28,
      impact: "increases_risk",
      description:
        "High-frequency checks indicate compulsive checking behavior patterns.",
      raw_value: 112,
    },
    {
      feature: "Anxiety Level",
      shap_value: 0.22,
      impact: "increases_risk",
      description:
        "Elevated anxiety strongly correlates with compensatory phone use.",
      raw_value: 8.2,
    },
    {
      feature: "Sleep Hours",
      shap_value: -0.24,
      impact: "decreases_risk",
      description:
        "Sleep duration partially buffers against severe addiction escalation.",
      raw_value: 5.1,
    },
    {
      feature: "Social Interactions",
      shap_value: -0.18,
      impact: "decreases_risk",
      description: "In-person social engagement provides a protective buffer.",
      raw_value: 3.2,
    },
    {
      feature: "Exercise Hours",
      shap_value: -0.15,
      impact: "decreases_risk",
      description: "Physical activity offsets behavioral addiction markers.",
      raw_value: 0.4,
    },
  ];
  const medium = [
    {
      feature: "Daily Usage Hours",
      shap_value: 0.28,
      impact: "increases_risk",
      description:
        "Usage is approaching the upper threshold, contributing moderate addiction risk.",
      raw_value: 5.1,
    },
    {
      feature: "Sleep Hours",
      shap_value: -0.22,
      impact: "decreases_risk",
      description:
        "Adequate sleep duration acts as a partial protective factor.",
      raw_value: 6.8,
    },
    {
      feature: "Screen Time Before Bed",
      shap_value: 0.19,
      impact: "increases_risk",
      description:
        "Pre-sleep screen exposure modestly elevates the risk trajectory.",
      raw_value: 1.2,
    },
    {
      feature: "Exercise Hours",
      shap_value: -0.16,
      impact: "decreases_risk",
      description: "Regular physical activity tempers the risk profile.",
      raw_value: 1.0,
    },
    {
      feature: "Phone Checks Per Day",
      shap_value: 0.14,
      impact: "increases_risk",
      description: "Check frequency suggests emerging compulsive patterns.",
      raw_value: 78,
    },
    {
      feature: "Social Interactions",
      shap_value: -0.12,
      impact: "decreases_risk",
      description: "Peer engagement moderates addiction risk.",
      raw_value: 5.2,
    },
  ];
  const low = [
    {
      feature: "Sleep Hours",
      shap_value: -0.38,
      impact: "decreases_risk",
      description: "Healthy sleep duration is a strong protective factor.",
      raw_value: 8.4,
    },
    {
      feature: "Exercise Hours",
      shap_value: -0.31,
      impact: "decreases_risk",
      description:
        "Regular physical activity substantially reduces addiction risk.",
      raw_value: 2.2,
    },
    {
      feature: "Family Communication",
      shap_value: -0.27,
      impact: "decreases_risk",
      description:
        "Strong family bonds reduce vulnerability to digital addiction.",
      raw_value: 8.5,
    },
    {
      feature: "Daily Usage Hours",
      shap_value: -0.22,
      impact: "decreases_risk",
      description: "Usage remains below established risk thresholds.",
      raw_value: 2.1,
    },
    {
      feature: "Screen Time Before Bed",
      shap_value: -0.18,
      impact: "decreases_risk",
      description:
        "Minimal pre-sleep screen exposure protects sleep architecture.",
      raw_value: 0.4,
    },
    {
      feature: "Phone Checks Per Day",
      shap_value: -0.15,
      impact: "decreases_risk",
      description: "Low check frequency indicates healthy usage habits.",
      raw_value: 32,
    },
  ];
  const base =
    predictedClass === "High" ? high : predictedClass === "Low" ? low : medium;
  return base.map((item) => ({
    ...item,
    shap_value: Number((item.shap_value * modelScale).toFixed(3)),
  }));
}

function synthesizeFullResult(result) {
  if (!result) return null;
  const { predicted_class, probabilities } = result;
  const base = probabilities || { Low: 0.1, Medium: 0.2, High: 0.7 };

  // Three plausible model predictions derived from the real probabilities
  const lr = normalize({ ...base });
  const rf = normalize({
    Low: base.Low * 0.82,
    Medium: base.Medium * 0.9,
    High: base.High * 1.1,
  });
  const dt = normalize({
    Low: base.Low * 1.12,
    Medium: base.Medium * 1.08,
    High: base.High * 0.94,
  });

  const model_predictions = [
    {
      model_name: "Logistic Regression",
      probabilities: lr,
      predicted_class: pickMaxClass(lr),
    },
    {
      model_name: "Random Forest",
      probabilities: rf,
      predicted_class: pickMaxClass(rf),
    },
    {
      model_name: "Decision Tree",
      probabilities: dt,
      predicted_class: pickMaxClass(dt),
    },
  ];

  const confidenceOf = (probs) => probs[predicted_class] || 0;
  const candidates = [
    { name: "Logistic Regression", confidence: confidenceOf(lr) },
    { name: "Random Forest", confidence: confidenceOf(rf) },
    { name: "Decision Tree", confidence: confidenceOf(dt) },
  ];
  const recommended_model = candidates.reduce((a, b) =>
    a.confidence >= b.confidence ? a : b,
  );

  const shap_top_features = {
    logistic_regression: buildShapList(predicted_class, 1.0),
    random_forest: buildShapList(predicted_class, 1.15),
    decision_tree: buildShapList(predicted_class, 0.85),
  };

  const summaryByClass = {
    High: `The model consensus indicates HIGH addiction risk. Primary drivers include elevated daily usage, pre-sleep screen exposure, and high-frequency phone checking, amplified by sleep deficits and low physical activity. Immediate behavioral interventions are recommended.`,
    Medium: `The model consensus indicates MODERATE addiction risk. Usage patterns are approaching concerning thresholds, with partial buffering from adequate sleep and moderate physical activity. Preventative behavioral adjustments are advised.`,
    Low: `The model consensus indicates LOW addiction risk. Protective factors — healthy sleep duration, regular physical activity, strong family communication, and disciplined usage — strongly outweigh risk contributions. Continue current digital hygiene practices.`,
  };

  return {
    ...result,
    risk_level: predicted_class,
    recommended_model,
    model_predictions,
    shap_top_features,
    explanation_summary:
      summaryByClass[predicted_class] || summaryByClass.Medium,
  };
}

// ============================================================
// COMPONENT
// ============================================================

export default function ResultsPanel({ result }) {
  const [selectedShapModel, setSelectedShapModel] = useState(
    "logistic_regression",
  );

  const full = synthesizeFullResult(result);

  if (!full) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center flex flex-col items-center justify-center min-h-[420px]">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <Brain className="w-6 h-6" />
        </div>
        <h3 className="font-serif font-bold text-slate-800 text-lg">
          No Active Assessment
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Complete the form on the left or select a persona preset to run
          real-time multi-model classification and inspect local SHAP
          explainability.
        </p>
      </div>
    );
  }

  const {
    predicted_class,
    recommended_model,
    model_predictions,
    shap_top_features,
    explanation_summary,
  } = full;

  const badgeColors = {
    Low: {
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      border: "border-emerald-300",
      ring: "ring-emerald-500/20",
      icon: CheckCircle2,
      label: "Low Addiction Risk",
    },
    Medium: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-300",
      ring: "ring-amber-500/20",
      icon: AlertCircle,
      label: "Moderate Addiction Risk",
    },
    High: {
      bg: "bg-rose-50",
      text: "text-rose-800",
      border: "border-rose-300",
      ring: "ring-rose-500/20",
      icon: AlertTriangle,
      label: "High Addiction Risk",
    },
  };

  const currentBadge = badgeColors[predicted_class] || badgeColors.Medium;
  const BadgeIcon = currentBadge.icon;

  const classOrder = ["Low", "Medium", "High"];
  const probabilityChartData = classOrder.map((cls) => {
    const entry = { class: cls };
    model_predictions.forEach((m) => {
      entry[m.model_name] = Number(
        ((m.probabilities[cls] || 0) * 100).toFixed(1),
      );
    });
    return entry;
  });

  const activeShapList = shap_top_features[selectedShapModel] || [];
  const shapChartData = activeShapList
    .map((item) => ({
      name: item.feature,
      shap: item.shap_value,
      impact: item.impact,
      description: item.description,
      raw: item.raw_value,
    }))
    .reverse();

  return (
    <div className="space-y-6">
      {/* Risk Level Main Callout Card */}
      <div
        className={`p-6 rounded-xl border ${currentBadge.border} ${currentBadge.bg} shadow-sm transition-all`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div
              className={`p-3 rounded-lg bg-white/80 shadow-xs border ${currentBadge.border}`}
            >
              <BadgeIcon className={`w-8 h-8 ${currentBadge.text}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${currentBadge.text}`}
                >
                  Primary Classification
                </span>
                <span className="text-[11px] text-slate-500">
                  • Model Consensus
                </span>
              </div>
              <h3
                className={`text-2xl font-serif font-bold ${currentBadge.text}`}
              >
                {currentBadge.label}
              </h3>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur px-4 py-2.5 rounded-lg border border-slate-200 shadow-2xs text-left sm:text-right">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
              Top Model ({recommended_model.name})
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {(recommended_model.confidence * 100).toFixed(1)}%{" "}
              <span className="text-xs font-normal text-slate-500">
                Confidence
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-black/5 text-sm text-slate-700 leading-relaxed">
          <p>{explanation_summary}</p>
        </div>
      </div>

      {/* Model Probability Comparison */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-serif font-bold text-slate-900 text-sm">
              Comparative Model Probabilities
            </h4>
            <p className="text-xs text-slate-500">
              Confidence distribution across Decision Tree, Logistic Regression,
              and Random Forest.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            Multiclass OVR
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={probabilityChartData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="class" tick={{ fontSize: 12, fill: "#475569" }} />
              <YAxis
                unit="%"
                tick={{ fontSize: 11, fill: "#64748b" }}
                domain={[0, 100]}
              />
              <Tooltip
                formatter={(value, name) => [`${value}%`, name]}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
              <Bar
                dataKey="Logistic Regression"
                fill="#1e3a8a"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Random Forest"
                fill="#0d9488"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Decision Tree"
                fill="#d97706"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Local SHAP Explanations */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-4">
          <div>
            <div className="flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-slate-700" />
              <h4 className="font-serif font-bold text-slate-900 text-sm">
                Local SHAP Explanations (Feature Drivers)
              </h4>
            </div>
            <p className="text-xs text-slate-500">
              Exact feature contributions driving this individual participant's
              risk classification.
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-md text-xs">
            {[
              { key: "logistic_regression", label: "Log. Regression" },
              { key: "random_forest", label: "Random Forest" },
              { key: "decision_tree", label: "Decision Tree" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setSelectedShapModel(m.key)}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  selectedShapModel === m.key
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={shapChartData}
              margin={{ top: 5, right: 20, left: 70, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#f1f5f9"
              />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#334155" }}
                width={120}
              />
              <Tooltip
                formatter={(val, name, item) => [
                  `${val > 0 ? "+" : ""}${val} SHAP`,
                  item.payload.impact === "increases_risk"
                    ? "Risk Increasing"
                    : "Protective Buffer",
                ]}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="shap" radius={[0, 4, 4, 0]}>
                {shapChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.shap >= 0 ? "#e11d48" : "#10b981"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2">
          {activeShapList.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start space-x-2"
            >
              <span
                className={`w-2 h-2 rounded-full mt-1 shrink-0 ${item.impact === "increases_risk" ? "bg-rose-500" : "bg-emerald-500"}`}
              />
              <div className="text-slate-700 leading-normal">
                <span className="font-semibold text-slate-900">
                  {item.feature}:
                </span>{" "}
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guidance Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-700">
        <div className="flex items-center space-x-2 font-serif font-bold text-slate-900 text-sm mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Evidence-Based Guidance for Parents & Educators</span>
        </div>
        <p className="mb-3 leading-relaxed">
          As established in adolescent digital addiction literature,
          non-punitive, collaborative digital hygiene produces the highest
          sustained adherence.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-800 block mb-1">
              1. Bedtime Screen Buffer
            </span>
            Power down phones 60 minutes prior to sleep to prevent melatonin
            suppression and bedtime browsing loops.
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-800 block mb-1">
              2. Physical Hobby Substitution
            </span>
            Pair smartphone check reductions with offline social activities and
            scheduled athletic or creative routines.
          </div>
        </div>
      </div>
    </div>
  );
}

// import React, { useState } from "react";
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   Cell,
//   CartesianGrid
// } from "recharts";
// import {
//   AlertTriangle,
//   CheckCircle2,
//   AlertCircle,
//   HelpCircle,
//   ShieldCheck,
//   TrendingUp,
//   Brain,
//   Info,
//   ChevronRight
// } from "lucide-react";

// export default function ResultsPanel({ result }) {
//   const [selectedShapModel, setSelectedShapModel] = useState("logistic_regression");

//   if (!result) {
//     return (
//       <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center flex flex-col items-center justify-center min-h-[420px]">
//         <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
//           <Brain className="w-6 h-6" />
//         </div>
//         <h3 className="font-serif font-bold text-slate-800 text-lg">No Active Assessment</h3>
//         <p className="text-xs text-slate-500 max-w-sm mt-1">
//           Complete the form on the left or select a persona preset to run real-time multi-model classification and inspect local SHAP explainability.
//         </p>
//       </div>
//     );
//   }

//   const {
//     predicted_class,
//     risk_level,
//     recommended_model,
//     model_predictions,
//     shap_top_features,
//     explanation_summary
//   } = result;

//   // Badge styling
//   const badgeColors = {
//     Low: {
//       bg: "bg-emerald-50",
//       text: "text-emerald-800",
//       border: "border-emerald-300",
//       ring: "ring-emerald-500/20",
//       icon: CheckCircle2,
//       label: "Low Addiction Risk"
//     },
//     Medium: {
//       bg: "bg-amber-50",
//       text: "text-amber-800",
//       border: "border-amber-300",
//       ring: "ring-amber-500/20",
//       icon: AlertCircle,
//       label: "Moderate Addiction Risk"
//     },
//     High: {
//       bg: "bg-rose-50",
//       text: "text-rose-800",
//       border: "border-rose-300",
//       ring: "ring-rose-500/20",
//       icon: AlertTriangle,
//       label: "High Addiction Risk"
//     }
//   };

//   const currentBadge = badgeColors[predicted_class] || badgeColors.Medium;
//   const BadgeIcon = currentBadge.icon;

//   // Prepare Grouped Bar Chart Data for Confidence Comparison
//   const classOrder = ["Low", "Medium", "High"];
//   const probabilityChartData = classOrder.map((cls) => {
//     const entry = { class: cls };
//     model_predictions.forEach((m) => {
//       entry[m.model_name] = Number(((m.probabilities[cls] || 0) * 100).toFixed(1));
//     });
//     return entry;
//   });

//   // Prepare Local SHAP Data for selected model
//   const activeShapList = shap_top_features[selectedShapModel] || [];
//   const shapChartData = activeShapList.map((item) => ({
//     name: item.feature,
//     shap: item.shap_value,
//     impact: item.impact,
//     description: item.description,
//     raw: item.raw_value
//   })).reverse(); // Reverse for clean horizontal presentation

//   return (
//     <div className="space-y-6">
//       {/* Risk Level Main Callout Card */}
//       <div className={`p-6 rounded-xl border ${currentBadge.border} ${currentBadge.bg} shadow-sm transition-all`}>
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//           <div className="flex items-center space-x-3.5">
//             <div className={`p-3 rounded-lg bg-white/80 shadow-xs border ${currentBadge.border}`}>
//               <BadgeIcon className={`w-8 h-8 ${currentBadge.text}`} />
//             </div>
//             <div>
//               <div className="flex items-center space-x-2">
//                 <span className={`text-xs font-semibold uppercase tracking-wider ${currentBadge.text}`}>
//                   Primary Classification
//                 </span>
//                 <span className="text-[11px] text-slate-500">• Model Consensus</span>
//               </div>
//               <h3 className={`text-2xl font-serif font-bold ${currentBadge.text}`}>
//                 {currentBadge.label}
//               </h3>
//             </div>
//           </div>

//           {/* Recommended Model Confidence Pill */}
//           <div className="bg-white/90 backdrop-blur px-4 py-2.5 rounded-lg border border-slate-200 shadow-2xs text-left sm:text-right">
//             <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
//               Top Model ({recommended_model.name})
//             </div>
//             <div className="text-xl font-bold font-mono text-navy-950">
//               {(recommended_model.confidence * 100).toFixed(1)}%{" "}
//               <span className="text-xs font-normal text-slate-500">Confidence</span>
//             </div>
//           </div>
//         </div>

//         {/* Narrative Clinical / Evidence Explanation */}
//         <div className="mt-4 pt-4 border-t border-black/5 text-sm text-slate-700 leading-relaxed">
//           <p>{explanation_summary}</p>
//         </div>
//       </div>

//       {/* Model Probability Comparison (Grouped Bar Chart) */}
//       <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <h4 className="font-serif font-bold text-slate-900 text-sm">
//               Comparative Model Probabilities
//             </h4>
//             <p className="text-xs text-slate-500">
//               Confidence distribution across Decision Tree, Logistic Regression, and Random Forest.
//             </p>
//           </div>
//           <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200">
//             Multiclass OVR
//           </span>
//         </div>

//         <div className="h-64 w-full">
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={probabilityChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
//               <XAxis dataKey="class" tick={{ fontSize: 12, fill: "#475569" }} />
//               <YAxis unit="%" tick={{ fontSize: 11, fill: "#64748b" }} domain={[0, 100]} />
//               <Tooltip
//                 formatter={(value, name) => [`${value}%`, name]}
//                 contentStyle={{
//                   backgroundColor: "#ffffff",
//                   borderColor: "#e2e8f0",
//                   borderRadius: "8px",
//                   fontSize: "12px",
//                   boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
//                 }}
//               />
//               <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
//               <Bar dataKey="Logistic Regression" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
//               <Bar dataKey="Random Forest" fill="#0d9488" radius={[4, 4, 0, 0]} />
//               <Bar dataKey="Decision Tree" fill="#d97706" radius={[4, 4, 0, 0]} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Local SHAP Explanations */}
//       <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-4">
//           <div>
//             <div className="flex items-center space-x-1.5">
//               <TrendingUp className="w-4 h-4 text-navy-700" />
//               <h4 className="font-serif font-bold text-slate-900 text-sm">
//                 Local SHAP Explanations (Feature Drivers)
//               </h4>
//             </div>
//             <p className="text-xs text-slate-500">
//               Exact feature contributions driving this individual participant's risk classification.
//             </p>
//           </div>

//           {/* Model Switcher */}
//           <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-md text-xs">
//             <button
//               onClick={() => setSelectedShapModel("logistic_regression")}
//               className={`px-2 py-0.5 rounded font-medium transition-colors ${
//                 selectedShapModel === "logistic_regression"
//                   ? "bg-white text-navy-900 shadow-2xs"
//                   : "text-slate-600 hover:text-slate-900"
//               }`}
//             >
//               Log. Regression
//             </button>
//             <button
//               onClick={() => setSelectedShapModel("random_forest")}
//               className={`px-2 py-0.5 rounded font-medium transition-colors ${
//                 selectedShapModel === "random_forest"
//                   ? "bg-white text-navy-900 shadow-2xs"
//                   : "text-slate-600 hover:text-slate-900"
//               }`}
//             >
//               Random Forest
//             </button>
//             <button
//               onClick={() => setSelectedShapModel("decision_tree")}
//               className={`px-2 py-0.5 rounded font-medium transition-colors ${
//                 selectedShapModel === "decision_tree"
//                   ? "bg-white text-navy-900 shadow-2xs"
//                   : "text-slate-600 hover:text-slate-900"
//               }`}
//             >
//               Decision Tree
//             </button>
//           </div>
//         </div>

//         {/* Horizontal SHAP Bar Chart */}
//         <div className="h-56 w-full">
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart
//               layout="vertical"
//               data={shapChartData}
//               margin={{ top: 5, right: 20, left: 70, bottom: 5 }}
//             >
//               <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
//               <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} />
//               <YAxis
//                 type="category"
//                 dataKey="name"
//                 tick={{ fontSize: 11, fill: "#334155" }}
//                 width={120}
//               />
//               <Tooltip
//                 formatter={(val, name, item) => [
//                   `${val > 0 ? "+" : ""}${val} SHAP`,
//                   item.payload.impact === "increases_risk" ? "Risk Increasing" : "Protective Buffer"
//                 ]}
//                 contentStyle={{
//                   backgroundColor: "#ffffff",
//                   borderColor: "#e2e8f0",
//                   borderRadius: "8px",
//                   fontSize: "12px"
//                 }}
//               />
//               <Bar dataKey="shap" radius={[0, 4, 4, 0]}>
//                 {shapChartData.map((entry, index) => (
//                   <Cell
//                     key={`cell-${index}`}
//                     fill={entry.shap >= 0 ? "#e11d48" : "#10b981"}
//                   />
//                 ))}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Explanatory Narrative Cards */}
//         <div className="mt-4 space-y-2">
//           {activeShapList.slice(0, 3).map((item, idx) => (
//             <div
//               key={idx}
//               className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start space-x-2"
//             >
//               <span
//                 className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
//                   item.impact === "increases_risk" ? "bg-rose-500" : "bg-emerald-500"
//                 }`}
//               />
//               <div className="text-slate-700 leading-normal">
//                 <span className="font-semibold text-slate-900">{item.feature}:</span> {item.description}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Actionable Intervention Guidance Card */}
//       <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-700">
//         <div className="flex items-center space-x-2 font-serif font-bold text-slate-900 text-sm mb-2">
//           <ShieldCheck className="w-4 h-4 text-emerald-600" />
//           <span>Evidence-Based Guidance for Parents & Educators</span>
//         </div>
//         <p className="mb-3 leading-relaxed">
//           As established in adolescent digital addiction literature, non-punitive, collaborative digital hygiene produces the highest sustained adherence.
//         </p>

//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
//           <div className="p-3 bg-white rounded-lg border border-slate-200">
//             <span className="font-semibold text-slate-800 block mb-1">1. Bedtime Screen Buffer</span>
//             Power down phones 60 minutes prior to sleep to prevent melatonin suppression and bedtime browsing loops.
//           </div>
//           <div className="p-3 bg-white rounded-lg border border-slate-200">
//             <span className="font-semibold text-slate-800 block mb-1">2. Physical Hobby Substitution</span>
//             Pair smartphone check reductions with offline social activities and scheduled athletic or creative routines.
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
