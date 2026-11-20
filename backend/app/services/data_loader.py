import os
import pandas as pd
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")
def load_heart_disease():
    """Load UCI Heart Disease Cleveland dataset (303 rows, 14 cols)."""
    path = os.path.join(DATA_DIR, "heart_disease_cleveland.csv")
    df = pd.read_csv(path)
    df.columns = df.columns.str.strip()
    return df
def load_pima_diabetes():
    """Load Pima Indians Diabetes dataset (768 rows, 9 cols)."""
    path = os.path.join(DATA_DIR, "pima_indians_diabetes.csv")
    return pd.read_csv(path)
def load_diabetes_130():
    """Load Diabetes 130-US Hospitals dataset (101766 rows, 50 cols).
    Replaces '?' with NaN."""
    path = os.path.join(DATA_DIR, "diabetes_130_us_hospitals.csv")
    df = pd.read_csv(path, na_values='?', low_memory=False)
    return df
def get_combined_health_data():
    """Create a unified health analytics DataFrame by combining key fields
    from all three datasets for statistical analysis, dashboard, etc.
    Returns a DataFrame with columns: age, gender, bmi, glucose_level,
    blood_pressure, heart_rate, diagnosis_category, treatment_cost,
    length_of_stay, readmission_flag, insurance_type, source_dataset."""
    import numpy as np
    hd = load_heart_disease()
    hd_df = pd.DataFrame({
        'age': hd['age'],
        'gender': hd['sex'].map({1: 'Male', 0: 'Female'}),
        'bmi': np.nan,                                  
        'glucose_level': hd['fbs'].map({1: 160.0, 0: 100.0}),                             
        'blood_pressure': hd['trestbps'],
        'heart_rate': hd['thalach'],
        'diagnosis_category': hd['diagnosis'].apply(lambda x: 'Circulatory' if x > 0 else 'Healthy'),
        'treatment_cost': np.nan,
        'length_of_stay': np.nan,
        'readmission_flag': False,
        'insurance_type': 'Unknown',
        'source_dataset': 'heart_disease'
    })
    pd_data = load_pima_diabetes()
    pd_df = pd.DataFrame({
        'age': pd_data['Age'],
        'gender': 'Female',                              
        'bmi': pd_data['BMI'],
        'glucose_level': pd_data['Glucose'],
        'blood_pressure': pd_data['BloodPressure'],
        'heart_rate': np.nan,
        'diagnosis_category': pd_data['Outcome'].map({1: 'Endocrine', 0: 'Healthy'}),
        'treatment_cost': np.nan,
        'length_of_stay': np.nan,
        'readmission_flag': False,
        'insurance_type': 'Unknown',
        'source_dataset': 'pima_diabetes'
    })
    d130 = load_diabetes_130()
    d130_sample = d130.sample(n=min(5000, len(d130)), random_state=42)
    age_map = {'[0-10)': 5, '[10-20)': 15, '[20-30)': 25, '[30-40)': 35,
               '[40-50)': 45, '[50-60)': 55, '[60-70)': 65, '[70-80)': 75,
               '[80-90)': 85, '[90-100)': 95}
    def map_diag_category(code):
        if pd.isna(code):
            return 'Other'
        code_str = str(code)
        try:
            num = float(code_str)
            if 390 <= num <= 459 or num == 785:
                return 'Circulatory'
            elif 460 <= num <= 519 or num == 786:
                return 'Respiratory'
            elif 250 <= num <= 250.99 or code_str.startswith('250'):
                return 'Endocrine'
            elif 520 <= num <= 579 or num == 787:
                return 'Digestive'
            elif 710 <= num <= 739:
                return 'Musculoskeletal'
            else:
                return 'Other'
        except (ValueError, TypeError):
            if code_str.startswith('E') or code_str.startswith('V'):
                return 'Other'
            return 'Other'
    d130_df = pd.DataFrame({
        'age': d130_sample['age'].map(age_map),
        'gender': d130_sample['gender'].map({'Male': 'Male', 'Female': 'Female'}).fillna('Unknown'),
        'bmi': np.nan,
        'glucose_level': d130_sample['max_glu_serum'].map({'>200': 250.0, '>300': 350.0, 'Norm': 100.0, 'None': np.nan}),
        'blood_pressure': np.nan,
        'heart_rate': np.nan,
        'diagnosis_category': d130_sample['diag_1'].apply(map_diag_category),
        'treatment_cost': np.nan,
        'length_of_stay': d130_sample['time_in_hospital'],
        'readmission_flag': d130_sample['readmitted'].apply(lambda x: x == '<30'),
        'insurance_type': d130_sample['payer_code'].fillna('Unknown'),
        'source_dataset': 'diabetes_130'
    })
    combined = pd.concat([hd_df, pd_df, d130_df], ignore_index=True)
    combined['bmi'] = combined['bmi'].fillna(combined['bmi'].median())
    combined['treatment_cost'] = combined['treatment_cost'].fillna(
        combined['length_of_stay'].fillna(3) * 750.0 + combined['age'].fillna(50) * 35.0 + 450.0
    ).round(2)
    return combined
