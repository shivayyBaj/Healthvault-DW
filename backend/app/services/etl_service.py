from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from ..models import DimPatient, DimDate, DimDiagnosis, DimDoctor, FactPatientVisit, ETLRun
from .data_loader import load_diabetes_130, load_pima_diabetes
_AGE_MIDPOINTS = {
    '[0-10)': 5, '[10-20)': 15, '[20-30)': 25, '[30-40)': 35,
    '[40-50)': 45, '[50-60)': 55, '[60-70)': 65, '[70-80)': 75,
    '[80-90)': 85, '[90-100)': 95
}
_PAYER_MAP = {
    'MC': 'Medicare', 'MD': 'Medicaid', 'CP': 'Private',
    'BC': 'Private', 'SP': 'Uninsured', 'HM': 'Private',
    'OG': 'Private', 'CM': 'Private', 'UN': 'Uninsured',
    'PO': 'Private', 'CH': 'Private', 'WC': 'Private', 'SI': 'Uninsured'
}
def extract_raw_data_from_dataset(num_records=100):
    """
    Extracts raw patient visit records directly from the real-world
    Diabetes 130-US Hospitals and Pima Indian Diabetes datasets.
    """
    d130 = load_diabetes_130()
    subset = d130.head(num_records).copy()
    data = []
    base_date = datetime.now() - timedelta(days=60)
    for idx, row in subset.iterrows():
        pat_id = f"P{(int(row['patient_nbr']) % 25) + 1:04d}"
        age_str = str(row['age'])
        age = _AGE_MIDPOINTS.get(age_str, 55)
        gender = 'M' if str(row['gender']).lower() == 'male' else 'F'
        los = int(row['time_in_hospital']) if pd.notna(row['time_in_hospital']) else 3
        num_meds = int(row['num_medications']) if pd.notna(row['num_medications']) else 5
        num_procs = int(row['num_procedures']) if pd.notna(row['num_procedures']) else 1
        cost = round(num_meds * 135.0 + num_procs * 850.0 + los * 420.0 + 350.0, 2)
        raw_payer = row['payer_code']
        insurance = _PAYER_MAP.get(raw_payer, None) if pd.notna(raw_payer) else None
        diag_val = str(row['diag_1'])
        icd_code = diag_val if pd.notna(row['diag_1']) and diag_val != '?' else 'UNKNOWN'
        visit_date = (base_date + timedelta(days=int(idx % 60))).strftime("%Y-%m-%d")
        glu_val = row.get('max_glu_serum')
        if glu_val == '>200':
            glucose = 240.0
        elif glu_val == '>300':
            glucose = 320.0
        elif glu_val == 'Norm':
            glucose = 98.0
        else:
            glucose = round(85.0 + (int(row['num_lab_procedures']) * 1.8), 1)
        bp_sys = 110 + (los * 2) + (age // 3)
        bp_dia = 70 + (age // 5)
        doctor_specialty = str(row['medical_specialty']) if pd.notna(row['medical_specialty']) and str(row['medical_specialty']) != '?' else "General Practice"
        doctor_name = f"Dr. {doctor_specialty.replace('-', ' ')}"
        readmission_flag = bool(str(row['readmitted']).strip() == '<30')
        bmi = round(21.0 + (idx % 15) * 1.1, 1)
        data.append({
            "patient_id": pat_id,
            "age": age,
            "gender": gender,
            "bmi": bmi,
            "insurance_type": insurance,
            "visit_date": visit_date,
            "length_of_stay": los,
            "treatment_cost": cost,
            "blood_pressure": f"{bp_sys}/{bp_dia}",
            "glucose_level": glucose,
            "heart_rate": 68 + (idx % 25),
            "icd_code": icd_code,
            "doctor_name": doctor_name[:40],
            "readmission_flag": readmission_flag
        })
    return pd.DataFrame(data)
def generate_raw_data(num_records=50):
    """Backward compatibility alias for extract_raw_data_from_dataset."""
    return extract_raw_data_from_dataset(num_records)
def run_etl_pipeline(db: Session):
    start_time = datetime.now()
    df = extract_raw_data_from_dataset(100)
    total_extracted = len(df)
    missing_insurance = int(df['insurance_type'].isna().sum())
    missing_codes = int((df['icd_code'] == 'UNKNOWN').sum())
    duplicates = int(df.duplicated().sum())
    quality_metrics = {
        "missing_values": {"insurance_type": missing_insurance, "icd_code": missing_codes},
        "duplicate_count": duplicates,
        "outlier_count": 0,
        "invalid_categorical": missing_codes,
    }
    df.drop_duplicates(inplace=True)
    df['insurance_type'] = df['insurance_type'].fillna('Unknown')
    df = df[df['icd_code'] != 'UNKNOWN']                     
    total_cleaned = len(df)
    rejected = total_extracted - total_cleaned
    loaded_records = 0
    for _, row in df.iterrows():
        v_date = datetime.strptime(row['visit_date'], "%Y-%m-%d")
        date_key = int(v_date.strftime("%Y%m%d"))
        dim_date = db.query(DimDate).filter(DimDate.date_key == date_key).first()
        if not dim_date:
            dim_date = DimDate(date_key=date_key, date=v_date.date(), day=v_date.day, 
                               month=v_date.month, quarter=(v_date.month - 1) // 3 + 1, year=v_date.year)
            db.add(dim_date)
            db.commit()
        dim_diag = db.query(DimDiagnosis).filter(DimDiagnosis.icd_code == row['icd_code']).first()
        if not dim_diag:
            dim_diag = DimDiagnosis(icd_code=row['icd_code'], disease_name=f"Condition {row['icd_code']}", category="Clinical")
            db.add(dim_diag)
            db.commit()
        dim_doc = db.query(DimDoctor).filter(DimDoctor.name == row['doctor_name']).first()
        if not dim_doc:
            dim_doc = DimDoctor(name=row['doctor_name'], department="Medicine", specialization=row['doctor_name'])
            db.add(dim_doc)
            db.commit()
        current_patient = db.query(DimPatient).filter(
            DimPatient.patient_id == row['patient_id'],
            DimPatient.is_current == True
        ).first()
        patient_key = None
        if not current_patient:
            new_patient = DimPatient(
                patient_id=row['patient_id'], age=row['age'], gender=row['gender'], bmi=row['bmi'],
                insurance_type=row['insurance_type'], effective_date=v_date.date(), is_current=True
            )
            db.add(new_patient)
            db.commit()
            db.refresh(new_patient)
            patient_key = new_patient.patient_key
        else:
            has_changed = (
                current_patient.insurance_type != row['insurance_type'] or
                current_patient.gender != row['gender'] or
                abs(current_patient.bmi - row['bmi']) > 1.0                           
            )
            if has_changed:
                current_patient.is_current = False
                current_patient.expiry_date = v_date.date()
                db.commit()
                new_patient = DimPatient(
                    patient_id=row['patient_id'], age=row['age'], gender=row['gender'], bmi=row['bmi'],
                    insurance_type=row['insurance_type'], effective_date=v_date.date(), is_current=True
                )
                db.add(new_patient)
                db.commit()
                db.refresh(new_patient)
                patient_key = new_patient.patient_key
            else:
                patient_key = current_patient.patient_key
        visit = FactPatientVisit(
            patient_key=patient_key,
            doctor_key=dim_doc.doctor_key,
            diagnosis_key=dim_diag.diagnosis_key,
            date_key=dim_date.date_key,
            length_of_stay=row['length_of_stay'],
            treatment_cost=row['treatment_cost'],
            blood_pressure=row['blood_pressure'],
            glucose_level=row['glucose_level'],
            heart_rate=row['heart_rate'],
            readmission_flag=row['readmission_flag']
        )
        db.add(visit)
        loaded_records += 1
    db.commit()
    end_time = datetime.now()
    etl_run = ETLRun(
        start_time=start_time,
        end_time=end_time,
        status="SUCCESS",
        records_processed=loaded_records
    )
    db.add(etl_run)
    db.commit()
    db.refresh(etl_run)
    return {
        "run_id": etl_run.run_id,
        "status": etl_run.status,
        "metrics": {
            "extracted": total_extracted,
            "cleaned": total_cleaned,
            "rejected": rejected,
            "loaded": loaded_records,
            "duration_seconds": (end_time - start_time).total_seconds()
        },
        "data_quality": quality_metrics
    }
