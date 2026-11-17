import random
import json
from datetime import datetime, timedelta
from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy.orm import Session

from .database import engine, Base, SessionLocal
from . import models

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}})


def get_db() -> Session:
    return SessionLocal()


# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    return jsonify({"status": "ok", "message": "HealthVault API is running"})


# ─── Dashboard ────────────────────────────────────────────────────────────────

@app.get("/api/dashboard/full")
def get_dashboard_full():
    dates = [(datetime.now() - timedelta(days=30 * i)).strftime("%Y-%m") for i in range(5, -1, -1)]

    kpis = {
        "totalPatients": 5420,
        "totalVisits": 12840,
        "totalDiagnoses": 350,
        "totalDoctors": 142,
        "readmissionRate": 0.185,
        "avgLengthOfStay": 4.2,
        "avgTreatmentCost": 4250.75,
        "avgAge": 54.3,
    }

    admission_trends = [{"month": d, "admissions": random.randint(800, 1200)} for d in dates]

    readmission_dist = [
        {"name": "Readmitted", "value": 2375},
        {"name": "Not Readmitted", "value": 10465},
    ]

    diagnosis_dist = [
        {"name": "Circulatory", "value": 4500},
        {"name": "Respiratory", "value": 3200},
        {"name": "Endocrine", "value": 2800},
        {"name": "Digestive", "value": 1500},
        {"name": "Other", "value": 840},
    ]

    department_activity = [
        {"name": "Cardiology", "visits": 3800},
        {"name": "Internal Medicine", "visits": 3100},
        {"name": "Endocrinology", "visits": 2400},
        {"name": "Neurology", "visits": 1900},
        {"name": "Orthopedics", "visits": 1640},
    ]

    treatment_cost_trend = [{"month": d, "cost": random.randint(3000, 6000)} for d in dates]

    vital_stats = {
        "bloodPressureSystolic": 128,
        "bloodPressureDiastolic": 82,
        "glucoseLevel": 110.5,
        "heartRate": 76,
    }

    demographics = {
        "age": [
            {"group": "0-18", "count": 450},
            {"group": "19-35", "count": 1200},
            {"group": "36-50", "count": 1800},
            {"group": "51-70", "count": 2500},
            {"group": "71+", "count": 1470},
        ],
        "gender": [
            {"name": "Male", "value": 2600},
            {"name": "Female", "value": 2820},
        ],
        "insurance": [
            {"name": "Medicare", "value": 2100},
            {"name": "Private", "value": 1800},
            {"name": "Medicaid", "value": 1100},
            {"name": "Uninsured", "value": 420},
        ],
    }

    model_summary = [
        {"model": "Random Forest", "accuracy": 0.86, "f1": 0.84, "roc_auc": 0.89, "precision": 0.85, "recall": 0.83},
        {"model": "Logistic Regression", "accuracy": 0.79, "f1": 0.77, "roc_auc": 0.81, "precision": 0.76, "recall": 0.78},
        {"model": "XGBoost", "accuracy": 0.88, "f1": 0.87, "roc_auc": 0.91, "precision": 0.86, "recall": 0.88},
        {"model": "SVM", "accuracy": 0.82, "f1": 0.80, "roc_auc": 0.84, "precision": 0.81, "recall": 0.79},
    ]

    patient_segmentation = []
    for _ in range(100):
        cluster = random.choice([0, 1, 2])
        base_x, base_y = {0: (-2, -2), 1: (2, 2), 2: (-2, 2)}[cluster]
        patient_segmentation.append({
            "pca1": base_x + random.uniform(-1, 1),
            "pca2": base_y + random.uniform(-1, 1),
            "cluster": f"Cluster {cluster}",
        })

    forecast_future = [(datetime.now() + timedelta(days=30 * i)).strftime("%Y-%m") for i in range(1, 4)]
    forecast = [{"month": m["month"], "actual": m["admissions"], "forecast": None} for m in admission_trends]
    for m in forecast_future:
        forecast.append({"month": m, "actual": None, "forecast": random.randint(900, 1300)})

    return jsonify({
        "kpis": kpis,
        "admissionTrends": admission_trends,
        "readmissionDist": readmission_dist,
        "diagnosisDist": diagnosis_dist,
        "departmentActivity": department_activity,
        "treatmentCostTrend": treatment_cost_trend,
        "vitalStats": vital_stats,
        "demographics": demographics,
        "modelSummary": model_summary,
        "patientSegmentation": patient_segmentation,
        "forecast": forecast,
    })


# ─── ETL ──────────────────────────────────────────────────────────────────────

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


# ─── Warehouse ────────────────────────────────────────────────────────────────

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


# ─── OLAP ─────────────────────────────────────────────────────────────────────

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


# ─── STATS ────────────────────────────────────────────────────────────────────

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


# ─── ASSOCIATION RULES ────────────────────────────────────────────────────────

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

# ─── CLUSTERING (SEGMENTATION) ─────────────────────────────────────────────────

from .services.clustering_service import perform_clustering

@app.post("/api/ml/clustering")
def ml_clustering():
    payload = request.json or {}
    features = payload.get("features", ["Age", "BMI", "Glucose", "Blood Pressure", "Chronic Condition Count", "Treatment Cost"])
    k = payload.get("k", 3)
    handle_outliers = payload.get("handle_outliers", False)
    
    return jsonify(perform_clustering(features, k, handle_outliers))

# ─── FORECASTING ───────────────────────────────────────────────────────────────

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

# ─── XAI ──────────────────────────────────────────────────────────────────────

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

