import sys
import os
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.database import engine, Base, SessionLocal
from app.models import DimPatient, DimDate, DimDiagnosis, DimDoctor, FactPatientVisit
from app.services.data_loader import load_diabetes_130, load_pima_diabetes, load_heart_disease
_AGE_MIDPOINTS = {
    '[0-10)': 5, '[10-20)': 15, '[20-30)': 25, '[30-40)': 35,
    '[40-50)': 45, '[50-60)': 55, '[60-70)': 65, '[70-80)': 75,
    '[80-90)': 85, '[90-100)': 95
}
_PAYER_MAP = {
    'MC': 'Medicare', 'MD': 'Medicaid', 'CP': 'Private',
    'BC': 'Private', 'SP': 'Uninsured', 'HM': 'Private',
    'OG': 'Private', 'CM': 'Private', 'UN': 'Uninsured'
}
_ICD_DISEASE_MAP = {
    '250': ('Type 2 Diabetes Mellitus', 'Endocrine'),
    '250.0': ('Type 2 Diabetes without complication', 'Endocrine'),
    '250.01': ('Type 1 Diabetes without complication', 'Endocrine'),
    '250.02': ('Type 2 Diabetes uncontrolled', 'Endocrine'),
    '250.83': ('Type 2 Diabetes with secondary manifestations', 'Endocrine'),
    '401.9': ('Essential Hypertension', 'Circulatory'),
    '414': ('Coronary Atherosclerosis', 'Circulatory'),
    '414.01': ('Coronary Artery Disease', 'Circulatory'),
    '428': ('Congestive Heart Failure', 'Circulatory'),
    '428.0': ('Congestive Heart Failure, unspecified', 'Circulatory'),
    '486': ('Pneumonia, organism unspecified', 'Respiratory'),
    '491': ('Chronic Bronchitis', 'Respiratory'),
    '493': ('Asthma', 'Respiratory'),
    '493.9': ('Asthma, unspecified', 'Respiratory'),
    '496': ('Chronic Obstructive Pulmonary Disease (COPD)', 'Respiratory'),
    '584': ('Acute Kidney Failure', 'Digestive'),
    '599': ('Urinary Tract Infection', 'Digestive'),
    '786.5': ('Chest Pain', 'Circulatory'),
    '780': ('General Symptoms / Altered Mental Status', 'Clinical'),
}
def seed_data():
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    print("Loading real-world datasets for seeding...")
    d130 = load_diabetes_130()
    pima = load_pima_diabetes()
    heart = load_heart_disease()
    print("Seeding DimDiagnosis from real clinical codes...")
    top_codes = d130['diag_1'].dropna().value_counts().head(20).index.tolist()
    diag_objects = {}
    for code in top_codes:
        code_str = str(code).strip()
        if code_str == '?':
            continue
        disease_name, category = _ICD_DISEASE_MAP.get(code_str, (f"ICD-9 Diagnosis {code_str}", "General Clinical"))
        dim_diag = DimDiagnosis(icd_code=code_str, disease_name=disease_name, category=category)
        db.add(dim_diag)
        diag_objects[code_str] = dim_diag
    db.commit()
    for d in diag_objects.values():
        db.refresh(d)
    print("Seeding DimDoctor from real hospital specialties...")
    top_specialties = d130['medical_specialty'].dropna().value_counts().head(10).index.tolist()
    doctor_objects = []
    doc_names = ["Dr. Smith", "Dr. Patel", "Dr. Johnson", "Dr. Williams", "Dr. Brown", 
                 "Dr. Jones", "Dr. Garcia", "Dr. Miller", "Dr. Davis", "Dr. Rodriguez"]
    for i, spec in enumerate(top_specialties):
        if spec == '?':
            continue
        name = doc_names[i % len(doc_names)]
        dept = spec.replace('-', ' ').replace('/', ' ')
        dim_doc = DimDoctor(name=name, department=dept, specialization=spec)
        db.add(dim_doc)
        doctor_objects.append(dim_doc)
    db.commit()
    for doc in doctor_objects:
        db.refresh(doc)
    print("Seeding DimPatient & FactPatientVisit from real patient encounters...")
    pima_bmis = pima['BMI'][pima['BMI'] > 0].values
    sample_encounters = d130.head(150).copy()
    base_date = datetime(2025, 1, 15)
    loaded_visits = 0
    for idx, row in sample_encounters.iterrows():
        pat_id = f"P{(int(row['patient_nbr']) % 30) + 1:04d}"
        age = _AGE_MIDPOINTS.get(str(row['age']), 55)
        gender = 'M' if str(row['gender']).lower() == 'male' else 'F'
        bmi = round(float(pima_bmis[idx % len(pima_bmis)]), 1)
        raw_payer = row['payer_code']
        insurance = _PAYER_MAP.get(raw_payer, 'Private') if pd.notna(raw_payer) else 'Private'
        visit_date = base_date + timedelta(days=int(idx * 2))
        date_key = int(visit_date.strftime("%Y%m%d"))
        dim_date = db.query(DimDate).filter(DimDate.date_key == date_key).first()
        if not dim_date:
            dim_date = DimDate(
                date_key=date_key,
                date=visit_date.date(),
                day=visit_date.day,
                month=visit_date.month,
                quarter=(visit_date.month - 1) // 3 + 1,
                year=visit_date.year
            )
            db.add(dim_date)
            db.commit()
        patient = db.query(DimPatient).filter(
            DimPatient.patient_id == pat_id,
            DimPatient.is_current == True
        ).first()
        if not patient:
            patient = DimPatient(
                patient_id=pat_id,
                age=age,
                gender=gender,
                bmi=bmi,
                insurance_type=insurance,
                effective_date=visit_date.date(),
                is_current=True
            )
            db.add(patient)
            db.commit()
            db.refresh(patient)
        assigned_doc = doctor_objects[idx % len(doctor_objects)]
        diag_code = str(row['diag_1']).strip()
        assigned_diag = diag_objects.get(diag_code)
        if not assigned_diag:
            assigned_diag = list(diag_objects.values())[idx % len(diag_objects)]
        los = int(row['time_in_hospital']) if pd.notna(row['time_in_hospital']) else 3
        num_meds = int(row['num_medications']) if pd.notna(row['num_medications']) else 6
        num_procs = int(row['num_procedures']) if pd.notna(row['num_procedures']) else 1
        cost = round(num_meds * 140.0 + num_procs * 820.0 + los * 400.0 + 450.0, 2)
        glucose = 95.0 + (int(row['num_lab_procedures']) * 1.5)
        readmission = bool(str(row['readmitted']).strip() == '<30')
        visit = FactPatientVisit(
            patient_key=patient.patient_key,
            doctor_key=assigned_doc.doctor_key,
            diagnosis_key=assigned_diag.diagnosis_key,
            date_key=dim_date.date_key,
            length_of_stay=los,
            treatment_cost=cost,
            blood_pressure=f"{115 + los * 3}/{75 + age // 10}",
            glucose_level=round(glucose, 1),
            heart_rate=70 + (idx % 20),
            readmission_flag=readmission
        )
        db.add(visit)
        loaded_visits += 1
    db.commit()
    db.close()
    print(f"✓ Real-world seeding complete! Loaded {loaded_visits} clinical patient visits into healthvault.db.")
if __name__ == "__main__":
    seed_data()
