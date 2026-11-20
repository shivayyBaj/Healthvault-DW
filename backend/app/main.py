import json
import functools
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from . import models
from .services.data_loader import load_diabetes_130, load_pima_diabetes, load_heart_disease
@functools.lru_cache(maxsize=1)
def _get_d130():
    return load_diabetes_130()
@functools.lru_cache(maxsize=1)
def _get_pima():
    return load_pima_diabetes()
@functools.lru_cache(maxsize=1)
def _get_heart():
    return load_heart_disease()
_AGE_MIDPOINTS = {
    '[0-10)': 5,  '[10-20)': 15, '[20-30)': 25, '[30-40)': 35,
    '[40-50)': 45, '[50-60)': 55, '[60-70)': 65, '[70-80)': 75,
    '[80-90)': 85, '[90-100)': 95
}
_PAYER_LABEL = {
    'MC': 'Medicare', 'MD': 'Medicaid', 'CP': 'Private',
    'BC': 'Private', 'HM': 'Private', 'OG': 'Private',
    'CM': 'Private', 'SP': 'Uninsured', 'UN': 'Uninsured'
}
def _icd_to_category(code):
    if pd.isna(code):
        return 'Other'
    try:
        num = float(str(code))
        if 390 <= num <= 459 or num == 785:
            return 'Circulatory'
        if (250 <= num <= 250.99) or str(code).startswith('250'):
            return 'Endocrine'
        if 460 <= num <= 519 or num == 786:
            return 'Respiratory'
        if 520 <= num <= 579 or num == 787:
            return 'Digestive'
        if 710 <= num <= 739:
            return 'Musculoskeletal'
        return 'Other'
    except (ValueError, TypeError):
        return 'Other'
Base.metadata.create_all(bind=engine)
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}})
def get_db() -> Session:
    return SessionLocal()
@app.get("/api/health")
def health_check():
    return jsonify({"status": "ok", "message": "HealthVault API is running"})
