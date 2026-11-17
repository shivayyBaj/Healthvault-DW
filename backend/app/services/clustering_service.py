import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
import logging

def generate_segmentation_data(n=1500):
    np.random.seed(42)
    # Generate some distinct clusters roughly
    
    # Cluster 0: Older, higher chronic conditions, higher cost
    # Cluster 1: Younger, healthy, low cost
    # Cluster 2: Middle-aged, high BMI/glucose
    
    data = []
    for _ in range(n):
        c = np.random.choice([0, 1, 2], p=[0.3, 0.4, 0.3])
        if c == 0:
            age = np.random.normal(70, 8)
            bmi = np.random.normal(26, 3)
            glucose = np.random.normal(110, 15)
            bp = np.random.normal(140, 15)
            chronic = np.random.poisson(3)
            cost = np.random.normal(8000, 2000)
        elif c == 1:
            age = np.random.normal(30, 8)
            bmi = np.random.normal(23, 3)
            glucose = np.random.normal(90, 10)
            bp = np.random.normal(115, 10)
            chronic = np.random.poisson(0.5)
            cost = np.random.normal(1500, 500)
        else:
            age = np.random.normal(50, 10)
            bmi = np.random.normal(32, 4)
            glucose = np.random.normal(160, 25)
            bp = np.random.normal(135, 12)
            chronic = np.random.poisson(1.5)
            cost = np.random.normal(4000, 1500)
            
        data.append({
            'id': f"PT-{np.random.randint(10000, 99999)}",
            'Age': max(18, age),
            'BMI': max(15, bmi),
            'Glucose': max(60, glucose),
            'Blood Pressure': max(80, bp),
            'Chronic Condition Count': min(10, chronic),
            'Treatment Cost': max(500, cost)
        })
        
    df = pd.DataFrame(data)
    
    # Introduce some missing values
    for col in ['BMI', 'Glucose']:
        df.loc[df.sample(frac=0.02).index, col] = np.nan
        
    # Introduce a few outliers
    df.loc[df.sample(frac=0.01).index, 'Treatment Cost'] *= 5
    
    return df

def perform_clustering(features, k, handle_outliers=False):
    df = generate_segmentation_data(1000)
    
    # Filter features
    selected_cols = [f for f in features if f in df.columns]
    if not selected_cols:
        return {"error": "No valid features selected"}
        
    X_raw = df[selected_cols].copy()
    
    # Impute missing values
    imputer = SimpleImputer(strategy='median')
    X_imputed = imputer.fit_transform(X_raw)
    X = pd.DataFrame(X_imputed, columns=selected_cols, index=df.index)
    
    # Handle Outliers (Capping at 1st and 99th percentiles)
    if handle_outliers:
        for col in selected_cols:
            lower = X[col].quantile(0.01)
            upper = X[col].quantile(0.99)
            X[col] = np.clip(X[col], lower, upper)
            
    # Scale
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # PCA
    pca = PCA(n_components=2)
    pca_result = pca.fit_transform(X_scaled)
    explained_variance = pca.explained_variance_ratio_.tolist()
    
    # Evaluate K values (Elbow and Silhouette)
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
        
    # Final Clustering with selected K
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_scaled)
    df['Cluster'] = [f"Cluster {c}" for c in clusters]
    
    # Prepare scatter data
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
        
    # Cluster Profiles
    profiles = []
    for c in range(k):
        c_name = f"Cluster {c}"
        c_data = df[df['Cluster'] == c_name]
        size = len(c_data)
        
        means = {}
        for col in selected_cols:
            means[col] = float(c_data[col].mean())
            
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
