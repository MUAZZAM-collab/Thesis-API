import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score
)
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.preprocessing import label_binarize

CLASS_LABELS = ["Low", "Medium", "High"]


def compute_metrics(
    model, 
    X_test_transformed: np.ndarray, 
    y_test: np.ndarray, 
    class_labels: List[str] = CLASS_LABELS
) -> Dict[str, Any]:
    """
    Computes all standard research-grade classification metrics on test data.
    """
    y_pred = model.predict(X_test_transformed)
    
    # Check if model has predict_proba
    has_proba = hasattr(model, "predict_proba")
    y_proba = model.predict_proba(X_test_transformed) if has_proba else None

    # Compute scalar metrics
    acc = float(accuracy_score(y_test, y_pred))
    p_macro = float(precision_score(y_test, y_pred, average="macro", zero_division=0))
    p_weighted = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    r_macro = float(recall_score(y_test, y_pred, average="macro", zero_division=0))
    r_weighted = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1_mac = float(f1_score(y_test, y_pred, average="macro", zero_division=0))
    f1_w = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred, labels=class_labels).tolist()

    # Multiclass ROC-AUC (One-vs-Rest)
    auc_score = 0.0
    if y_proba is not None:
        try:
            model_classes = list(model.classes_)
            y_test_bin = label_binarize(y_test, classes=model_classes)
            if y_test_bin.shape[1] == y_proba.shape[1]:
                auc_score = float(roc_auc_score(y_test_bin, y_proba, multi_class="ovr", average="macro"))
            else:
                auc_score = float(roc_auc_score(y_test, y_proba, multi_class="ovr", average="macro"))
        except Exception as e:
            auc_score = 0.0

    return {
        "accuracy": round(acc, 4),
        "precision_macro": round(p_macro, 4),
        "precision_weighted": round(p_weighted, 4),
        "recall_macro": round(r_macro, 4),
        "recall_weighted": round(r_weighted, 4),
        "f1_macro": round(f1_mac, 4),
        "f1_weighted": round(f1_w, 4),
        "auc": round(auc_score, 4),
        "confusion_matrix": cm,
        "class_labels": class_labels
    }


def compute_cross_validation_metrics(
    model, 
    X_train_val_trans: np.ndarray, 
    y_train_val: np.ndarray, 
    cv_splits: int = 5
) -> Dict[str, float]:
    """
    Computes 5-fold stratified cross-validation mean and std for accuracy and macro F1.
    """
    cv = StratifiedKFold(n_splits=cv_splits, shuffle=True, random_state=42)
    scoring = {
        "accuracy": "accuracy",
        "precision_macro": "precision_macro",
        "recall_macro": "recall_macro",
        "f1_macro": "f1_macro"
    }
    
    cv_res = cross_validate(
        model, 
        X_train_val_trans, 
        y_train_val, 
        cv=cv, 
        scoring=scoring, 
        n_jobs=-1
    )

    return {
        "cv_accuracy_mean": round(float(np.mean(cv_res["test_accuracy"])), 4),
        "cv_accuracy_std": round(float(np.std(cv_res["test_accuracy"])), 4),
        "cv_f1_mean": round(float(np.mean(cv_res["test_f1_macro"])), 4),
        "cv_f1_std": round(float(np.std(cv_res["test_f1_macro"])), 4),
        "cv_precision_mean": round(float(np.mean(cv_res["test_precision_macro"])), 4),
        "cv_precision_std": round(float(np.std(cv_res["test_precision_macro"])), 4),
        "cv_recall_mean": round(float(np.mean(cv_res["test_recall_macro"])), 4),
        "cv_recall_std": round(float(np.std(cv_res["test_recall_macro"])), 4)
    }
