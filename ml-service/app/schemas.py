from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Optional


class PredictionRequest(BaseModel):
    # Demographics
    Age: int = Field(default=16, ge=10, le=25, description="Age in years (10-25)")
    Gender: str = Field(default="Female", description="Gender: Male, Female, Other")
    Location: Optional[str] = Field(default="Urban", description="Geographic location or school district")
    School_Grade: str = Field(default="10th", description="Grade: 7th, 8th, 9th, 10th, 11th, 12th")

    # Usage Patterns
    Daily_Usage_Hours: float = Field(default=5.5, ge=0.0, le=24.0, description="Average daily smartphone usage in hours")
    Screen_Time_Before_Bed: float = Field(default=1.5, ge=0.0, le=12.0, description="Hours of screen time right before sleeping")
    Phone_Checks_Per_Day: int = Field(default=85, ge=0, le=500, description="Number of times phone is checked daily")
    Apps_Used_Daily: int = Field(default=12, ge=0, le=100, description="Count of distinct apps used daily")
    Weekend_Usage_Hours: float = Field(default=7.0, ge=0.0, le=24.0, description="Average weekend usage in hours per day")
    Phone_Usage_Purpose: str = Field(default="Social Media", description="Primary purpose: Browsing, Education, Gaming, Social Media, Other")

    # Time Breakdown
    Time_on_Social_Media: float = Field(default=2.5, ge=0.0, le=24.0, description="Hours on social platforms")
    Time_on_Gaming: float = Field(default=1.0, ge=0.0, le=24.0, description="Hours on mobile games")
    Time_on_Education: float = Field(default=1.0, ge=0.0, le=24.0, description="Hours for study / academic tasks")

    # Lifestyle & Wellness
    Sleep_Hours: float = Field(default=6.5, ge=0.0, le=24.0, description="Average hours of sleep per night")
    Exercise_Hours: float = Field(default=1.0, ge=0.0, le=24.0, description="Hours spent in physical activity per day")
    Social_Interactions: int = Field(default=5, ge=0, le=10, description="Self-reported offline social interactions scale (0-10)")

    # Mental Health & Well-being
    Anxiety_Level: int = Field(default=5, ge=0, le=10, description="Self-reported anxiety scale (0-10)")
    Depression_Level: int = Field(default=4, ge=0, le=10, description="Self-reported depression scale (0-10)")
    Self_Esteem: int = Field(default=6, ge=0, le=10, description="Self-reported self-esteem score (0-10)")

    # Academic & Family Dynamics
    Academic_Performance: float = Field(default=78.0, ge=0.0, le=100.0, description="Academic grade percentage (0-100)")
    Parental_Control: int = Field(default=0, ge=0, le=1, description="Parental control enabled: 1 (Yes) or 0 (No)")
    Family_Communication: int = Field(default=6, ge=0, le=10, description="Quality of family communication scale (0-10)")

    @field_validator("Gender")
    @classmethod
    def validate_gender(cls, v: str) -> str:
        v_title = v.strip().capitalize()
        if v_title not in ["Male", "Female", "Other"]:
            return "Other"
        return v_title

    @field_validator("School_Grade")
    @classmethod
    def validate_grade(cls, v: str) -> str:
        valid_grades = ["7th", "8th", "9th", "10th", "11th", "12th"]
        v_clean = v.strip()
        if v_clean not in valid_grades:
            return "10th"
        return v_clean

    @field_validator("Phone_Usage_Purpose")
    @classmethod
    def validate_purpose(cls, v: str) -> str:
        valid_purposes = ["Browsing", "Education", "Gaming", "Social Media", "Other"]
        for p in valid_purposes:
            if v.strip().lower() == p.lower():
                return p
        return "Other"


class ModelPredictionItem(BaseModel):
    model_key: str
    model_name: str
    predicted_class: str
    confidence: float
    probabilities: Dict[str, float]


class ShapFeatureContribution(BaseModel):
    feature: str
    raw_value: Any
    shap_value: float
    impact: str  # "increases_risk" or "decreases_risk"
    description: str


class RecommendedModel(BaseModel):
    key: str
    name: str
    reason: str
    confidence: float
    f1_score: float
    accuracy: float


class PredictionResponse(BaseModel):
    predicted_class: str
    risk_level: str  # Low, Medium, High
    recommended_model: RecommendedModel
    model_predictions: List[ModelPredictionItem]
    shap_top_features: Dict[str, List[ShapFeatureContribution]]
    explanation_summary: str
    input_snapshot: Dict[str, Any]


class BatchPredictionItemResult(BaseModel):
    row_index: int
    predicted_class: str
    recommended_confidence: float
    model_consensus: str
    top_driver: str


class BatchPredictionResponse(BaseModel):
    total_processed: int
    results: List[BatchPredictionItemResult]
    summary: Dict[str, int]


class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    version: str
    timestamp: str
    available_models: List[str]
