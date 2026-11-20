import os
import joblib
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from sklearn.pipeline import Pipeline
from .ml_service import generate_prediction_data, build_preprocessor, MODEL_DIR
from ..models import ModelMetadata
def get_active_model(db: Session):
    active_meta = db.query(ModelMetadata).filter(ModelMetadata.is_active == True).first()
    if not active_meta:
        active_meta = db.query(ModelMetadata).order_by(ModelMetadata.id.desc()).first()
    return active_meta
def get_model_by_name(db: Session, model_name: str | None = None):
    """Return the latest version of the requested model, or fallback to active model."""
    if model_name:
        meta = (
            db.query(ModelMetadata)
            .filter(ModelMetadata.model_name == model_name)
            .order_by(ModelMetadata.version.desc())
            .first()
        )
        if meta:
            return meta
    return get_active_model(db)
def build_inference_pipeline(full_pipeline):
    """
    Extract a clean inference-only pipeline (preprocessor + classifier)
    from the full ImbPipeline (which includes SMOTE).
    SMOTE must NOT be called at prediction time — it resamples the input
    and causes shape mismatches / wrong outputs for SHAP and LIME.
    """
    inference_steps = [
        (name, est)
        for name, est in full_pipeline.steps
        if not hasattr(est, 'fit_resample')                              
    ]
    return Pipeline(inference_steps)
def get_global_explanation(db: Session, model_name: str | None = None):
    active_meta = get_model_by_name(db, model_name)
    if not active_meta or not os.path.exists(active_meta.filepath):
        return {"error": "No trained model found. Please train models first."}
    full_pipeline = joblib.load(active_meta.filepath)
    pipeline = build_inference_pipeline(full_pipeline)              
    df = generate_prediction_data(500)
    X = df.drop('readmitted', axis=1)
    import shap
    background = shap.sample(X, 50)
    def predict_fn(x):
        if not isinstance(x, pd.DataFrame):
            x = pd.DataFrame(x, columns=X.columns)
        if hasattr(pipeline, 'predict_proba'):
            return pipeline.predict_proba(x)[:, 1]
        return pipeline.predict(x)
    explainer = shap.KernelExplainer(predict_fn, background)
    shap_values = explainer.shap_values(X.iloc[:100])
    vals = np.abs(shap_values).mean(0)
    feature_importance = pd.DataFrame(
        list(zip(X.columns, vals)), columns=['feature', 'importance']
    )
    feature_importance.sort_values(by=['importance'], ascending=False, inplace=True)
    importance_list = [
        {"feature": row['feature'], "importance": float(row['importance'])}
        for _, row in feature_importance.iterrows()
    ]
    return {
        "model_used": f"{active_meta.model_name} (v{active_meta.version})",
        "feature_importance": importance_list
    }
def get_local_explanation(patient_data: dict, db: Session, model_name: str | None = None):
    active_meta = get_model_by_name(db, model_name)
    if not active_meta or not os.path.exists(active_meta.filepath):
        return {"error": "No trained model found. Please train models first."}
    full_pipeline = joblib.load(active_meta.filepath)
    pipeline = build_inference_pipeline(full_pipeline)              
    df_instance = pd.DataFrame([patient_data])
    pred = pipeline.predict(df_instance)[0]
    prob = (
        pipeline.predict_proba(df_instance)[0][1]
        if hasattr(pipeline, 'predict_proba')
        else float(pred)
    )
    df_bg = generate_prediction_data(200)
    X_bg = df_bg.drop('readmitted', axis=1)
    import shap
    background = shap.sample(X_bg, 30)
    def predict_fn(x):
        if not isinstance(x, pd.DataFrame):
            x = pd.DataFrame(x, columns=X_bg.columns)
        if hasattr(pipeline, 'predict_proba'):
            return pipeline.predict_proba(x)[:, 1]
        return pipeline.predict(x)
    explainer_shap = shap.KernelExplainer(predict_fn, background)
    shap_values = explainer_shap.shap_values(df_instance)
    sv_array = np.array(shap_values)
    sv_flat = sv_array[0] if sv_array.ndim == 2 else sv_array.flatten()
    shap_contributions = []
    for i, col in enumerate(df_instance.columns):
        val = float(sv_flat[i])
        shap_contributions.append({
            "feature": col,
            "value": str(df_instance.iloc[0][col]),
            "contribution": val,
            "direction": "increases" if val > 0 else "decreases",
        })
    shap_contributions.sort(key=lambda x: abs(x['contribution']), reverse=True)
    df_lime_bg = generate_prediction_data(500)
    X_lime_bg = df_lime_bg.drop('readmitted', axis=1)
    categorical_features_names = ['gender', 'insurance', 'diagnosis', 'department']
    categorical_indices = []
    categorical_names = {}
    X_lime_train = X_lime_bg.copy()
    for i, col in enumerate(X_lime_train.columns):
        if col in categorical_features_names:
            categorical_indices.append(i)
            unique_vals = list(X_lime_bg[col].unique())
            categorical_names[i] = [str(v) for v in unique_vals]
            X_lime_train[col] = X_lime_train[col].apply(
                lambda v: unique_vals.index(v) if v in unique_vals else 0
            )
    import lime
    import lime.lime_tabular
    lime_explainer = lime.lime_tabular.LimeTabularExplainer(
        X_lime_train.values.astype(float),
        feature_names=list(X_lime_bg.columns),
        categorical_features=categorical_indices,
        categorical_names=categorical_names,
        class_names=['Not Readmitted', 'Readmitted'],
        mode='classification',
        discretize_continuous=False,                                                           
        random_state=42,
    )
    def lime_predict_fn(x_arr):
        df_temp = pd.DataFrame(x_arr, columns=X_lime_bg.columns)
        for i, col in enumerate(X_lime_bg.columns):
            if col in categorical_features_names:
                mapping = categorical_names[i]
                df_temp[col] = df_temp[col].apply(
                    lambda v: mapping[int(round(float(v)))]
                    if 0 <= int(round(float(v))) < len(mapping) else mapping[0]
                )
        for col in X_lime_bg.columns:
            if col not in categorical_features_names:
                df_temp[col] = pd.to_numeric(df_temp[col], errors='coerce')
        return pipeline.predict_proba(df_temp)
    instance_lime = df_instance.iloc[0].copy().astype(object)
    for i, col in enumerate(X_lime_bg.columns):
        if col in categorical_features_names:
            unique_vals = categorical_names[i]
            val = str(instance_lime[col])
            instance_lime[col] = unique_vals.index(val) if val in unique_vals else 0
    exp = lime_explainer.explain_instance(
        instance_lime.values.astype(float),
        lime_predict_fn,
        num_features=5,
        num_samples=1000,
    )
    lime_explanation = [
        {
            "rule": feature,
            "weight": float(weight),
            "direction": "increases" if weight > 0 else "decreases",
        }
        for feature, weight in exp.as_list()
    ]
    return {
        "model_used": f"{active_meta.model_name} (v{active_meta.version})",
        "predicted_class": int(pred),
        "probability": float(prob),
        "risk_level": "High" if prob >= 0.7 else "Medium" if prob >= 0.4 else "Low",
        "shap_contributions": shap_contributions,
        "lime_explanation": lime_explanation
    }
