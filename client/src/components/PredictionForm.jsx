import React, { useState } from "react";
import { Sparkles, Sliders, Clock, Moon, ShieldAlert, Award, Heart, HelpCircle, RefreshCw } from "lucide-react";

export const DEFAULT_INPUTS = {
  Age: 16,
  Gender: "Female",
  Location: "Urban",
  School_Grade: "10th",
  Daily_Usage_Hours: 5.5,
  Sleep_Hours: 6.5,
  Academic_Performance: 78,
  Social_Interactions: 5,
  Exercise_Hours: 1.0,
  Anxiety_Level: 5,
  Depression_Level: 4,
  Self_Esteem: 6,
  Parental_Control: 0,
  Screen_Time_Before_Bed: 1.5,
  Phone_Checks_Per_Day: 85,
  Apps_Used_Daily: 12,
  Time_on_Social_Media: 2.5,
  Time_on_Gaming: 1.0,
  Time_on_Education: 1.0,
  Phone_Usage_Purpose: "Social Media",
  Family_Communication: 6,
  Weekend_Usage_Hours: 7.0
};

export const PRESET_PROFILES = {
  highRisk: {
    label: "High Addiction Risk",
    desc: "Late-night screen use, 8h+ usage, sleep deficit",
    data: {
      Age: 16,
      Gender: "Female",
      Location: "Metro Area",
      School_Grade: "10th",
      Daily_Usage_Hours: 8.5,
      Sleep_Hours: 4.5,
      Academic_Performance: 62,
      Social_Interactions: 3,
      Exercise_Hours: 0.2,
      Anxiety_Level: 9,
      Depression_Level: 8,
      Self_Esteem: 3,
      Parental_Control: 0,
      Screen_Time_Before_Bed: 3.0,
      Phone_Checks_Per_Day: 160,
      Apps_Used_Daily: 24,
      Time_on_Social_Media: 4.8,
      Time_on_Gaming: 2.5,
      Time_on_Education: 0.5,
      Phone_Usage_Purpose: "Social Media",
      Family_Communication: 3,
      Weekend_Usage_Hours: 10.5
    }
  },
  balanced: {
    label: "Healthy Balanced",
    desc: "8.5h sleep, active exercise, strong communication",
    data: {
      Age: 15,
      Gender: "Male",
      Location: "Suburban",
      School_Grade: "9th",
      Daily_Usage_Hours: 2.0,
      Sleep_Hours: 8.5,
      Academic_Performance: 91,
      Social_Interactions: 8,
      Exercise_Hours: 2.0,
      Anxiety_Level: 2,
      Depression_Level: 1,
      Self_Esteem: 9,
      Parental_Control: 1,
      Screen_Time_Before_Bed: 0.3,
      Phone_Checks_Per_Day: 25,
      Apps_Used_Daily: 6,
      Time_on_Social_Media: 0.6,
      Time_on_Gaming: 0.4,
      Time_on_Education: 1.2,
      Phone_Usage_Purpose: "Education",
      Family_Communication: 9,
      Weekend_Usage_Hours: 2.5
    }
  },
  moderate: {
    label: "Moderate Academic",
    desc: "Educational focus, balanced leisure habits",
    data: {
      Age: 17,
      Gender: "Other",
      Location: "Central",
      School_Grade: "11th",
      Daily_Usage_Hours: 4.2,
      Sleep_Hours: 7.0,
      Academic_Performance: 83,
      Social_Interactions: 6,
      Exercise_Hours: 1.2,
      Anxiety_Level: 4,
      Depression_Level: 3,
      Self_Esteem: 7,
      Parental_Control: 0,
      Screen_Time_Before_Bed: 1.0,
      Phone_Checks_Per_Day: 60,
      Apps_Used_Daily: 10,
      Time_on_Social_Media: 1.5,
      Time_on_Gaming: 0.8,
      Time_on_Education: 1.8,
      Phone_Usage_Purpose: "Education",
      Family_Communication: 7,
      Weekend_Usage_Hours: 5.5
    }
  }
};

