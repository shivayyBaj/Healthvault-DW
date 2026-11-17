import sys
import os
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# Add the parent directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base, SessionLocal
from app.models import DimPatient, DimDate, DimDiagnosis, DimDoctor, FactPatientVisit

def seed_data():
    # Recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    print("Seeding DimDiagnosis...")
    diagnoses = [
        DimDiagnosis(icd_code="E11", disease_name="Type 2 diabetes mellitus", category="Endocrine"),
        DimDiagnosis(icd_code="I10", disease_name="Essential hypertension", category="Circulatory"),
        DimDiagnosis(icd_code="J45", disease_name="Asthma", category="Respiratory"),
    ]
    db.add_all(diagnoses)
    db.commit()

    print("Seeding DimDoctor...")
    doctors = [
        DimDoctor(name="Dr. Smith", department="Cardiology", specialization="Cardiologist"),
        DimDoctor(name="Dr. Jones", department="Endocrinology", specialization="Endocrinologist"),
    ]
    db.add_all(doctors)
    db.commit()

    print("Seeding DimPatient and FactPatientVisit (Synthetic Data)...")
    for i in range(1, 101):
        patient = DimPatient(
            patient_id=f"P{i:04d}",
            age=random.randint(20, 85),
            gender=random.choice(["M", "F"]),
            bmi=round(random.uniform(18.5, 35.0), 1),
            insurance_type=random.choice(["Medicare", "Medicaid", "Private", "Uninsured"]),
            effective_date=datetime(2023, 1, 1).date(),
            is_current=True
        )
        db.add(patient)
        db.commit()

        # Add a date and visit
        visit_date = datetime.now() - timedelta(days=random.randint(1, 365))
        dim_date = DimDate(
            date_key=int(visit_date.strftime("%Y%m%d")),
            date=visit_date.date(),
            day=visit_date.day,
            month=visit_date.month,
            quarter=(visit_date.month - 1) // 3 + 1,
            year=visit_date.year
        )
        # Merge ensures we don't insert duplicate DateKeys
        dim_date = db.merge(dim_date) 
        db.commit()

        visit = FactPatientVisit(
            patient_key=patient.patient_key,
            doctor_key=random.choice(doctors).doctor_key,
            diagnosis_key=random.choice(diagnoses).diagnosis_key,
            date_key=dim_date.date_key,
            length_of_stay=random.randint(1, 14),
            treatment_cost=round(random.uniform(500, 10000), 2),
            blood_pressure=f"{random.randint(110,160)}/{random.randint(70,100)}",
            glucose_level=round(random.uniform(80, 200), 1),
            heart_rate=random.randint(60, 100),
            readmission_flag=random.choice([True, False, False, False]) # 25% readmission
        )
        db.add(visit)

    db.commit()
    db.close()
    print("Seeding complete!")

if __name__ == "__main__":
    seed_data()
