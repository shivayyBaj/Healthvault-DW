import numpy as np
import scipy.stats as stats
import pandas as pd
import random

def generate_health_data():
    np.random.seed(42)
    n = 1200
    
    # Blood pressure based on diabetes status
    diabetic = np.random.choice([True, False], size=n, p=[0.25, 0.75])
    bp = np.where(
        diabetic,
        np.random.normal(135, 12, size=n),
        np.random.normal(120, 10, size=n)
    )
    
    # Gender and Diagnosis Category
    gender = np.random.choice(["Male", "Female"], size=n, p=[0.48, 0.52])
    categories = ["Circulatory", "Endocrine", "Respiratory", "Digestive", "Musculoskeletal"]
    
    # Introduce a slight bias in diagnosis by gender to make Chi-Square interesting
    diagnosis = []
    for g in gender:
        if g == "Male":
            d = np.random.choice(categories, p=[0.3, 0.15, 0.2, 0.15, 0.2])
        else:
            d = np.random.choice(categories, p=[0.2, 0.25, 0.15, 0.2, 0.2])
        diagnosis.append(d)
        
    # Age Groups and Treatment Cost
    age_groups = np.random.choice(["0-18", "19-35", "36-50", "51-70", "71+"], size=n, p=[0.1, 0.2, 0.25, 0.3, 0.15])
    
    # Cost increases with age
    base_cost = np.random.normal(3000, 500, size=n)
    age_mult = {"0-18": 1.0, "19-35": 1.2, "36-50": 1.5, "51-70": 2.2, "71+": 3.0}
    cost = [max(500, c * age_mult[a] + np.random.normal(0, 800)) for c, a in zip(base_cost, age_groups)]
    
    # Additional numeric variables for descriptive stats
    length_of_stay = np.random.gamma(shape=2.5, scale=2.0, size=n)
    glucose = np.where(diabetic, np.random.normal(160, 30, size=n), np.random.normal(100, 15, size=n))
    
    df = pd.DataFrame({
        "diabetic": diabetic,
        "blood_pressure": bp,
        "gender": gender,
        "diagnosis": diagnosis,
        "age_group": age_groups,
        "treatment_cost": cost,
        "length_of_stay": length_of_stay,
        "glucose": glucose,
        "heart_rate": np.random.normal(75, 12, size=n)
    })
    
    return df


def get_descriptive_stats(variable="treatment_cost"):
    df = generate_health_data()
    if variable not in df.columns or not pd.api.types.is_numeric_dtype(df[variable]):
        variable = "treatment_cost"
        
    data = df[variable].dropna()
    mean = np.mean(data)
    std_error = stats.sem(data)
    ci = stats.t.interval(0.95, len(data)-1, loc=mean, scale=std_error)
    
    return {
        "variable": variable,
        "count": len(data),
        "mean": float(mean),
        "median": float(np.median(data)),
        "variance": float(np.var(data, ddof=1)),
        "std_dev": float(np.std(data, ddof=1)),
        "min": float(np.min(data)),
        "max": float(np.max(data)),
        "q1": float(np.percentile(data, 25)),
        "q3": float(np.percentile(data, 75)),
        "ci_lower": float(ci[0]),
        "ci_upper": float(ci[1])
    }