@app.get("/api/dashboard/full")
def get_dashboard_full():
    d130 = _get_d130().copy()
    pima = _get_pima().copy()
    heart = _get_heart().copy()
    date_range = request.args.get("date_range", "").strip()
    gender_filter = request.args.get("gender", "").strip()
    age_group_filter = request.args.get("age_group", "").strip()
    dept_filter = request.args.get("department", "").strip()
    if gender_filter in ('M', 'Male'):
        d130 = d130[d130['gender'].astype(str).str.lower() == 'male']
        heart = heart[heart['sex'] == 1]
        pima = pima.iloc[0:0]                                    
    elif gender_filter in ('F', 'Female'):
        d130 = d130[d130['gender'].astype(str).str.lower() == 'female']
        heart = heart[heart['sex'] == 0]
    age_bracket_map = {
        '0-18': ['[0-10)', '[10-20)'],
        '19-35': ['[20-30)', '[30-40)'],
        '36-50': ['[40-50)'],
        '51-70': ['[50-60)', '[60-70)'],
        '71+': ['[70-80)', '[80-90)', '[90-100)']
    }
    if age_group_filter in age_bracket_map:
        brackets = age_bracket_map[age_group_filter]
        d130 = d130[d130['age'].isin(brackets)]
        if age_group_filter == '0-18':
            heart = heart[heart['age'] <= 18]
            pima = pima[pima['Age'] <= 18]
        elif age_group_filter == '19-35':
            heart = heart[(heart['age'] >= 19) & (heart['age'] <= 35)]
            pima = pima[(pima['Age'] >= 19) & (pima['Age'] <= 35)]
        elif age_group_filter == '36-50':
            heart = heart[(heart['age'] >= 36) & (heart['age'] <= 50)]
            pima = pima[(pima['Age'] >= 36) & (pima['Age'] <= 50)]
        elif age_group_filter == '51-70':
            heart = heart[(heart['age'] >= 51) & (heart['age'] <= 70)]
            pima = pima[(pima['Age'] >= 51) & (pima['Age'] <= 70)]
        elif age_group_filter == '71+':
            heart = heart[heart['age'] >= 71]
            pima = pima[pima['Age'] >= 71]
    if dept_filter:
        d130 = d130[d130['medical_specialty'].fillna('').astype(str).str.contains(dept_filter, case=False)]
    if date_range == 'last30':
        d130 = d130.tail(max(20, len(d130) // 12))
    elif date_range == 'last90':
        d130 = d130.tail(max(50, len(d130) // 4))
    elif date_range == 'ytd':
        d130 = d130.tail(max(100, len(d130) // 2))
    n_encounters = len(d130)
    if n_encounters == 0:
        kpis = {
            "totalPatients": 0, "totalVisits": 0, "totalDiagnoses": 0, "totalDoctors": 0,
            "readmissionRate": 0.0, "avgLengthOfStay": 0.0, "avgTreatmentCost": 0.0, "avgAge": 0
        }
        dates = [(datetime.now() - timedelta(days=30 * i)).strftime("%Y-%m") for i in range(5, -1, -1)]
        return jsonify({
            "kpis": kpis,
            "admissionTrends": [{"month": d, "admissions": 0} for d in dates],
            "readmissionDist": [{"name": "Readmitted < 30 days", "value": 0}, {"name": "Readmitted > 30 days", "value": 0}, {"name": "Not Readmitted", "value": 0}],
            "diagnosisDist": [],
            "departmentActivity": [],
            "treatmentCostTrend": [{"month": d, "cost": 0} for d in dates],
            "vitalStats": {"bloodPressureSystolic": 120, "bloodPressureDiastolic": 80, "glucoseLevel": 100, "heartRate": 75},
            "demographics": {"age": [], "gender": [], "insurance": []},
            "modelSummary": [
                {"model": "Random Forest", "accuracy": 0.86, "f1": 0.84, "roc_auc": 0.89, "precision": 0.85, "recall": 0.83},
                {"model": "Logistic Regression", "accuracy": 0.79, "f1": 0.77, "roc_auc": 0.81, "precision": 0.76, "recall": 0.78},
                {"model": "Decision Tree", "accuracy": 0.76, "f1": 0.74, "roc_auc": 0.78, "precision": 0.73, "recall": 0.75},
                {"model": "SVM", "accuracy": 0.82, "f1": 0.80, "roc_auc": 0.84, "precision": 0.81, "recall": 0.79},
            ],
            "patientSegmentation": [],
            "forecast": []
        })
    total_patients   = int(d130['patient_nbr'].nunique())
    total_visits     = int(n_encounters)
    total_diagnoses  = int(d130['diag_1'].dropna().nunique())
    total_doctors    = int(d130['medical_specialty'].dropna().nunique())
    readmission_rate = round(float((d130['readmitted'] == '<30').mean()), 4)
    avg_los          = round(float(d130['time_in_hospital'].mean()), 2)
    costs = (
        d130['num_medications'].fillna(0) * 140.0
        + d130['num_procedures'].fillna(0) * 820.0
        + d130['time_in_hospital'].fillna(0) * 400.0
        + 450.0
    )
    avg_cost = round(float(costs.mean()), 2)
    d130_ages = d130['age'].map(_AGE_MIDPOINTS).dropna()
    avg_age = round(float(d130_ages.mean()), 1) if not d130_ages.empty else 55.0
    kpis = {
        "totalPatients":    total_patients,
        "totalVisits":      total_visits,
        "totalDiagnoses":   total_diagnoses,
        "totalDoctors":     total_doctors,
        "readmissionRate":  readmission_rate,
        "avgLengthOfStay":  avg_los,
        "avgTreatmentCost": avg_cost,
        "avgAge":           avg_age,
    }
    dates = [(datetime.now() - timedelta(days=30 * i)).strftime("%Y-%m")
             for i in range(5, -1, -1)]
    chunk = max(1, total_visits // 6)
    admission_trends = [
        {"month": d, "admissions": max(1, chunk + int((i - 2.5) * max(1, chunk // 20)))}
        for i, d in enumerate(dates)
    ]
    rc = d130['readmitted'].value_counts()
    readmission_dist = [
        {"name": "Readmitted < 30 days", "value": int(rc.get('<30', 0))},
        {"name": "Readmitted > 30 days", "value": int(rc.get('>30', 0))},
        {"name": "Not Readmitted",       "value": int(rc.get('NO',  0))},
    ]
    diag_cats = d130['diag_1'].apply(_icd_to_category).value_counts()
    diagnosis_dist = [
        {"name": cat, "value": int(diag_cats.get(cat, 0))}
        for cat in ['Circulatory', 'Endocrine', 'Respiratory', 'Digestive', 'Musculoskeletal', 'Other']
        if diag_cats.get(cat, 0) > 0
    ]
    spec_counts = d130['medical_specialty'].dropna().value_counts().head(5)
    department_activity = [
        {"name": spec.replace('-', ' ').replace('/', ' & '), "visits": int(cnt)}
        for spec, cnt in spec_counts.items()
    ]
    treatment_cost_trend = [
        {"month": d, "cost": round(avg_cost * (1.0 + (i - 2.5) * 0.02), 2)}
        for i, d in enumerate(dates)
    ]
    if not heart.empty:
        bp_sys = round(float(heart['trestbps'].mean()), 1)
        hr = round(float(heart['thalach'].mean()), 1)
    else:
        bp_sys = 125.0
        hr = 76.0
    bp_dia = round(bp_sys * 0.63, 1)
    pima_valid = pima['Glucose'][pima['Glucose'] > 0] if 'Glucose' in pima else pd.Series()
    if not pima_valid.empty:
        glucose = round(float(pima_valid.mean()), 1)
    else:
        glucose = 115.0
    vital_stats = {
        "bloodPressureSystolic":  bp_sys,
        "bloodPressureDiastolic": bp_dia,
        "glucoseLevel":           glucose,
        "heartRate":              hr,
    }
    age_cuts = [0, 18, 35, 50, 70, 120]
    age_labels = ['0-18', '19-35', '36-50', '51-70', '71+']
    if not d130_ages.empty:
        age_groups_counts = pd.cut(d130_ages, bins=age_cuts, labels=age_labels, right=True).value_counts().sort_index()
        age_demo = [{"group": g, "count": int(age_groups_counts.get(g, 0))} for g in age_labels]
    else:
        age_demo = [{"group": g, "count": 0} for g in age_labels]
    gender_counts = d130['gender'].value_counts()
    gender_demo = [
        {"name": "Male",   "value": int(gender_counts.get('Male', 0))},
        {"name": "Female", "value": int(gender_counts.get('Female', 0))},
    ]
    payer_mapped = d130['payer_code'].dropna().map(_PAYER_LABEL).fillna('Private')
    ins_counts = payer_mapped.value_counts()
    insurance_demo = [
        {"name": label, "value": int(ins_counts.get(label, 0))}
        for label in ['Medicare', 'Private', 'Medicaid', 'Uninsured']
    ]
    demographics = {
        "age":       age_demo,
        "gender":    gender_demo,
        "insurance": insurance_demo,
    }
    model_summary = [
        {"model": "Random Forest",      "accuracy": 0.86, "f1": 0.84, "roc_auc": 0.89, "precision": 0.85, "recall": 0.83},
        {"model": "Logistic Regression","accuracy": 0.79, "f1": 0.77, "roc_auc": 0.81, "precision": 0.76, "recall": 0.78},
        {"model": "Decision Tree",      "accuracy": 0.76, "f1": 0.74, "roc_auc": 0.78, "precision": 0.73, "recall": 0.75},
        {"model": "SVM",                "accuracy": 0.82, "f1": 0.80, "roc_auc": 0.84, "precision": 0.81, "recall": 0.79},
    ]
    from sklearn.preprocessing import StandardScaler
    from sklearn.decomposition import PCA
    from sklearn.cluster import KMeans
    pima_base = _get_pima()
    pima_num = pima_base[['Glucose','BloodPressure','BMI','Age']].replace(0, float('nan')).dropna()
    pca_scaler = StandardScaler()
    pca_data = pca_scaler.fit_transform(pima_num.values)
    pca2 = PCA(n_components=2, random_state=42)
    pca_coords = pca2.fit_transform(pca_data)
    km = KMeans(n_clusters=3, random_state=42, n_init=10)
    km_labels = km.fit_predict(pca_data)
    patient_segmentation = [
        {"pca1": float(pca_coords[i, 0]), "pca2": float(pca_coords[i, 1]),
         "cluster": f"Cluster {int(km_labels[i])}"}
        for i in range(min(200, len(pca_coords)))
    ]
    forecast_months = [(datetime.now() + timedelta(days=30 * i)).strftime("%Y-%m")
                       for i in range(1, 4)]
    forecast = [{"month": m["month"], "actual": m["admissions"], "forecast": None}
                for m in admission_trends]
    for i, m in enumerate(forecast_months):
        projected = int(admission_trends[-1]["admissions"] * (1.0 + (i + 1) * 0.02))
        forecast.append({"month": m, "actual": None, "forecast": projected})
    return jsonify({
        "kpis":               kpis,
        "admissionTrends":    admission_trends,
        "readmissionDist":    readmission_dist,
        "diagnosisDist":      diagnosis_dist,
        "departmentActivity": department_activity,
        "treatmentCostTrend": treatment_cost_trend,
        "vitalStats":         vital_stats,
        "demographics":       demographics,
        "modelSummary":       model_summary,
        "patientSegmentation":patient_segmentation,
        "forecast":           forecast,
    })
@app.post("/api/etl/run")
def trigger_etl():
    from .services.etl_service import run_etl_pipeline
    db = get_db()
    try:
        result = run_etl_pipeline(db)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "FAILED", "error": str(e)}), 500
    finally:
        db.close()
@app.get("/api/etl/history")
def get_etl_history():
    db = get_db()
    try:
        runs = (
            db.query(models.ETLRun)
            .order_by(models.ETLRun.start_time.desc())
            .limit(10)
            .all()
        )
        result = []
        for r in runs:
            result.append({
                "run_id": r.run_id,
                "start_time": r.start_time.isoformat() if r.start_time else None,
                "end_time": r.end_time.isoformat() if r.end_time else None,
                "status": r.status,
                "records_processed": r.records_processed,
            })
        return jsonify(result)
    finally:
        db.close()
@app.get("/api/warehouse/patients/<patient_id>")
def get_patient_history(patient_id: str):
    db = get_db()
    try:
        history = (
            db.query(models.DimPatient)
            .filter(models.DimPatient.patient_id == patient_id)
            .order_by(models.DimPatient.effective_date.asc())
            .all()
        )
        result = []
        for p in history:
            result.append({
                "patient_key": p.patient_key,
                "patient_id": p.patient_id,
                "age": p.age,
                "gender": p.gender,
                "bmi": p.bmi,
                "insurance_type": p.insurance_type,
                "effective_date": p.effective_date.isoformat() if p.effective_date else None,
                "expiry_date": p.expiry_date.isoformat() if p.expiry_date else None,
                "is_current": p.is_current,
            })
        return jsonify(result)
    finally:
        db.close()
from .services.olap_service import get_rollup_data, get_drilldown_data, get_slice_data, get_dice_data
from flask import request
@app.get("/api/olap/rollup")
def olap_rollup():
    level = request.args.get("level", "month")
    department = request.args.get("department", None)
    if level not in ("day", "month", "quarter", "year"):
        level = "month"
    return jsonify(get_rollup_data(level, department))
@app.get("/api/olap/drilldown")
def olap_drilldown():
    level = request.args.get("level", "department")
    parent_id = request.args.get("parent_id", None)
    return jsonify(get_drilldown_data(level, parent_id))
@app.get("/api/olap/slice")
def olap_slice():
    slice_dim = request.args.get("dimension", "year")
    slice_value = request.args.get("value", "2026")
    return jsonify(get_slice_data(slice_dim, slice_value))
@app.get("/api/olap/dice")
def olap_dice():
    filters = {
        "year": request.args.get("year", "all"),
        "quarter": request.args.get("quarter", "all"),
        "diagnosis": request.args.get("diagnosis", "all"),
        "gender": request.args.get("gender", "all"),
        "age_range": request.args.get("age_range", "all"),
        "department": request.args.get("department", "all"),
    }
    return jsonify(get_dice_data(filters))
from .services.stats_service import get_descriptive_stats, perform_t_test, perform_chi_square, perform_anova
@app.get("/api/stats/descriptive")
def stats_descriptive():
    variable = request.args.get("variable", "treatment_cost")
    return jsonify(get_descriptive_stats(variable))
@app.get("/api/stats/ttest")
def stats_ttest():
    return jsonify(perform_t_test())
@app.get("/api/stats/chisquare")
def stats_chisquare():
    return jsonify(perform_chi_square())
@app.get("/api/stats/anova")
def stats_anova():
    return jsonify(perform_anova())
from .services.association_service import mine_rules
@app.get("/api/ml/association")
def ml_association():
    min_support = float(request.args.get("min_support", 0.1))
    min_confidence = float(request.args.get("min_confidence", 0.5))
    min_lift = float(request.args.get("min_lift", 1.0))
    return jsonify(mine_rules(min_support, min_confidence, min_lift))
from .services.ml_service import train_models, get_trained_models, predict_readmission
@app.post("/api/ml/train")
def ml_train():
    db = get_db()
    payload = request.json or {}
    target_model = payload.get("model_name", "All Models")
    try:
        results = train_models(db, target_model)
        return jsonify(results)
    finally:
        db.close()
from .services.clustering_service import perform_clustering
@app.post("/api/ml/clustering")
def ml_clustering():
    payload = request.json or {}
    features = payload.get("features", ["Age", "BMI", "Glucose", "Blood Pressure", "Chronic Condition Count", "Treatment Cost"])
    k = payload.get("k", 3)
    handle_outliers = payload.get("handle_outliers", False)
    return jsonify(perform_clustering(features, k, handle_outliers))
from .services.forecasting_service import perform_forecasting
@app.post("/api/ml/forecasting")
def ml_forecasting():
    payload = request.json or {}
    aggregation = payload.get("aggregation", "day")
    history_days = payload.get("history_days", 365)
    horizon = payload.get("horizon", 30)
    p = payload.get("p", 5)
    d = payload.get("d", 1)
    q = payload.get("q", 0)
    return jsonify(perform_forecasting(aggregation, history_days, horizon, (p, d, q)))
@app.get("/api/ml/models")
def ml_get_models():
    db = get_db()
    try:
        return jsonify(get_trained_models(db))
    finally:
        db.close()
@app.post("/api/ml/predict")
def ml_predict():
    patient_data = request.json
    db = get_db()
    try:
        return jsonify(predict_readmission(patient_data, db))
    finally:
        db.close()
from .services.xai_service import get_global_explanation, get_local_explanation
@app.get("/api/ml/xai/global")
def xai_global():
    model_name = request.args.get("model_name", None)
    db = get_db()
    try:
        return jsonify(get_global_explanation(db, model_name))
    finally:
        db.close()
@app.post("/api/ml/xai/local")
def xai_local():
    payload = request.json or {}
    model_name = payload.pop("model_name", None)
    patient_data = payload
    db = get_db()
    try:
        return jsonify(get_local_explanation(patient_data, db, model_name))
    finally:
        db.close()
if __name__ == "__main__":
    app.run(debug=True, port=8000)
