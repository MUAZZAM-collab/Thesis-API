import numpy as np
import pandas as pd
from typing import Dict, Any, List
from model_loader import model_store


def predict_single_record(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes inference across Decision Tree, Logistic Regression, and Random Forest.
    Computes local SHAP explanations and synthesizes research insights.
    """
    if not model_store.is_loaded:
        model_store.load_all()

    preprocessor = model_store.preprocessor
    raw_feature_cols = model_store.metadata["raw_features"]
    clean_feature_names = model_store.metadata["clean_feature_names"]

    # 1. Build single-row DataFrame
    row_dict = {}
    for col in raw_feature_cols:
        row_dict[col] = input_data.get(col, 0)

    input_df = pd.DataFrame([row_dict], columns=raw_feature_cols)

    # 2. Transform through fitted ColumnTransformer
    X_trans = preprocessor.transform(input_df)

    # 3. Predict across all 3 models
    model_predictions = []
    shap_top_features = {}

    model_display_names = {
        "decision_tree": "Decision Tree",
        "logistic_regression": "Logistic Regression",
        "random_forest": "Random Forest"
    }

    # Best model stats from evaluation
    best_f1_scores = {
        "logistic_regression": 0.9257,
        "random_forest": 0.5802,
        "decision_tree": 0.5550
    }

    for key in ["logistic_regression", "random_forest", "decision_tree"]:
        model = model_store.models[key]
        pred_class = str(model.predict(X_trans)[0])
        probas = model.predict_proba(X_trans)[0]

        # Map probabilities to classes
        prob_dict = {}
        for c_idx, cls_name in enumerate(model.classes_):
            prob_dict[cls_name] = round(float(probas[c_idx]), 4)

        # Ensure Low, Medium, High all exist
        for expected in ["Low", "Medium", "High"]:
            if expected not in prob_dict:
                prob_dict[expected] = 0.0

        confidence = round(float(np.max(probas)), 4)

        model_predictions.append({
            "model_key": key,
            "model_name": model_display_names[key],
            "predicted_class": pred_class,
            "confidence": confidence,
            "probabilities": prob_dict
        })

        # --- SHAP Explanation for this model ---
        explainer = model_store.shap_explainers.get(key)
        top_contribs = []

        if explainer is not None:
            try:
                shap_res = explainer(X_trans)
                shap_values = shap_res.values  # Shape: (1, n_features, n_classes) or (1, n_features)

                # Find class index for predicted class in model.classes_
                if pred_class in list(model.classes_):
                    target_c_idx = list(model.classes_).index(pred_class)
                else:
                    target_c_idx = 0

                if shap_values.ndim == 3:
                    class_shap = shap_values[0, :, target_c_idx]
                elif shap_values.ndim == 2:
                    class_shap = shap_values[0, :]
                else:
                    class_shap = shap_values

                # Sort by absolute impact
                top_indices = np.argsort(np.abs(class_shap))[::-1][:5]

                for idx in top_indices:
                    f_name = clean_feature_names[idx] if idx < len(clean_feature_names) else f"feature_{idx}"
                    s_val = round(float(class_shap[idx]), 4)
                    raw_val = input_data.get(f_name, "N/A")
                    
                    impact = "increases_risk" if s_val >= 0 else "decreases_risk"

                    # Clinical/human explanatory note
                    if s_val >= 0:
                        desc = f"{f_name} (value: {raw_val}) elevates predicted risk toward {pred_class} (+{s_val:.3f} SHAP)."
                    else:
                        desc = f"{f_name} (value: {raw_val}) acts as a mitigating factor against {pred_class} ({s_val:.3f} SHAP)."

                    top_contribs.append({
                        "feature": f_name,
                        "raw_value": raw_val,
                        "shap_value": s_val,
                        "impact": impact,
                        "description": desc
                    })
            except Exception as e:
                print(f"SHAP explanation error for {key}: {e}")

        shap_top_features[key] = top_contribs

    # 4. Determine Recommended Model
    # Logistic Regression has best test F1 (0.9257) & AUC (0.9991)
    rec_key = "logistic_regression"
    rec_pred = next(p for p in model_predictions if p["model_key"] == rec_key)
    consensus_class = rec_pred["predicted_class"]

    recommended_model = {
        "key": rec_key,
        "name": model_display_names[rec_key],
        "reason": "Highest Macro F1-Score (0.9257) & ROC-AUC (0.9991) across 5-fold stratified cross-validation.",
        "confidence": rec_pred["confidence"],
        "f1_score": best_f1_scores[rec_key],
        "accuracy": 0.9800
    }

    # 5. Synthesize overall explanation summary
    top_lr_shap = shap_top_features.get("logistic_regression", [])
    if top_lr_shap:
        drivers = [t["feature"] for t in top_lr_shap if t["impact"] == "increases_risk"][:2]
        mitigators = [t["feature"] for t in top_lr_shap if t["impact"] == "decreases_risk"][:2]
        
        parts = [f"Assessment indicates **{consensus_class} Addiction Risk** with {round(rec_pred['confidence'] * 100, 1)}% confidence."]
        if drivers:
            parts.append(f"Primary risk drivers: **{', '.join(drivers)}**.")
        if mitigators:
            parts.append(f"Protective mitigating factors: **{', '.join(mitigators)}**.")
        summary_text = " ".join(parts)
    else:
        summary_text = f"Assessment indicates **{consensus_class} Addiction Risk** with {round(rec_pred['confidence'] * 100, 1)}% confidence."

    return {
        "predicted_class": consensus_class,
        "risk_level": consensus_class,
        "recommended_model": recommended_model,
        "model_predictions": model_predictions,
        "shap_top_features": shap_top_features,
        "explanation_summary": summary_text,
        "input_snapshot": input_data
    }
