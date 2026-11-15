import os
import json
import joblib
from typing import Dict, Any, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")


class ModelStore:
    _instance = None

    def __init__(self):
        self.preprocessor = None
        self.models = {}
        self.shap_explainers = {}
        self.model_comparison = {}
        self.global_feature_importance = {}
        self.metadata = {}
        self.is_loaded = False

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = ModelStore()
        return cls._instance

    def load_all(self):
        if self.is_loaded:
            return

        print(f"Loading ML artifacts from: {ARTIFACTS_DIR}")
        
        # Load Preprocessor
        prep_path = os.path.join(ARTIFACTS_DIR, "preprocessor.joblib")
        if not os.path.exists(prep_path):
            raise FileNotFoundError(f"Preprocessor artifact missing at {prep_path}")
        self.preprocessor = joblib.load(prep_path)

        # Load Trained Classifiers
        self.models["decision_tree"] = joblib.load(os.path.join(ARTIFACTS_DIR, "decision_tree.joblib"))
        self.models["logistic_regression"] = joblib.load(os.path.join(ARTIFACTS_DIR, "logistic_regression.joblib"))
        self.models["random_forest"] = joblib.load(os.path.join(ARTIFACTS_DIR, "random_forest.joblib"))

        # Load SHAP Explainers
        self.shap_explainers["decision_tree"] = joblib.load(os.path.join(ARTIFACTS_DIR, "shap_dt.joblib"))
        self.shap_explainers["random_forest"] = joblib.load(os.path.join(ARTIFACTS_DIR, "shap_rf.joblib"))
        self.shap_explainers["logistic_regression"] = joblib.load(os.path.join(ARTIFACTS_DIR, "shap_lr.joblib"))

        # Load JSON Summaries
        with open(os.path.join(ARTIFACTS_DIR, "model_comparison.json"), "r") as f:
            self.model_comparison = json.load(f)

        with open(os.path.join(ARTIFACTS_DIR, "global_feature_importance.json"), "r") as f:
            self.global_feature_importance = json.load(f)

        with open(os.path.join(ARTIFACTS_DIR, "metadata.json"), "r") as f:
            self.metadata = json.load(f)

        self.is_loaded = True
        print("All models, preprocessors, and SHAP explainers loaded successfully.")


model_store = ModelStore.get_instance()
