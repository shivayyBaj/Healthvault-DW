<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Flask-3.x-000000?logo=flask" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

# 🏥 HealthVault DW

**An end-to-end Healthcare Data Warehouse & Intelligent Analytics Platform**

HealthVault DW is an advanced, academic healthcare data warehouse and intelligent analytics platform. It functions as a full-stack data engineering, analytics, data mining, and machine learning prototype designed for comprehensive exploration of health records — covering everything from ETL pipelines and OLAP cubes to predictive modeling and Explainable AI.

> **⚠️ Disclaimer:** This is strictly an **educational research prototype**. It uses public, anonymized, or synthetic data and is **not intended for clinical diagnosis, treatment, or real-world medical decision-making.**

---

## ✨ Features

| Module | Description |
|--------|-------------|
| **📊 Interactive Dashboard** | KPI cards, admission trends, diagnosis distributions, demographic breakdowns, and cost analysis — all in real time |
| **🔄 ETL Pipeline** | Complete Extract → Transform → Load pipeline with missing value imputation, type casting, schema normalization, and run history |
| **🏗️ Star-Schema Warehouse** | Dimensional model with Slowly Changing Dimensions (SCD Type 2) managing Fact and Dimension tables |
| **🧊 OLAP Cube** | Multi-dimensional analysis with Roll-Up, Drill-Down, Slice, and Dice operations |
| **📈 Statistical Analysis** | Descriptive statistics, T-Test, ANOVA, and Chi-Square hypothesis testing |
| **🔗 Association Rules** | Apriori algorithm for mining diagnosis-medication co-occurrence patterns |
| **🤖 ML — Risk Prediction** | Classification models (Random Forest, Logistic Regression, SVM, KNN, Naive Bayes, Decision Tree) with SMOTE & 5-fold CV |
| **🧬 ML — Patient Segmentation** | K-Means clustering with PCA visualization, Elbow method, and Silhouette analysis |
| **📉 ML — Time-Series Forecasting** | ARIMA-based admission forecasting with configurable (p, d, q) parameters |
| **🔍 Explainable AI (XAI)** | SHAP (global) + LIME (local) explanations for interpreting black-box model predictions |
| **🧪 WEKA Integration** | Export datasets in `.arff`/`.csv` for analysis in the WEKA GUI |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   Presentation Layer                            │
│         React 18 · TypeScript · Tailwind · Recharts             │
│   Dashboard │ OLAP │ Stats │ ML │ XAI │ ETL │ Forecasting      │
└───────────────────────────┬─────────────────────────────────────┘
                            │  REST API (JSON)
┌───────────────────────────▼─────────────────────────────────────┐
│                   Application Layer                             │
│              Flask 3.x · Flask-CORS · SQLAlchemy                │
│         Routes → Services → ML Modules → DB Sessions           │
└───────┬──────────────────────────────────┬──────────────────────┘
        │                                  │
