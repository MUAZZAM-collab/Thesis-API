import pandas as pd
import numpy as np
from typing import Tuple, List, Dict, Any
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
import joblib
import os

CATEGORICAL_FEATURES = ["Gender", "Location", "School_Grade", "Phone_Usage_Purpose"]

NUMERICAL_FEATURES = [
    "Age",
    "Daily_Usage_Hours",
    "Sleep_Hours",
    "Academic_Performance",
    "Social_Interactions",
    "Exercise_Hours",
    "Anxiety_Level",
    "Depression_Level",
    "Self_Esteem",
    "Parental_Control",
    "Screen_Time_Before_Bed",
    "Phone_Checks_Per_Day",
    "Apps_Used_Daily",
    "Time_on_Social_Media",
    "Time_on_Gaming",
    "Time_on_Education",
    "Family_Communication",
    "Weekend_Usage_Hours"
]

ALL_FEATURE_COLUMNS = CATEGORICAL_FEATURES + NUMERICAL_FEATURES
CLASS_LABELS = ["Low", "Medium", "High"]
CLASS_TO_INT = {"Low": 0, "Medium": 1, "High": 2}
INT_TO_CLASS = {0: "Low", 1: "Medium", 2: "High"}


def bin_addiction_target(series: pd.Series) -> pd.Series:
    """
    Bin continuous Addiction_Level (range ~1-10) into 3 classes:
    - Low: score <= 4.0
    - Medium: 4.0 < score <= 7.0
    - High: score > 7.0
    Based on thresholds in reference paper.
    """
    def _bin(val: float) -> str:
        if val <= 4.0:
            return "Low"
        elif val <= 7.0:
            return "Medium"
        else:
            return "High"

    return series.apply(_bin)


def load_and_preprocess_data(filepath: str) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Loads raw CSV, validates columns, drops non-predictive identifiers,
    and returns feature DataFrame X and binned target y.
    """
    df = pd.read_csv(filepath)
    
    # Strip column names if any whitespace
    df.columns = [c.strip() for c in df.columns]
    
    if "Addiction_Level" not in df.columns:
        raise ValueError("Missing 'Addiction_Level' target column in dataset.")
    
    y = bin_addiction_target(df["Addiction_Level"])
    
    # Drop identifiers and continuous target
    cols_to_drop = [c for c in ["ID", "Name", "Addiction_Level"] if c in df.columns]
    X = df.drop(columns=cols_to_drop)
    
    return X, y


def split_data(
    X: pd.DataFrame, 
    y: pd.Series, 
    train_size: float = 0.70, 
    val_size: float = 0.15, 
    test_size: float = 0.15, 
    random_state: int = 42
) -> Dict[str, Any]:
    """
    Split data into 70% train, 15% validation, and 15% test with stratification.
    """
    test_plus_val_ratio = val_size + test_size
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y,
        test_size=test_plus_val_ratio,
        stratify=y,
        random_state=random_state
    )

    val_relative_ratio = val_size / test_plus_val_ratio
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp,
        train_size=val_relative_ratio,
        stratify=y_temp,
        random_state=random_state
    )

    return {
        "X_train": X_train,
        "y_train": y_train,
        "X_val": X_val,
        "y_val": y_val,
        "X_test": X_test,
        "y_test": y_test
    }


def build_preprocessor() -> ColumnTransformer:
    """
    Creates scikit-learn ColumnTransformer:
    - Numerical: median imputer + StandardScaler
    - Categorical: most_frequent imputer + OneHotEncoder(min_frequency=5, handle_unknown='ignore')
    """
    num_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    cat_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", min_frequency=5, sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, NUMERICAL_FEATURES),
            ("cat", cat_pipeline, CATEGORICAL_FEATURES)
        ],
        remainder="drop"
    )

    return preprocessor
