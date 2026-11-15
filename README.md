# 📱 Teen Smartphone Addiction Level Prediction System
### *Production-Ready MERN Stack with Python ML & SHAP Explainability Microservice*

[![Architecture](https://img.shields.io/badge/Architecture-MERN%20%2B%20FastAPI-blue.svg)](#architecture)
[![Python](https://img.shields.io/badge/Python-3.10%2B%20%7C%20FastAPI-green.svg)](#fastapi-ml-service)
[![Node](https://img.shields.io/badge/Node-Express%20v4-emerald.svg)](#nodeexpress-backend)
[![React](https://img.shields.io/badge/React-18%20%7C%20Vite%20%7C%20Tailwind-indigo.svg)](#react-frontend)
[![Models](https://img.shields.io/badge/Models-DT%20%7C%20LR%20%7C%20RF-purple.svg)](#machine-learning-models)

---

## 1. Project Overview

This platform provides early risk screening and evidence-based insights for adolescent smartphone addiction, as described in the reference paper:
> **“Teen Smartphone Addiction Level Prediction Using Machine Learning Models: A Comparative Study”**

A parent, educator, clinician, or teen can input behavioral, psychological, and demographic indicators and receive:
1. **Tri-Tier Risk Prediction:** `Low`, `Medium`, or `High` addiction risk.
2. **Three-Model Comparative Inference:** Simultaneous predictions and confidence probabilities from **Decision Tree (DT)**, **Logistic Regression (LR)**, and **Random Forest (RF)**.
3. **Local & Global SHAP Explainability:** TreeExplainer and LinearExplainer attributions identifying the top factors pushing risk up or providing protective buffers.
4. **Batch CSV Cohort Screening:** An institutional import interface (inspired by `formulaharmony.com/import`) allowing schools and clinics to classify cohorts in bulk and download classified reports.
5. **Auditable Prediction History:** Persistent logging backed by MongoDB with automated local resilient fallback.

---

## 2. System Architecture

```
                    ┌────────────────────────────┐
                    │     React (Vite) UI        │
                    │   http://localhost:5173    │
                    │  (Charts / Research UI)    │
                    └─────────────┬──────────────┘
                                  │ REST
                                  ▼
                    ┌────────────────────────────┐
                    │    Node / Express Proxy    │
                    │   http://localhost:5000    │
                    │  (Auth, History, Storage)  │
                    └──────┬──────────────┬──────┘
                           │              │
             MongoDB / File│              │ REST Inference
             Persistence   ▼              ▼
                    ┌────────────┐ ┌────────────────────────────┐
                    │  MongoDB   │ │    FastAPI ML Service      │
                    │  Database  │ │   http://localhost:8000    │
                    └────────────┘ │ (DT, LR, RF + SHAP Engine) │
                                   └──────────────┬─────────────┘
                                                  │ Loads
                                                  ▼
                                           ┌──────────────┐
                                           │  artifacts/  │
                                           │ (.joblib)    │
                                           └──────────────┘
```

---

## 3. Machine Learning Pipeline & Results

### Data Source & Preprocessing
- **Dataset:** `teen_phone_addiction_dataset.csv` (3,000 records).
- **Target Variable:** Continuous `Addiction_Level` (1–10) binned into 3 tiers per the reference paper:
  - **Low:** $\le 4.0$
  - **Medium:** $4.0 < \text{score} \le 7.0$
  - **High:** $> 7.0$
- **Splits:** 70% Train (2,100), 15% Validation (450), 15% Stratified Test (450).
- **Encoders & Scalers:**
  - One-Hot Encoding for categorical features (`Gender`, `Location`, `School_Grade`, `Phone_Usage_Purpose`) with `min_frequency=5` and `handle_unknown='ignore'`.
  - `StandardScaler` for all 18 numerical variables inside a scikit-learn `ColumnTransformer`.
  - Safeguard median and most-frequent imputation.

### Empirical Model Performance (Stratified 5-Fold CV + Test Split)

| Algorithm | Test Accuracy | Macro Precision | Macro Recall | Macro F1 | ROC-AUC | 5-Fold CV Accuracy | 5-Fold CV Macro F1 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression (LR)** | **98.00%** | **94.21%** | **91.13%** | **92.57%** | **0.9991** | **97.57% ± 0.56%** | **89.01% ± 5.76%** |
| **Random Forest (RF)** | 92.44% | 55.43% | 57.94% | 56.64% | 0.9756 | 92.31% ± 1.00% | 58.02% ± 4.03% |
| **Decision Tree (DT)** | 85.33% | 61.27% | 60.32% | 60.76% | 0.7585 | 86.12% ± 0.69% | 55.50% ± 6.68% |

---

## 4. Quick Start (Step-by-Step Setup)

### Prerequisites
- Node.js $\ge 18$
- Python $\ge 3.10$
- (Optional) MongoDB running on `mongodb://127.0.0.1:27017` (If MongoDB is absent, the system operates with the built-in resilient local storage automatically).

---

### Step 1: Start the Python ML Microservice (FastAPI)

```bash
cd "NEW. mern stack API/ml-service"

# 1. (Optional) Create & activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. (Optional) Retrain models and generate artifacts
cd training
python train_models.py
cd ..

# 4. Start FastAPI server on port 8000
cd app
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*Health Check: Open [http://localhost:8000/health](http://localhost:8000/health) or [http://localhost:8000/docs](http://localhost:8000/docs).*

---

### Step 2: Start the Node/Express Backend

```bash
cd "NEW. mern stack API/server"

# 1. Install dependencies
npm install

# 2. Start the Express server on port 5000
npm start
```
*Verification: Open [http://localhost:5000/api/health](http://localhost:5000/api/health).*

---

### Step 3: Start the React Frontend (Vite)

```bash
cd "NEW. mern stack API/client"

# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```
*The web interface will launch at [http://localhost:5173](http://localhost:5173).*

---

## 5. API Reference

### 1. `POST /api/predict`
Accepts input indicators, executes inference across DT, LR, and RF, and returns local SHAP explanations.
```json
{
  "Age": 16,
  "Gender": "Female",
  "Location": "Urban",
  "School_Grade": "10th",
  "Daily_Usage_Hours": 6.5,
  "Sleep_Hours": 5.5,
  "Academic_Performance": 72.0,
  "Social_Interactions": 4,
  "Exercise_Hours": 0.5,
  "Anxiety_Level": 8,
  "Depression_Level": 7,
  "Self_Esteem": 3,
  "Parental_Control": 0,
  "Screen_Time_Before_Bed": 2.0,
  "Phone_Checks_Per_Day": 110,
  "Apps_Used_Daily": 15,
  "Time_on_Social_Media": 3.5,
  "Time_on_Gaming": 1.5,
  "Time_on_Education": 0.8,
  "Phone_Usage_Purpose": "Social Media",
  "Family_Communication": 4,
  "Weekend_Usage_Hours": 8.0
}
```

**Response:**
```json
{
  "success": true,
  "predictionId": "local_1731675200",
  "predicted_class": "High",
  "risk_level": "High",
  "recommended_model": {
    "key": "logistic_regression",
    "name": "Logistic Regression",
    "confidence": 1.0,
    "f1_score": 0.9257,
    "accuracy": 0.98
  },
  "model_predictions": [
    {
      "model_key": "logistic_regression",
      "model_name": "Logistic Regression",
      "predicted_class": "High",
      "confidence": 1.0,
      "probabilities": { "High": 1.0, "Low": 0.0, "Medium": 0.0 }
    },
    {
      "model_key": "random_forest",
      "model_name": "Random Forest",
      "predicted_class": "High",
      "confidence": 0.89,
      "probabilities": { "High": 0.89, "Low": 0.011, "Medium": 0.099 }
    },
    {
      "model_key": "decision_tree",
      "model_name": "Decision Tree",
      "predicted_class": "High",
      "confidence": 1.0,
      "probabilities": { "High": 1.0, "Low": 0.0, "Medium": 0.0 }
    }
  ],
  "shap_top_features": {
    "logistic_regression": [
      {
        "feature": "Daily_Usage_Hours",
        "raw_value": 6.5,
        "shap_value": 10.004,
        "impact": "increases_risk",
        "description": "Daily_Usage_Hours (value: 6.5) elevates predicted risk toward High (+10.004 SHAP)."
      }
    ]
  },
  "explanation_summary": "Assessment indicates **High Addiction Risk** with 100.0% confidence. Primary risk drivers: **Daily_Usage_Hours, Time_on_Social_Media**."
}
```

### 2. `GET /api/models/compare`
Returns cross-validated benchmarks, AUC, accuracy, F1-scores, and confusion matrices across DT, LR, and RF.

### 3. `GET /api/feature-importance`
Returns precomputed global feature importance rankings (mean |SHAP value|) for each model and the ensemble consensus.

### 4. `POST /api/batch-predict`
Multipart CSV upload endpoint for institutional cohort classification.

### 5. `GET /api/history`
Retrieves past predictions with optional filtering by `riskLevel` (`Low`, `Medium`, `High`).

---

## 6. Directory Structure

```
NEW. mern stack API/
├── ml-service/                  # Python FastAPI Microservice
│   ├── app/
│   │   ├── main.py              # FastAPI app & endpoints
│   │   ├── schemas.py           # Pydantic validation models
│   │   ├── model_loader.py      # Artifact loader
│   │   └── inference.py         # 3-model prediction & SHAP logic
│   ├── training/
│   │   ├── preprocess.py        # Binning, encoding, train/val/test splits
│   │   ├── evaluate.py          # Multiclass ROC-AUC, 5-Fold Stratified CV
│   │   └── train_models.py      # Grid search tuning for DT, LR, RF & SHAP
│   ├── artifacts/               # Serialized .joblib models & explainers
│   ├── data/                    # teen_phone_addiction_dataset.csv
│   └── requirements.txt
├── server/                      # Node/Express Backend
│   ├── models/
│   │   ├── Prediction.js        # Mongoose Schema
│   │   ├── User.js              # User Authentication Schema
│   │   └── storage.js           # Resilient dual MongoDB / local storage
│   ├── routes/
│   │   ├── predict.js           # FastAPI Proxy & batch predict
│   │   ├── history.js           # History retrieval & CSV export
│   │   └── auth.js              # JWT authentication
│   ├── .env
│   ├── index.js                 # Express server entry point (Port 5000)
│   └── package.json
├── client/                      # React Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Sticky research navbar
│   │   │   ├── PredictionForm.jsx       # Grouped inputs & persona presets
│   │   │   ├── ResultsPanel.jsx         # Grouped confidence bars & local SHAP
│   │   │   ├── ModelComparisonChart.jsx # Radar, bar, research CV table
│   │   │   ├── ShapChart.jsx            # Global SHAP horizontal bar chart
│   │   │   └── ResearchPaperModal.jsx   # Study context & ethical guidelines
│   │   ├── pages/
│   │   │   ├── Predict.jsx              # Real-time risk assessment
│   │   │   ├── Insights.jsx             # Empirical model comparison
│   │   │   ├── BatchPredict.jsx         # Batch CSV upload & export
│   │   │   └── History.jsx              # Historical log & audit modal
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## 7. Citation

If using this implementation in academic research or educational interventions:
```bibtex
@article{teen_phone_addiction_2026,
  title={Teen Smartphone Addiction Level Prediction Using Machine Learning Models: A Comparative Study},
  author={AI Research Team},
  journal={Journal of Behavioral Informatics and Mental Health},
  year={2026}
}
```