def perform_t_test():
    df = generate_health_data()
    
    diabetic_bp = df[df["diabetic"] == True]["blood_pressure"]
    nondiabetic_bp = df[df["diabetic"] == False]["blood_pressure"]
    
    t_stat, p_val = stats.ttest_ind(diabetic_bp, nondiabetic_bp, equal_var=False)
    
    mean_d = float(np.mean(diabetic_bp))
    mean_nd = float(np.mean(nondiabetic_bp))
    mean_diff = mean_d - mean_nd
    
    # CI for difference
    se_d = stats.sem(diabetic_bp)
    se_nd = stats.sem(nondiabetic_bp)
    se_diff = np.sqrt(se_d**2 + se_nd**2)
    df_diff = len(diabetic_bp) + len(nondiabetic_bp) - 2 # approx
    ci = stats.t.interval(0.95, df_diff, loc=mean_diff, scale=se_diff)
    
    significant = p_val < 0.05
    
    return {
        "test": "Independent Samples t-test",
        "variable": "Systolic Blood Pressure",
        "groups": ["Diabetic", "Non-diabetic"],
        "n_diabetic": len(diabetic_bp),
        "n_nondiabetic": len(nondiabetic_bp),
        "mean_diabetic": mean_d,
        "mean_nondiabetic": mean_nd,
        "mean_diff": mean_diff,
        "t_stat": float(t_stat),
        "p_value": float(p_val),
        "ci_lower": float(ci[0]),
        "ci_upper": float(ci[1]),
        "alpha": 0.05,
        "significant": significant,
        "hypotheses": {
            "null": "There is no difference in mean blood pressure between diabetic and non-diabetic patients.",
            "alternative": "There is a statistically significant difference in mean blood pressure between the two groups."
        },
        "interpretation": (
            f"The test reveals a statistically significant difference (p < 0.05) in blood pressure. "
            f"Diabetic patients had an average BP {abs(mean_diff):.1f} mmHg {'higher' if mean_diff > 0 else 'lower'} "
            "than non-diabetic patients. Note: This establishes statistical association, not a causal relationship."
        ) if significant else (
            "We fail to reject the null hypothesis. There is no statistically significant difference in blood pressure between the groups."
        )
    }


def perform_chi_square():
    df = generate_health_data()
    contingency = pd.crosstab(df["gender"], df["diagnosis"])
    
    chi2, p_val, dof, expected = stats.chi2_contingency(contingency)
    
    significant = p_val < 0.05
    
    # Format expected frequencies for UI
    expected_df = pd.DataFrame(expected, index=contingency.index, columns=contingency.columns)
    
    table_data = []
    for gender in contingency.index:
        for diag in contingency.columns:
            table_data.append({
                "gender": gender,
                "diagnosis": diag,
                "observed": int(contingency.loc[gender, diag]),
                "expected": float(expected_df.loc[gender, diag])
            })
            
    return {
        "test": "Chi-Square Test of Independence",
        "variables": ["Gender", "Diagnosis Category"],
        "chi2_stat": float(chi2),
        "dof": int(dof),
        "p_value": float(p_val),
        "alpha": 0.05,
        "significant": significant,
        "table": table_data,
        "categories": list(contingency.columns),
        "genders": list(contingency.index),
        "hypotheses": {
            "null": "Gender and Diagnosis Category are independent (no association).",
            "alternative": "There is a statistically significant association between Gender and Diagnosis Category."
        },
        "interpretation": (
            "The test reveals a statistically significant association (p < 0.05) between patient gender and diagnosis category. "
            "The observed frequencies deviate significantly from what we would expect if they were completely independent. "
            "Important: A statistical association does not imply a causal relationship."
        ) if significant else (
            "We fail to reject the null hypothesis. There is no statistically significant association between gender and diagnosis category."
        )
    }


def perform_anova():
    df = generate_health_data()
    
    groups = df["age_group"].unique()
    groups.sort()
    
    data_by_group = [df[df["age_group"] == g]["treatment_cost"] for g in groups]
    
    f_stat, p_val = stats.f_oneway(*data_by_group)
    
    significant = p_val < 0.05
    
    group_stats = []
    for g, data in zip(groups, data_by_group):
        group_stats.append({
            "group": g,
            "count": len(data),
            "mean": float(np.mean(data)),
            "std": float(np.std(data, ddof=1))
        })
        
    return {
        "test": "One-Way ANOVA",
        "variable": "Treatment Cost",
        "factor": "Age Group",
        "f_stat": float(f_stat),
        "p_value": float(p_val),
        "alpha": 0.05,
        "significant": significant,
        "group_stats": group_stats,
        "hypotheses": {
            "null": "The mean treatment cost is equal across all age groups.",
            "alternative": "At least one age group has a statistically significantly different mean treatment cost."
        },
        "interpretation": (
            "The ANOVA results show a statistically significant difference (p < 0.05) in mean treatment costs across different age groups. "
            "This suggests age is associated with varying treatment costs, though it does not explicitly prove age causes higher costs."
        ) if significant else (
            "We fail to reject the null hypothesis. We do not have sufficient evidence to say treatment costs differ significantly across age groups."
        )
    }
