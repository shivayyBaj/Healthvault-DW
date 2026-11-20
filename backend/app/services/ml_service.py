import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sqlalchemy.orm import Session
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, roc_curve
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from imblearn.pipeline import Pipeline as ImbPipeline
from imblearn.over_sampling import SMOTE
from ..models import ModelMetadata
from .data_loader import load_diabetes_130, load_pima_diabetes, load_heart_disease
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models_storage")
os.makedirs(MODEL_DIR, exist_ok=True)
_AGE_MIDPOINTS = {
    '[0-10)': 5, '[10-20)': 15, '[20-30)': 25, '[30-40)': 35,
    '[40-50)': 45, '[50-60)': 55, '[60-70)': 65, '[70-80)': 75,
    '[80-90)': 85, '[90-100)': 95
}
def map_icd_category(code):
    if pd.isna(code):
        return 'Other'
    code_str = str(code).strip()
    try:
        num = float(code_str)
        if 390 <= num <= 459 or num == 785:
            return 'Circulatory'
        elif 250 <= num <= 250.99 or code_str.startswith('250'):
            return 'Endocrine'
        elif 460 <= num <= 519 or num == 786:
            return 'Respiratory'
        elif 520 <= num <= 579 or num == 787:
            return 'Digestive'
        else:
            return 'Other'
    except (ValueError, TypeError):
        return 'Other'
def map_department(specialty):
    if pd.isna(specialty) or specialty == '?':
        return 'Internal Medicine'
    spec = str(specialty).lower()
    if 'cardio' in spec:
        return 'Cardiology'
    elif 'ortho' in spec:
        return 'Orthopedics'
    elif 'neuro' in spec:
        return 'Neurology'
    elif 'emerg' in spec or 'trauma' in spec:
        return 'Emergency'
    else:
        return 'Internal Medicine'
def map_insurance(payer):
    if pd.isna(payer) or payer == '?':
        return 'Private'
    payer = str(payer).upper().strip()
    if payer == 'MC':
        return 'Medicare'
    elif payer == 'MD':
        return 'Medicaid'
    elif payer in ('SP', 'UN'):
        return 'Uninsured'
    else:
        return 'Private'
def load_real_prediction_data(n=2000):
    """
    Extracts feature matrix directly from real-world datasets:
    - Diabetes 130-US Hospitals (demographics, LOS, diagnoses, specialties, readmission)
    - Pima Indians Diabetes (BMI, glucose distributions)
    - UCI Heart Disease (blood pressure, heart rate)
    """
    d130 = load_diabetes_130()
    pima = load_pima_diabetes()
    heart = load_heart_disease()
    sample_d130 = d130.head(min(n, len(d130))).copy().reset_index(drop=True)
    n_records = len(sample_d130)
    pima_bmis = pima['BMI'].replace(0, np.nan).dropna().values
    pima_glucose = pima['Glucose'].replace(0, np.nan).dropna().values
    heart_bp = heart['trestbps'].dropna().values
    heart_hr = heart['thalach'].dropna().values
    data = []
    for i, row in sample_d130.iterrows():
        age = _AGE_MIDPOINTS.get(str(row['age']), 55)
        gender = 'Male' if str(row['gender']).lower() == 'male' else 'Female'
        bmi = float(pima_bmis[i % len(pima_bmis)])
        if row['max_glu_serum'] == '>200':
            glu = 245.0
        elif row['max_glu_serum'] == '>300':
            glu = 325.0
        elif row['max_glu_serum'] == 'Norm':
            glu = 95.0
        else:
            glu = float(pima_glucose[i % len(pima_glucose)])
        bp_sys = float(heart_bp[i % len(heart_bp)])
        heart_rate = float(heart_hr[i % len(heart_hr)])
        los = int(row['time_in_hospital']) if pd.notna(row['time_in_hospital']) else 4
        chronic_cond = int(row['number_diagnoses']) if pd.notna(row['number_diagnoses']) else 2
        prev_adm = int(row['number_inpatient']) if pd.notna(row['number_inpatient']) else 0
        insurance = map_insurance(row['payer_code'])
        diagnosis = map_icd_category(row['diag_1'])
        dept = map_department(row['medical_specialty'])
        readmitted = 1 if str(row['readmitted']).strip() == '<30' else 0
        data.append({
            'age': age,
            'gender': gender,
            'bmi': bmi,
            'glucose': glu,
            'bp_sys': bp_sys,
            'heart_rate': heart_rate,
            'los': los,
            'chronic_conditions': chronic_cond,
            'prev_admissions': prev_adm,
            'insurance': insurance,
            'diagnosis': diagnosis,
            'department': dept,
            'readmitted': readmitted
        })
    df = pd.DataFrame(data)
    return df
def generate_prediction_data(n=1000):
    """Backward compatibility alias that loads real-world clinical dataset."""
    return load_real_prediction_data(n)