export default function PredictionForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState(DEFAULT_INPUTS);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const applyPreset = (key) => {
    if (PRESET_PROFILES[key]) {
      setFormData(PRESET_PROFILES[key].data);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_INPUTS);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-7">
      {/* Header and Preset Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center space-x-2">
            <span>Participant Assessment Input</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Provide behavioral, psychological, and demographic indicators for ML multi-model risk classification.
          </p>
        </div>

        {/* Persona Presets */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
          <span className="text-[11px] font-medium text-slate-500 px-1 flex items-center">
            <Sparkles className="w-3 h-3 mr-1 text-navy-600" /> Presets:
          </span>
          {Object.entries(PRESET_PROFILES).map(([k, p]) => (
            <button
              key={k}
              type="button"
              onClick={() => applyPreset(k)}
              className="text-xs px-2.5 py-1 rounded bg-white hover:bg-navy-50 text-slate-700 hover:text-navy-900 border border-slate-200 transition-colors shadow-2xs font-medium"
              title={p.desc}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleReset}
            className="text-xs p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
            title="Reset to default"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-7">
        {/* SECTION 1: Phone Usage Patterns */}
        <div>
          <div className="flex items-center space-x-2 text-navy-900 font-serif font-semibold text-sm mb-3">
            <Clock className="w-4 h-4 text-navy-700" />
            <span>1. Smartphone Usage Patterns</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Daily Usage Hours */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
                <label>Daily Usage (Hours)</label>
                <span className="font-mono text-navy-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {formData.Daily_Usage_Hours} h
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="16"
                step="0.5"
                value={formData.Daily_Usage_Hours}
                onChange={(e) => handleChange("Daily_Usage_Hours", parseFloat(e.target.value))}
                className="w-full accent-navy-700"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0h</span>
                <span>8h (avg)</span>
                <span>16h</span>
              </div>
            </div>

            {/* Screen Time Before Bed */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
                <label>Screen Time Before Bed</label>
                <span className="font-mono text-navy-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {formData.Screen_Time_Before_Bed} h
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={formData.Screen_Time_Before_Bed}
                onChange={(e) => handleChange("Screen_Time_Before_Bed", parseFloat(e.target.value))}
                className="w-full accent-navy-700"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0h (no bedtime screen)</span>
                <span>5h</span>
              </div>
            </div>

            {/* Weekend Usage Hours */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
                <label>Weekend Daily Usage</label>
                <span className="font-mono text-navy-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {formData.Weekend_Usage_Hours} h
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="18"
                step="0.5"
                value={formData.Weekend_Usage_Hours}
                onChange={(e) => handleChange("Weekend_Usage_Hours", parseFloat(e.target.value))}
                className="w-full accent-navy-700"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0h</span>
                <span>9h</span>
                <span>18h</span>
              </div>
            </div>

            {/* Phone Checks Per Day */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Phone Checks / Unlocks Daily
              </label>
              <input
                type="number"
                min="0"
                max="500"
                value={formData.Phone_Checks_Per_Day}
                onChange={(e) => handleChange("Phone_Checks_Per_Day", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>

            {/* Apps Used Daily */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Distinct Apps Used Daily
              </label>
              <input
                type="number"
                min="1"
                max="80"
                value={formData.Apps_Used_Daily}
                onChange={(e) => handleChange("Apps_Used_Daily", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>

            {/* Primary Usage Purpose */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Primary Phone Usage Purpose
              </label>
              <select
                value={formData.Phone_Usage_Purpose}
                onChange={(e) => handleChange("Phone_Usage_Purpose", e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
              >
                <option value="Social Media">Social Media</option>
                <option value="Gaming">Gaming</option>
                <option value="Browsing">Browsing / Entertainment</option>
                <option value="Education">Education & Learning</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: App Breakdown */}
        <div>
          <div className="flex items-center space-x-2 text-navy-900 font-serif font-semibold text-sm mb-3">
            <Sliders className="w-4 h-4 text-navy-700" />
            <span>2. Time Breakdown by Category</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Time on Social Media (Hours)</label>
              <input
                type="number"
                min="0"
                max="16"
                step="0.1"
                value={formData.Time_on_Social_Media}
                onChange={(e) => handleChange("Time_on_Social_Media", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Time on Gaming (Hours)</label>
              <input
                type="number"
                min="0"
                max="16"
                step="0.1"
                value={formData.Time_on_Gaming}
                onChange={(e) => handleChange("Time_on_Gaming", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Time on Education (Hours)</label>
              <input
                type="number"
                min="0"
                max="16"
                step="0.1"
                value={formData.Time_on_Education}
                onChange={(e) => handleChange("Time_on_Education", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Lifestyle & Wellness */}
        <div>
          <div className="flex items-center space-x-2 text-navy-900 font-serif font-semibold text-sm mb-3">
            <Moon className="w-4 h-4 text-navy-700" />
            <span>3. Lifestyle & Sleep Wellness</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Sleep Hours */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
                <label>Nightly Sleep (Hours)</label>
                <span className="font-mono text-navy-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {formData.Sleep_Hours} h
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                step="0.5"
                value={formData.Sleep_Hours}
                onChange={(e) => handleChange("Sleep_Hours", parseFloat(e.target.value))}
                className="w-full accent-navy-700"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>3h (Deprived)</span>
                <span>8h (Ideal)</span>
                <span>12h</span>
              </div>
            </div>

            {/* Exercise Hours */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Physical Exercise (Hours/Day)</label>
              <input
                type="number"
                min="0"
                max="8"
                step="0.2"
                value={formData.Exercise_Hours}
                onChange={(e) => handleChange("Exercise_Hours", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>

            {/* Offline Social Interactions */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">In-Person Social Interactions (0-10)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.Social_Interactions}
                onChange={(e) => handleChange("Social_Interactions", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Mental Health & Well-being */}
        <div>
          <div className="flex items-center space-x-2 text-navy-900 font-serif font-semibold text-sm mb-3">
            <Heart className="w-4 h-4 text-navy-700" />
            <span>4. Psychological & Well-being Indicators (0 - 10 Scale)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Anxiety Level (0-10)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.Anxiety_Level}
                onChange={(e) => handleChange("Anxiety_Level", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Depression Level (0-10)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.Depression_Level}
                onChange={(e) => handleChange("Depression_Level", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Self-Esteem Score (0-10)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.Self_Esteem}
                onChange={(e) => handleChange("Self_Esteem", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: Academic & Family */}
        <div>
          <div className="flex items-center space-x-2 text-navy-900 font-serif font-semibold text-sm mb-3">
            <Award className="w-4 h-4 text-navy-700" />
            <span>5. Academic & Family Dynamics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Academic Performance (% Grade)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.Academic_Performance}
                onChange={(e) => handleChange("Academic_Performance", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Parental Control Guardrails</label>
              <select
                value={formData.Parental_Control}
                onChange={(e) => handleChange("Parental_Control", parseInt(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
              >
                <option value={0}>0 - No Parental Controls</option>
                <option value={1}>1 - Active Controls / Screen Limits</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Family Communication Quality (0-10)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.Family_Communication}
                onChange={(e) => handleChange("Family_Communication", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 6: Demographics */}
        <div>
          <div className="flex items-center space-x-2 text-navy-900 font-serif font-semibold text-sm mb-3">
            <HelpCircle className="w-4 h-4 text-navy-700" />
            <span>6. Demographic Context</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Age</label>
              <input
                type="number"
                min="10"
                max="25"
                value={formData.Age}
                onChange={(e) => handleChange("Age", parseInt(e.target.value) || 16)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
              <select
                value={formData.Gender}
                onChange={(e) => handleChange("Gender", e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">School Grade</label>
              <select
                value={formData.School_Grade}
                onChange={(e) => handleChange("School_Grade", e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
              >
                <option value="7th">7th Grade</option>
                <option value="8th">8th Grade</option>
                <option value="9th">9th Grade</option>
                <option value="10th">10th Grade</option>
                <option value="11th">11th Grade</option>
                <option value="12th">12th Grade</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Location / Setting</label>
              <input
                type="text"
                value={formData.Location}
                onChange={(e) => handleChange("Location", e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-navy-600 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          Runs real-time inference on Decision Tree, Logistic Regression & Random Forest via FastAPI.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Evaluating Models & SHAP...</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4" />
              <span>Predict Addiction Risk</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
