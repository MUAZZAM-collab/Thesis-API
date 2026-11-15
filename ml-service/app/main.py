from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import datetime
import io
import pandas as pd
from typing import List, Dict, Any

from schemas import (
    PredictionRequest,
    PredictionResponse,
    HealthResponse,
    BatchPredictionResponse,
    BatchPredictionItemResult
)
from model_loader import model_store
from inference import predict_single_record


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load ML models and artifacts
    print("Initializing Teen Addiction ML Service...")
    model_store.load_all()
    yield
    # Shutdown logic if any
    print("Shutting down ML Service.")


app = FastAPI(
    title="Teen Smartphone Addiction ML Microservice",
    description="Multi-model inference microservice (Decision Tree, Logistic Regression, Random Forest) with local & global SHAP explainability.",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for Node Express and React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health_check():
    """
    Health check endpoint reporting model status and timestamp.
    """
    return {
        "status": "ok",
        "models_loaded": model_store.is_loaded,
        "version": "2.0.0",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "available_models": list(model_store.models.keys())
    }


@app.get("/models/compare")
def compare_models():
    """
    Returns research-grade performance comparison across Decision Tree,
    Logistic Regression, and Random Forest (Accuracy, Macro F1, AUC, 5-Fold CV mean ± std, Confusion Matrix).
    """
    if not model_store.is_loaded:
        model_store.load_all()
    return model_store.model_comparison


@app.get("/feature-importance")
def get_global_feature_importance():
    """
    Returns precomputed global feature importance rankings (mean |SHAP value|)
    for all individual models and ensemble average.
    """
    if not model_store.is_loaded:
        model_store.load_all()
    return model_store.global_feature_importance


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    """
    Main prediction endpoint:
    - Runs inference on Decision Tree, Logistic Regression, and Random Forest
    - Computes local SHAP explanations for top-5 contributing factors per model
    - Provides recommended model prediction and clinical narrative
    """
    try:
        input_dict = request.model_dump()
        result = predict_single_record(input_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@app.post("/batch-predict")
async def batch_predict(file: UploadFile = File(...)):
    """
    Upload CSV file (e.g. for classrooms, clinics, or research batches)
    and receive classified records with model consensus.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a CSV.")

    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))

    if not model_store.is_loaded:
        model_store.load_all()

    results = []
    summary_counts = {"Low": 0, "Medium": 0, "High": 0}

    for idx, row in df.iterrows():
        try:
            row_dict = row.to_dict()
            res = predict_single_record(row_dict)
            p_class = res["predicted_class"]
            summary_counts[p_class] = summary_counts.get(p_class, 0) + 1

            # Top driver
            lr_shap = res["shap_top_features"].get("logistic_regression", [])
            top_driver = lr_shap[0]["feature"] if lr_shap else "Usage Pattern"

            results.append({
                "row_index": idx + 1,
                "predicted_class": p_class,
                "recommended_confidence": res["recommended_model"]["confidence"],
                "model_consensus": f"LR: {res['model_predictions'][0]['predicted_class']} | RF: {res['model_predictions'][1]['predicted_class']} | DT: {res['model_predictions'][2]['predicted_class']}",
                "top_driver": top_driver
            })
        except Exception as err:
            results.append({
                "row_index": idx + 1,
                "predicted_class": "Error",
                "recommended_confidence": 0.0,
                "model_consensus": str(err),
                "top_driver": "N/A"
            })

    return {
        "total_processed": len(results),
        "summary": summary_counts,
        "results": results
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