def build_preprocessor():
    numeric_features = ['age', 'bmi', 'glucose', 'bp_sys', 'heart_rate', 'los', 'chronic_conditions', 'prev_admissions']
    categorical_features = ['gender', 'insurance', 'diagnosis', 'department']
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])
    return preprocessor
def train_models(db: Session, target_model: str = None):
    df = load_real_prediction_data(2000)
    X = df.drop('readmitted', axis=1)
    y = df['readmitted']
    preprocessor = build_preprocessor()
    all_models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, class_weight='balanced'),
        'KNN': KNeighborsClassifier(n_neighbors=5),
        'Naive Bayes': GaussianNB(),
        'Decision Tree': DecisionTreeClassifier(max_depth=5, class_weight='balanced'),
        'Random Forest': RandomForestClassifier(n_estimators=100, max_depth=5, class_weight='balanced', random_state=42),
        'SVM': SVC(probability=True, class_weight='balanced', random_state=42)
    }
    if target_model and target_model in all_models and target_model != "All Models":
        models = {target_model: all_models[target_model]}
    else:
        models = all_models
    results = []
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    for name, model in models.items():
        X_train_prep = preprocessor.fit_transform(X_train)
        X_test_prep = preprocessor.transform(X_test)
        if hasattr(X_train_prep, "toarray"):
            X_train_prep = X_train_prep.toarray()
            X_test_prep = X_test_prep.toarray()
        if y_train.sum() >= 6:
            smote = SMOTE(random_state=42)
            X_train_res, y_train_res = smote.fit_resample(X_train_prep, y_train)
        else:
            X_train_res, y_train_res = X_train_prep, y_train
        model.fit(X_train_res, y_train_res)
        y_pred = model.predict(X_test_prep)
        y_prob = model.predict_proba(X_test_prep)[:, 1] if hasattr(model, 'predict_proba') else y_pred
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        try:
            roc = float(roc_auc_score(y_test, y_prob))
        except Exception:
            roc = 0.5
        cm = confusion_matrix(y_test, y_pred).tolist()
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        prev_model = db.query(ModelMetadata).filter(ModelMetadata.model_name == name).order_by(ModelMetadata.version.desc()).first()
        version = prev_model.version + 1 if prev_model else 1
        filepath = os.path.join(MODEL_DIR, f"{name.replace(' ', '_').lower()}_v{version}.pkl")
        full_pipeline = ImbPipeline([
            ('preprocessor', preprocessor),
            ('classifier', model)
        ])
        full_pipeline.fit(X, y)
        joblib.dump(full_pipeline, filepath)
        meta = ModelMetadata(
            model_name=name,
            version=version,
            accuracy=acc,
            precision=prec,
            recall=rec,
            f1_score=f1,
            roc_auc=roc,
            filepath=filepath,
            is_active=(name == 'Random Forest')                       
        )
        db.add(meta)
        results.append({
            "model_name": name,
            "version": version,
            "metrics": {
                "accuracy": acc,
                "precision": prec,
                "recall": rec,
                "f1_score": f1,
                "roc_auc": roc
            },
            "confusion_matrix": cm,
            "roc_curve": {"fpr": fpr.tolist(), "tpr": tpr.tolist()}
        })
    db.commit()
    return results
def get_trained_models(db: Session):
    models = db.query(ModelMetadata).order_by(ModelMetadata.model_name, ModelMetadata.version.desc()).all()
    res = []
    seen = set()
    for m in models:
        if m.model_name not in seen:
            seen.add(m.model_name)
            res.append({
                "id": m.id,
                "model_name": m.model_name,
                "version": m.version,
                "accuracy": m.accuracy,
                "precision": m.precision,
                "recall": m.recall,
                "f1_score": m.f1_score,
                "roc_auc": m.roc_auc,
                "trained_at": m.trained_at.isoformat() if m.trained_at else None,
                "is_active": m.is_active
            })
    return res
def predict_readmission(patient_data: dict, db: Session):
    active_meta = db.query(ModelMetadata).filter(ModelMetadata.is_active == True).first()
    if not active_meta:
        active_meta = db.query(ModelMetadata).order_by(ModelMetadata.id.desc()).first()
    if not active_meta or not os.path.exists(active_meta.filepath):
        return {"error": "No trained model found. Please train models first."}
    model = joblib.load(active_meta.filepath)
    df = pd.DataFrame([patient_data])
    pred = model.predict(df)[0]
    prob = model.predict_proba(df)[0][1] if hasattr(model, 'predict_proba') else float(pred)
    return {
        "model_used": f"{active_meta.model_name} (v{active_meta.version})",
        "predicted_class": int(pred),
        "probability": float(prob),
        "risk_level": "High" if prob >= 0.7 else "Medium" if prob >= 0.4 else "Low"
    }
