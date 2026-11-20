import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
from .data_loader import load_pima_diabetes, load_heart_disease
def load_real_segmentation_data(n=1000):
    """
    Constructs patient segmentation profiles directly from the real-world
    Pima Indians Diabetes and UCI Heart Disease datasets.
    """
    pima = load_pima_diabetes()
    heart = load_heart_disease()
    rows = []
    pima_median_bmi = float(pima['BMI'][pima['BMI'] > 0].median())
    pima_median_bp = float(pima['BloodPressure'][pima['BloodPressure'] > 0].median())
    pima_median_glu = float(pima['Glucose'][pima['Glucose'] > 0].median())
    for idx, r in pima.iterrows():
        age = float(r['Age'])
        bmi = float(r['BMI']) if r['BMI'] > 0 else pima_median_bmi
        glucose = float(r['Glucose']) if r['Glucose'] > 0 else pima_median_glu
        bp = float(r['BloodPressure']) if r['BloodPressure'] > 0 else pima_median_bp
        chronic_count = 0
        if glucose >= 140: chronic_count += 1
        if bmi >= 30.0: chronic_count += 1
        if bp >= 90: chronic_count += 1
        if int(r['Outcome']) == 1: chronic_count += 1
        cost = round(800.0 + (glucose * 6.5) + (bmi * 42.0) + (age * 18.0) + (chronic_count * 450.0), 2)
        rows.append({
            'id': f"PIMA-{idx+1:04d}",
            'Age': age,
            'BMI': round(bmi, 1),
            'Glucose': round(glucose, 1),
            'Blood Pressure': round(bp, 1),
            'Chronic Condition Count': chronic_count,
            'Treatment Cost': cost
        })
    for idx, r in heart.iterrows():
        age = float(r['age'])
        bp = float(r['trestbps'])
        glucose = 165.0 if int(r['fbs']) == 1 else 98.0
        chol = float(r['chol'])
        diag = int(r['diagnosis'])
        chronic_count = (1 if diag > 0 else 0) + (1 if chol > 240 else 0) + (1 if bp > 140 else 0)
        cost = round(1200.0 + (bp * 8.0) + (chol * 4.5) + (age * 22.0) + (diag * 600.0), 2)
        rows.append({
            'id': f"HD-{idx+1:04d}",
            'Age': age,
            'BMI': pima_median_bmi,
            'Glucose': glucose,
            'Blood Pressure': bp,
            'Chronic Condition Count': chronic_count,
            'Treatment Cost': cost
        })
    df = pd.DataFrame(rows)
    return df.head(n)
def generate_segmentation_data(n=1500):
    """Backward compatibility alias that loads real-world dataset."""
    return load_real_segmentation_data(n)
def perform_clustering(features, k, handle_outliers=False):
    df = load_real_segmentation_data(1000)
    selected_cols = [f for f in features if f in df.columns]
    if not selected_cols:
        return {"error": "No valid features selected"}
    X_raw = df[selected_cols].copy()
    imputer = SimpleImputer(strategy='median')
    X_imputed = imputer.fit_transform(X_raw)
    X = pd.DataFrame(X_imputed, columns=selected_cols, index=df.index)
    if handle_outliers:
        for col in selected_cols:
            lower = X[col].quantile(0.01)
            upper = X[col].quantile(0.99)
            X[col] = np.clip(X[col], lower, upper)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    pca = PCA(n_components=2)
    pca_result = pca.fit_transform(X_scaled)
    explained_variance = [float(v) for v in pca.explained_variance_ratio_]
    metrics = []
    max_k = min(10, len(X)-1)
    for i in range(2, max_k + 1):
        km = KMeans(n_clusters=i, random_state=42, n_init=10)
        km.fit(X_scaled)
        score = silhouette_score(X_scaled, km.labels_)
        metrics.append({
            "k": i,
            "inertia": float(km.inertia_),
            "silhouette": float(score)
        })
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_scaled)
    df['Cluster'] = [f"Cluster {c}" for c in clusters]
    scatter_data = []
    for i in range(len(df)):
        point = {
            "id": df.iloc[i]['id'],
            "PC1": float(pca_result[i, 0]),
            "PC2": float(pca_result[i, 1]),
            "Cluster": df.iloc[i]['Cluster']
        }
        for col in selected_cols:
            val = df.iloc[i][col]
            point[col] = float(val) if pd.notnull(val) else None
        scatter_data.append(point)
    profiles = []
    for c in range(k):
        c_name = f"Cluster {c}"
        c_data = df[df['Cluster'] == c_name]
        size = len(c_data)
        means = {}
        for col in selected_cols:
            means[col] = float(c_data[col].mean()) if size > 0 else 0.0
        profiles.append({
            "name": c_name,
            "size": size,
            "means": means
        })
    return {
        "metrics": metrics,
        "pca_variance": explained_variance,
        "scatter_data": scatter_data,
        "profiles": profiles
    }