┌───────▼──────────┐            ┌──────────▼──────────────────────┐
│  Data Warehouse  │            │  Analytics & ML Engine          │
│  SQLite / Pg     │            │  Scikit-learn · Statsmodels     │
│  Star Schema     │            │  SHAP · LIME · SMOTE · PCA     │
│  SCD Type 2      │            │  ARIMA · K-Means · Apriori     │
└──────────────────┘            └─────────────────────────────────┘
```

---

## 📂 Project Structure

```
healthvault-dw/
├── backend/                       # Python API Backend
│   ├── app/
│   │   ├── main.py                # Flask entry point & route definitions
│   │   ├── models.py              # SQLAlchemy ORM models (Star Schema)
│   │   ├── database.py            # DB engine & session factory
│   │   └── services/
│   │       ├── etl_service.py     # ETL pipeline logic
│   │       ├── olap_service.py    # OLAP roll-up, drill-down, slice, dice
│   │       ├── stats_service.py   # Descriptive stats & hypothesis tests
│   │       ├── association_service.py  # Apriori association rule mining
│   │       ├── ml_service.py      # Classification model training & prediction
│   │       ├── clustering_service.py   # K-Means patient segmentation
│   │       ├── forecasting_service.py  # ARIMA time-series forecasting
│   │       └── xai_service.py     # SHAP & LIME explanations
│   ├── scripts/
│   │   └── seed.py                # Database seeding script
│   ├── models_storage/            # Persisted trained model artifacts (.pkl)
│   ├── requirements.txt           # Python dependencies
│   ├── run.py                     # Development server runner
│   └── .env.example               # Environment variable template
│
├── frontend/                      # React SPA
│   ├── src/
│   │   ├── pages/                 # View components
│   │   │   ├── Dashboard.tsx      # Main analytics dashboard
│   │   │   ├── ETLPipeline.tsx    # ETL execution & monitoring
│   │   │   ├── Warehouse.tsx      # Data warehouse browser
│   │   │   ├── OLAP.tsx           # OLAP cube operations
│   │   │   ├── Statistics.tsx     # Statistical analysis
│   │   │   ├── AssociationRules.tsx  # Apriori rule mining UI
│   │   │   ├── ModelComparison.tsx   # ML model benchmarking
│   │   │   ├── Prediction.tsx     # Individual patient risk prediction
│   │   │   ├── Clustering.tsx     # Patient segmentation visualization
│   │   │   ├── Forecasting.tsx    # ARIMA forecasting interface
│   │   │   ├── Explainability.tsx # SHAP/LIME visualization
│   │   │   └── Datasets.tsx       # Dataset management & WEKA export
│   │   ├── components/            # Reusable UI components
│   │   │   ├── dashboard/         # Dashboard-specific widgets
│   │   │   ├── olap/              # OLAP operation components
│   │   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   │   └── Header.tsx         # App header
│   │   ├── layouts/
│   │   │   └── MainLayout.tsx     # Page layout wrapper
│   │   └── router/
│   │       └── index.tsx          # React Router configuration
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Python 3.10+** | Core language |
| **Flask 3.x** | REST API framework |
| **SQLAlchemy 2.x** | ORM & database toolkit |
| **Scikit-learn** | Classification, clustering, preprocessing |
| **Statsmodels** | ARIMA time-series forecasting |
| **SHAP** | Global model interpretability |
| **LIME** | Local prediction explanations |
| **Pandas / NumPy** | Data manipulation & numerical computing |
| **Matplotlib** | Server-side chart generation |
| **Faker** | Synthetic data generation |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript 5** | Type-safe development |
| **Vite 5** | Build tool & dev server |
| **Tailwind CSS 3.4** | Utility-first styling |
| **Recharts** | Data visualization charts |
| **TanStack Query** | Server state management & caching |
| **Axios** | HTTP client |
| **Lucide React** | Icon library |
| **React Router 6** | Client-side routing |

### Database
| Technology | Purpose |
|------------|---------|
| **SQLite** | Default local database |
| **PostgreSQL** | Production-ready alternative (config swap) |

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/healthvault-dw.git
cd healthvault-dw
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings if needed
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

---

## ▶️ Running the Application

### Start the Backend (API)

```bash
cd backend
venv\Scripts\activate        # Windows
python run.py
```

The API server starts at **`http://127.0.0.1:8000`**

### Start the Frontend (UI)

```bash
cd frontend
npm run dev
```

The application opens at **`http://localhost:5173`**

---

## 🗄️ Database

The SQLite database (`healthvault.db`) is **auto-generated** on first backend startup via `backend/app/database.py`. The schema implements a **Star Schema** design with:

