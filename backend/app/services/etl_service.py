import random
from datetime import datetime, timedelta
import pandas as pd
from sqlalchemy.orm import Session
from ..models import DimPatient, DimDate, DimDiagnosis, DimDoctor, FactPatientVisit, ETLRun

def generate_raw_data(num_records=50):
    """Simulates extracting raw data that needs processing."""
    data = []
    for _ in range(num_records):
        patient_id = f"P{random.randint(1, 10):04d}" # High chance of same patient to trigger SCD2
        data.append({
            "patient_id": patient_id,
            "age": random.randint(20, 85),
            "gender": random.choice(["M", "F"]),
            "bmi": round(random.uniform(18.5, 35.0), 1),
            "insurance_type": random.choice(["Medicare", "Medicaid", "Private", "Uninsured", None]), # Some missing
            "visit_date": (datetime.now() - timedelta(days=random.randint(0, 30))).strftime("%Y-%m-%d"),
            "length_of_stay": random.randint(1, 14),
            "treatment_cost": round(random.uniform(500, 10000), 2),
            "blood_pressure": f"{random.randint(110,160)}/{random.randint(70,100)}",
            "glucose_level": round(random.uniform(80, 200), 1),
            "heart_rate": random.randint(60, 100),
            "icd_code": random.choice(["E11", "I10", "J45", "UNKNOWN"]),
            "doctor_name": random.choice(["Dr. Smith", "Dr. Jones"]),
            "readmission_flag": random.choice([True, False, False])
        })
    return pd.DataFrame(data)

def run_etl_pipeline(db: Session):
    start_time = datetime.now()
    
    # 1. EXTRACT
    df = generate_raw_data(100)
    total_extracted = len(df)
    
    # 2. PROFILE & DATA QUALITY
    missing_insurance = int(df['insurance_type'].isna().sum())
    missing_codes = int((df['icd_code'] == 'UNKNOWN').sum())
    duplicates = int(df.duplicated().sum())
    
    quality_metrics = {
        "missing_values": {"insurance_type": missing_insurance, "icd_code": missing_codes},
        "duplicate_count": duplicates,
        "outlier_count": 0,
        "invalid_categorical": missing_codes,
    }
    
    # 3. CLEAN
    df.drop_duplicates(inplace=True)
    df['insurance_type'] = df['insurance_type'].fillna('Unknown')
    df = df[df['icd_code'] != 'UNKNOWN'] # Drop invalid codes
    
    total_cleaned = len(df)
    rejected = total_extracted - total_cleaned
    
    # 4. TRANSFORM & 5. LOAD
    loaded_records = 0
    
    for _, row in df.iterrows():
        # --- Handle DimDate ---
        v_date = datetime.strptime(row['visit_date'], "%Y-%m-%d")
        date_key = int(v_date.strftime("%Y%m%d"))
        dim_date = db.query(DimDate).filter(DimDate.date_key == date_key).first()
        if not dim_date:
            dim_date = DimDate(date_key=date_key, date=v_date.date(), day=v_date.day, 
                               month=v_date.month, quarter=(v_date.month - 1) // 3 + 1, year=v_date.year)
            db.add(dim_date)
            db.commit()

        # --- Handle DimDiagnosis ---
        dim_diag = db.query(DimDiagnosis).filter(DimDiagnosis.icd_code == row['icd_code']).first()
        if not dim_diag:
            dim_diag = DimDiagnosis(icd_code=row['icd_code'], disease_name="Generated", category="General")
            db.add(dim_diag)
            db.commit()

        # --- Handle DimDoctor ---
        dim_doc = db.query(DimDoctor).filter(DimDoctor.name == row['doctor_name']).first()
        if not dim_doc:
            dim_doc = DimDoctor(name=row['doctor_name'], department="General", specialization="General")
            db.add(dim_doc)
            db.commit()

        # --- Handle DimPatient (SCD Type 2) ---
        current_patient = db.query(DimPatient).filter(
            DimPatient.patient_id == row['patient_id'],
            DimPatient.is_current == True
        ).first()

        patient_key = None
        
        if not current_patient:
            # New patient
            new_patient = DimPatient(
                patient_id=row['patient_id'], age=row['age'], gender=row['gender'], bmi=row['bmi'],
                insurance_type=row['insurance_type'], effective_date=v_date.date(), is_current=True
            )
            db.add(new_patient)
            db.commit()
            db.refresh(new_patient)
            patient_key = new_patient.patient_key
        else:
            # Check for changes in tracked attributes (Insurance, Gender, BMI)
            has_changed = (
                current_patient.insurance_type != row['insurance_type'] or
                current_patient.gender != row['gender'] or
                abs(current_patient.bmi - row['bmi']) > 1.0 # arbitrary threshold for BMI change
            )
            
            if has_changed:
                # 1. Close current record
                current_patient.is_current = False
                current_patient.expiry_date = v_date.date()
                db.commit()
                
                # 2. Create new record
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
                
        # --- Handle FactPatientVisit ---
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
    
    # Record ETL Run
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
