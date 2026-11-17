from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Date, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class DimPatient(Base):
    __tablename__ = "dim_patient"
    patient_key = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    bmi = Column(Float)
    insurance_type = Column(String)
    effective_date = Column(Date)
    expiry_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=True)

class DimDate(Base):
    __tablename__ = "dim_date"
    date_key = Column(Integer, primary_key=True, index=True) # YYYYMMDD
    date = Column(Date)
    day = Column(Integer)
    month = Column(Integer)
    quarter = Column(Integer)
    year = Column(Integer)

class DimDiagnosis(Base):
    __tablename__ = "dim_diagnosis"
    diagnosis_key = Column(Integer, primary_key=True, index=True, autoincrement=True)
    icd_code = Column(String, index=True)
    disease_name = Column(String)
    category = Column(String)

class DimDoctor(Base):
    __tablename__ = "dim_doctor"
    doctor_key = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String)
    department = Column(String)
    specialization = Column(String)

class FactPatientVisit(Base):
    __tablename__ = "fact_patient_visit"
    visit_key = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_key = Column(Integer, ForeignKey("dim_patient.patient_key"))
    doctor_key = Column(Integer, ForeignKey("dim_doctor.doctor_key"))
    diagnosis_key = Column(Integer, ForeignKey("dim_diagnosis.diagnosis_key"))
    date_key = Column(Integer, ForeignKey("dim_date.date_key"))
    
    length_of_stay = Column(Integer)
    treatment_cost = Column(Float)
    blood_pressure = Column(String)
    glucose_level = Column(Float)
    heart_rate = Column(Integer)
    readmission_flag = Column(Boolean)

# Metadata Tables
class ETLRun(Base):
    __tablename__ = "etl_runs"
    run_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(String) # SUCCESS, FAILED
    records_processed = Column(Integer)

class ModelExperiment(Base):
    __tablename__ = "model_experiments"
    experiment_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    model_name = Column(String)
    task_type = Column(String) # classification, clustering
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    hyperparameters = Column(String) # JSON string

class ModelMetric(Base):
    __tablename__ = "model_metrics"
    metric_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    experiment_id = Column(Integer, ForeignKey("model_experiments.experiment_id"))
    metric_name = Column(String)
    metric_value = Column(Float)

class AssociationRule(Base):
    __tablename__ = "association_rules"
    rule_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    antecedent = Column(String)
    consequent = Column(String)
    support = Column(Float)
    confidence = Column(Float)
    lift = Column(Float)

class ClusteringResult(Base):
    __tablename__ = "clustering_results"
    cluster_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    experiment_id = Column(Integer, ForeignKey("model_experiments.experiment_id"))
    cluster_label = Column(Integer)
    size = Column(Integer)
    profile_summary = Column(String)

class ForecastingResult(Base):
    __tablename__ = "forecasting_results"
    forecast_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    target_date = Column(Date)
    predicted_value = Column(Float)
    lower_bound = Column(Float)
    upper_bound = Column(Float)

class ModelMetadata(Base):
    __tablename__ = 'dim_model_metadata'
    id = Column(Integer, primary_key=True, autoincrement=True)
    model_name = Column(String(50), nullable=False)
    version = Column(Integer, nullable=False)
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    roc_auc = Column(Float)
    trained_at = Column(DateTime, default=func.now())
    filepath = Column(String(255))
    is_active = Column(Boolean, default=False)

