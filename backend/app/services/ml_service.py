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
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, roc_curve, classification_report
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from imblearn.pipeline import Pipeline as ImbPipeline
from imblearn.over_sampling import SMOTE

from ..models import ModelMetadata

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models_storage")
os.makedirs(MODEL_DIR, exist_ok=True)

def generate_prediction_data(n=1000):
    np.random.seed(42)
    
    # Features
    age = np.random.randint(18, 90, n)
    gender = np.random.choice(['Male', 'Female'], n)
    bmi = np.random.uniform(18.5, 40.0, n)
    glucose = np.random.normal(120, 30, n)
    bp_sys = np.random.normal(130, 20, n)
    heart_rate = np.random.normal(75, 15, n)
    los = np.random.randint(1, 15, n)
    chronic_conditions = np.random.randint(0, 5, n)
    prev_admissions = np.random.randint(0, 4, n)
    insurance = np.random.choice(['Medicare', 'Medicaid', 'Private', 'Uninsured'], n)
    diagnosis = np.random.choice(['Circulatory', 'Endocrine', 'Respiratory', 'Digestive', 'Other'], n)
    department = np.random.choice(['Cardiology', 'Internal Medicine', 'Neurology', 'Orthopedics'], n)
    
    # Target (Readmission - 30 days) - Imbalanced (approx 15% positive)
    # Higher risk for older, higher prev_admissions, more chronic conditions, circulatory diagnosis
    risk = (age / 90) * 0.3 + (prev_admissions / 3) * 0.4 + (chronic_conditions / 4) * 0.2
    risk += np.where(diagnosis == 'Circulatory', 0.15, 0)
    risk += np.where(insurance == 'Uninsured', 0.1, 0)
    
    # Normalize risk to roughly 0-1 then apply threshold for ~15% prevalence
    threshold = np.percentile(risk, 85)
    readmitted = (risk >= threshold).astype(int)
    
    df = pd.DataFrame({
        'age': age,
        'gender': gender,
        'bmi': bmi,
        'glucose': glucose,
        'bp_sys': bp_sys,
        'heart_rate': heart_rate,
        'los': los,
        'chronic_conditions': chronic_conditions,
        'prev_admissions': prev_admissions,
        'insurance': insurance,
        'diagnosis': diagnosis,
        'department': department,
        'readmitted': readmitted
    })
    
    # Introduce some missing values to test imputation
    df.loc[np.random.choice(n, int(n*0.05)), 'bmi'] = np.nan
    df.loc[np.random.choice(n, int(n*0.02)), 'insurance'] = np.nan
    
    return df

def build_preprocessor():
    numeric_features = ['age', 'bmi', 'glucose', 'bp_sys', 'heart_rate', 'los', 'chronic_conditions', 'prev_admissions']
    categorical_features = ['gender', 'insurance', 'diagnosis', 'department']
    
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])
    
    return preprocessor

def train_models(db: Session, target_model: str = None):
    df = generate_prediction_data(2000)
    X = df.drop('readmitted', axis=1)
    y = df['readmitted']
    
    preprocessor = build_preprocessor()
    
    all_models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, class_weight='balanced'),
        'KNN': KNeighborsClassifier(n_neighbors=5),
        'Naive Bayes': GaussianNB(),
        'Decision Tree': DecisionTreeClassifier(max_depth=5, class_weight='balanced'),
        'Random Forest': RandomForestClassifier(n_estimators=100, max_depth=5, class_weight='balanced'),
        'SVM': SVC(probability=True, class_weight='balanced')
    }
    
    if target_model and target_model in all_models and target_model != "All Models":
        models = {target_model: all_models[target_model]}
    else:
        models = all_models
    
    results = []
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    for name, model in models.items():
        # Build pipeline using imblearn Pipeline so SMOTE is applied ONLY during training folds
        # Note: SMOTE happens after preprocessing because SMOTE requires numeric inputs
        # But we need preprocessor first. We can do preprocessor -> SMOTE -> Model
        # Wait, if we use GaussianNB, it doesn't accept sparse matrices from OneHotEncoder.
        # We can pass sparse_output=False to OneHotEncoder, but since we are doing manual train/test 
        # evaluation for the UI, let's keep it simple for the final save.
        
        # We will build a pipeline that includes SMOTE
        # Since OneHotEncoder outputs sparse by default, and SMOTE handles sparse, it's fine.
        # GaussianNB needs dense, so we will use a custom dense transformer or just not use SMOTE for NB,
        # but to keep it uniform, we'll use a standard sklearn pipeline for the final saved model,
        # and we apply SMOTE manually on the training set for evaluation to avoid issues.
        
        # Actually, ImbPipeline handles it perfectly if we make preprocessor output dense
        # We update the preprocessor above implicitly or explicitly.
        
        # Let's fit preprocessor on train
        X_train_prep = preprocessor.fit_transform(X_train)
        X_test_prep = preprocessor.transform(X_test)
        
        if hasattr(X_train_prep, "toarray"):
            X_train_prep = X_train_prep.toarray()
            X_test_prep = X_test_prep.toarray()
            
        # Apply SMOTE only on training data
        smote = SMOTE(random_state=42)
        X_train_res, y_train_res = smote.fit_resample(X_train_prep, y_train)
        
        # Train model
        model.fit(X_train_res, y_train_res)
        
        # Predict on Test data (No SMOTE!)
        y_pred = model.predict(X_test_prep)
        y_prob = model.predict_proba(X_test_prep)[:, 1] if hasattr(model, 'predict_proba') else y_pred
        
        # Metrics
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc = roc_auc_score(y_test, y_prob)
        cm = confusion_matrix(y_test, y_pred).tolist()
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        
        # Save Model Metadata to DB
        # Increment version
        prev_model = db.query(ModelMetadata).filter(ModelMetadata.model_name == name).order_by(ModelMetadata.version.desc()).first()
        version = prev_model.version + 1 if prev_model else 1
        
        filepath = os.path.join(MODEL_DIR, f"{name.replace(' ', '_').lower()}_v{version}.pkl")
        
        # Create full pipeline to save
        # We need a dense transformer for GaussianNB in pipeline
        full_pipeline = ImbPipeline([
            ('preprocessor', preprocessor),
            ('smote', SMOTE(random_state=42)),
            ('classifier', model)
        ])
        
        # Fit full pipeline on all data to save the production model
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
            is_active=(name == 'Random Forest') # Default active model
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
    # Deduplicate to show only latest version of each
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
    # Find active model
    active_meta = db.query(ModelMetadata).filter(ModelMetadata.is_active == True).first()
    if not active_meta:
        # Fallback to latest random forest or any
        active_meta = db.query(ModelMetadata).order_by(ModelMetadata.id.desc()).first()
        
    if not active_meta or not os.path.exists(active_meta.filepath):
        return {"error": "No trained model found. Please train models first."}
        
    model = joblib.load(active_meta.filepath)
    
    # Convert patient dict to DataFrame
    df = pd.DataFrame([patient_data])
    
    # Predict
    pred = model.predict(df)[0]
    prob = model.predict_proba(df)[0][1] if hasattr(model, 'predict_proba') else float(pred)
    
    return {
        "model_used": f"{active_meta.model_name} (v{active_meta.version})",
        "predicted_class": int(pred),
        "probability": float(prob),
        "risk_level": "High" if prob >= 0.7 else "Medium" if prob >= 0.4 else "Low",
        "disclaimer": "Educational model output — not a clinical assessment."
    }
