import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
import shap

from preprocess import (
    load_and_preprocess_data,
    split_data,
    build_preprocessor,
    CATEGORICAL_FEATURES,
    NUMERICAL_FEATURES,
    CLASS_LABELS,
    CLASS_TO_INT,
    INT_TO_CLASS
)
from evaluate import compute_metrics, compute_cross_validation_metrics

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "teen_phone_addiction_dataset.csv")
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)


def train_and_evaluate_all():
    print("=" * 60)
    print("Teen Smartphone Addiction ML Training Pipeline")
    print("=" * 60)

    # 1. Load data
    print(f"Loading dataset from: {DATA_PATH}")
    X, y = load_and_preprocess_data(DATA_PATH)
    print(f"Dataset shape: {X.shape}, Target distribution:")
    print(y.value_counts())

    # 2. Split data: 70% Train, 15% Validation, 15% Test
    splits = split_data(X, y, train_size=0.70, val_size=0.15, test_size=0.15, random_state=42)
    X_train, y_train = splits["X_train"], splits["y_train"]
    X_val, y_val = splits["X_val"], splits["y_val"]
    X_test, y_test = splits["X_test"], splits["y_test"]

    print(f"Train set: {X_train.shape[0]} samples")
    print(f"Validation set: {X_val.shape[0]} samples")
    print(f"Test set: {X_test.shape[0]} samples")

    # Combine train + val for full cross-validation and hyperparameter selection
    X_train_val = pd.concat([X_train, X_val], axis=0).reset_index(drop=True)
    y_train_val = pd.concat([y_train, y_val], axis=0).reset_index(drop=True)

    # 3. Fit Preprocessor
    print("\nFitting feature preprocessor...")
    preprocessor = build_preprocessor()
    X_train_trans = preprocessor.fit_transform(X_train)
    X_val_trans = preprocessor.transform(X_val)
    X_test_trans = preprocessor.transform(X_test)
    X_train_val_trans = preprocessor.transform(X_train_val)

    # Extract transformed feature names
    feature_names = list(preprocessor.get_feature_names_out())
    # Clean up prefixes: 'num__' and 'cat__'
    clean_feature_names = [f.replace("num__", "").replace("cat__", "") for f in feature_names]
    print(f"Engineered {len(clean_feature_names)} features.")

    # 4. Hyperparameter Tuning & Model Training
    models = {}
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    # --- Model A: Logistic Regression ---
    print("\nTuning & Training Logistic Regression...")
    lr_params = {
        "C": [0.1, 1.0, 5.0, 10.0]
    }
    lr_grid = GridSearchCV(
        LogisticRegression(max_iter=2000, class_weight="balanced", random_state=42),
        lr_params,
        cv=cv,
        scoring="f1_macro",
        n_jobs=-1
    )
    lr_grid.fit(X_train_trans, y_train)
    best_lr = lr_grid.best_estimator_
    print(f"Best LR Params: {lr_grid.best_params_}")
    models["logistic_regression"] = best_lr

    # --- Model B: Decision Tree Classifier ---
    print("\nTuning & Training Decision Tree...")
    dt_params = {
        "max_depth": [3, 5, 8, 12, None],
        "min_samples_split": [2, 5, 10],
        "min_samples_leaf": [1, 2, 4]
    }
    dt_grid = GridSearchCV(
        DecisionTreeClassifier(class_weight="balanced", random_state=42),
        dt_params,
        cv=cv,
        scoring="f1_macro",
        n_jobs=-1
    )
    dt_grid.fit(X_train_trans, y_train)
    best_dt = dt_grid.best_estimator_
    print(f"Best DT Params: {dt_grid.best_params_}")
    models["decision_tree"] = best_dt

    # --- Model C: Random Forest Classifier ---
    print("\nTuning & Training Random Forest...")
    rf_params = {
        "n_estimators": [100, 200],
        "max_depth": [6, 10, 15, None],
        "min_samples_leaf": [1, 2, 4]
    }
    rf_grid = GridSearchCV(
        RandomForestClassifier(class_weight="balanced", random_state=42),
        rf_params,
        cv=cv,
        scoring="f1_macro",
        n_jobs=-1
    )
    rf_grid.fit(X_train_trans, y_train)
    best_rf = rf_grid.best_estimator_
    print(f"Best RF Params: {rf_grid.best_params_}")
    models["random_forest"] = best_rf

    # 5. Model Evaluation (Test split + Cross-Validation)
    print("\nComputing comprehensive test & cross-validation metrics...")
    model_comparison = []
    
    friendly_names = {
        "decision_tree": "Decision Tree",
        "logistic_regression": "Logistic Regression",
        "random_forest": "Random Forest"
    }

    for key, model in models.items():
        name = friendly_names[key]
        # Test split metrics
        test_metrics = compute_metrics(model, X_test_trans, y_test.values, CLASS_LABELS)
        # CV metrics on train+val
        cv_metrics = compute_cross_validation_metrics(model, X_train_val_trans, y_train_val.values, cv_splits=5)

        summary = {
            "key": key,
            "name": name,
            "accuracy": test_metrics["accuracy"],
            "f1_macro": test_metrics["f1_macro"],
            "f1_weighted": test_metrics["f1_weighted"],
            "precision_macro": test_metrics["precision_macro"],
            "recall_macro": test_metrics["recall_macro"],
            "auc": test_metrics["auc"],
            "cv_mean": cv_metrics["cv_accuracy_mean"],
            "cv_std": cv_metrics["cv_accuracy_std"],
            "cv_f1_mean": cv_metrics["cv_f1_mean"],
            "cv_f1_std": cv_metrics["cv_f1_std"],
            "cv_precision_mean": cv_metrics["cv_precision_mean"],
            "cv_recall_mean": cv_metrics["cv_recall_mean"],
            "confusion_matrix": test_metrics["confusion_matrix"],
            "class_labels": test_metrics["class_labels"]
        }
        model_comparison.append(summary)
        print(f"\n[{name}]")
        print(f"  Test Accuracy: {summary['accuracy']:.4f} | Macro F1: {summary['f1_macro']:.4f} | AUC: {summary['auc']:.4f}")
        print(f"  5-Fold CV Accuracy: {summary['cv_mean']:.4f} ± {summary['cv_std']:.4f}")
        print(f"  5-Fold CV Macro F1: {summary['cv_f1_mean']:.4f} ± {summary['cv_f1_std']:.4f}")

    # 6. Build SHAP Explainers
    print("\nBuilding and calibrating SHAP explainers...")
    # Sample background dataset for explainers (for speed and consistency)
    background_sample = X_train_trans[:100]

    shap_dt = shap.TreeExplainer(best_dt)
    shap_rf = shap.TreeExplainer(best_rf)

    # For Logistic Regression, independent masker with LinearExplainer
    masker = shap.maskers.Independent(data=background_sample)
    shap_lr = shap.LinearExplainer(best_lr, masker=masker)

    # 7. Compute Global Feature Importance (mean |SHAP| across test set)
    print("Calculating global SHAP feature importances...")
    # Evaluate SHAP values on test set sample for all three
    eval_sample = X_test_trans[:150]
    
    dt_test_shap = shap_dt(eval_sample).values
    rf_test_shap = shap_rf(eval_sample).values
    lr_test_shap = shap_lr(eval_sample).values

    # Mean absolute SHAP per feature across samples and all classes
    # Shape of shap_values is (N, n_features, n_classes)
    dt_importance = np.mean(np.abs(dt_test_shap), axis=(0, 2))
    rf_importance = np.mean(np.abs(rf_test_shap), axis=(0, 2))
    lr_importance = np.mean(np.abs(lr_test_shap), axis=(0, 2))

    # Normalize to 0-1 scale for clean comparative visualizations
    def _normalize(arr):
        s = np.sum(arr)
        return (arr / s) if s > 0 else arr

    dt_norm = _normalize(dt_importance)
    rf_norm = _normalize(rf_importance)
    lr_norm = _normalize(lr_importance)
    ensemble_norm = (dt_norm + rf_norm + lr_norm) / 3.0

    global_features_list = []
    for idx, fname in enumerate(clean_feature_names):
        global_features_list.append({
            "feature": fname,
            "decision_tree": round(float(dt_norm[idx]), 4),
            "random_forest": round(float(rf_norm[idx]), 4),
            "logistic_regression": round(float(lr_norm[idx]), 4),
            "ensemble_importance": round(float(ensemble_norm[idx]), 4)
        })

    # Sort descending by ensemble importance
    global_features_list.sort(key=lambda x: x["ensemble_importance"], reverse=True)

    # 8. Save Artifacts
    print(f"\nSaving artifacts to {ARTIFACTS_DIR}...")
    joblib.dump(preprocessor, os.path.join(ARTIFACTS_DIR, "preprocessor.joblib"))
    joblib.dump(best_dt, os.path.join(ARTIFACTS_DIR, "decision_tree.joblib"))
    joblib.dump(best_lr, os.path.join(ARTIFACTS_DIR, "logistic_regression.joblib"))
    joblib.dump(best_rf, os.path.join(ARTIFACTS_DIR, "random_forest.joblib"))

    joblib.dump(shap_dt, os.path.join(ARTIFACTS_DIR, "shap_dt.joblib"))
    joblib.dump(shap_rf, os.path.join(ARTIFACTS_DIR, "shap_rf.joblib"))
    joblib.dump(shap_lr, os.path.join(ARTIFACTS_DIR, "shap_lr.joblib"))

    # Save feature metadata & names
    metadata = {
        "categorical_features": CATEGORICAL_FEATURES,
        "numerical_features": NUMERICAL_FEATURES,
        "raw_features": CATEGORICAL_FEATURES + NUMERICAL_FEATURES,
        "clean_feature_names": clean_feature_names,
        "class_labels": CLASS_LABELS,
        "class_to_int": CLASS_TO_INT,
        "int_to_class": INT_TO_CLASS
    }
    with open(os.path.join(ARTIFACTS_DIR, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    with open(os.path.join(ARTIFACTS_DIR, "model_comparison.json"), "w") as f:
        json.dump({"models": model_comparison}, f, indent=2)

    with open(os.path.join(ARTIFACTS_DIR, "global_feature_importance.json"), "w") as f:
        json.dump({
            "features": global_features_list,
            "top_10": global_features_list[:10]
        }, f, indent=2)

    print("\nTraining completed successfully! Artifacts written:")
    for f in os.listdir(ARTIFACTS_DIR):
        print(f"  - {f}")


if __name__ == "__main__":
    train_and_evaluate_all()