- **Dimension Tables** — `DimPatient`, `DimDoctor`, `DimDiagnosis`, `DimDate`
- **Fact Tables** — `FactVisit` with measures (treatment cost, length of stay, readmission flag)
- **SCD Type 2** — Patient dimension tracks historical changes with effective/expiry dates

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/dashboard/full` | Full dashboard data (KPIs, trends, demographics) |
| `POST` | `/api/etl/run` | Trigger ETL pipeline |
| `GET` | `/api/etl/history` | ETL run history |
| `GET` | `/api/warehouse/patients/<id>` | Patient SCD history |
| `GET` | `/api/olap/rollup` | OLAP Roll-Up operation |
| `GET` | `/api/olap/drilldown` | OLAP Drill-Down operation |
| `GET` | `/api/olap/slice` | OLAP Slice operation |
| `GET` | `/api/olap/dice` | OLAP Dice operation |
| `GET` | `/api/stats/descriptive` | Descriptive statistics |
| `GET` | `/api/stats/ttest` | Independent T-Test |
| `GET` | `/api/stats/chisquare` | Chi-Square test |
| `GET` | `/api/stats/anova` | One-way ANOVA |
| `GET` | `/api/ml/association` | Apriori association rules |
| `POST` | `/api/ml/train` | Train classification models |
| `GET` | `/api/ml/models` | List trained models |
| `POST` | `/api/ml/predict` | Predict patient readmission risk |
| `POST` | `/api/ml/clustering` | K-Means patient segmentation |
| `POST` | `/api/ml/forecasting` | ARIMA admission forecasting |
| `GET` | `/api/ml/xai/global` | SHAP global explanations |
| `POST` | `/api/ml/xai/local` | LIME local explanations |

---

## 📊 Dataset Setup

The system supports four primary data sources:

1. **UCI Heart Disease** — Cleveland heart disease dataset
2. **Pima Indians Diabetes** — Diabetes classification dataset
3. **Diabetes 130-US Hospitals** — 10 years of clinical care data
4. **Synthetic Patients** — Generated via Faker for development

Place real CSV files in `backend/data/` (not tracked by git) and trigger processing via the **ETL & Data Quality** module in the UI or the `/api/etl/run` endpoint. Without imported CSVs, the system uses built-in synthetic data generators.

---

## 🧠 ML Pipeline Details

### Classification (Risk Prediction)
- **Models:** Random Forest, Logistic Regression, SVM, KNN, Naive Bayes, Decision Tree
- **Target:** Hospital readmission prediction
- **Preprocessing:** SMOTE applied exclusively on training set to prevent data leakage
- **Validation:** Stratified 5-fold Cross Validation
- **Metrics:** Accuracy, Precision, Recall, F1-Score, ROC-AUC

### Clustering (Patient Segmentation)
- **Algorithm:** K-Means with configurable K
- **Features:** Age, BMI, Glucose, Blood Pressure, Chronic Conditions, Treatment Cost
- **Preprocessing:** Median imputation → outlier capping (1st/99th percentile) → StandardScaler
- **Visualization:** PCA-reduced 2D scatter plots, Elbow method, Silhouette analysis

### Forecasting
- **Model:** ARIMA with configurable (p, d, q) orders
- **Target:** Daily/weekly/monthly admission count forecasting
- **Output:** Historical trends with future horizon predictions

---

## 🔍 Explainable AI

| Method | Scope | What It Shows |
|--------|-------|---------------|
| **SHAP** | Global | Feature importance rankings across the full dataset — which features drive the model overall |
| **LIME** | Local | Per-patient explanations — why the model made a specific prediction for an individual |

---

## 🧪 WEKA Workflow

1. Navigate to the **Datasets** page in the UI
2. Export datasets via `/api/weka/export` in `.arff` or `.csv` format
3. Open the exported files in the [WEKA GUI](https://www.cs.waikato.ac.nz/ml/weka/) for further analysis

---

## ⚠️ Known Limitations

- **Scalability:** SQLite is a bottleneck for OLAP cubes exceeding ~5M rows; switch to PostgreSQL for larger workloads
- **Synthetic Data:** Without clinical CSV imports, the system relies on data generators that mimic statistical shapes of real datasets
- **Model Storage:** Trained models are stored as `.pkl` files locally; not suitable for distributed deployment

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 📧 Contact

For questions or feedback, please open an issue on the [GitHub Issues](../../issues) page.

---

<p align="center">
  Built with ❤️ for academic research in healthcare data engineering & analytics
</p>
