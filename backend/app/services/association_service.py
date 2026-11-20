import pandas as pd
import numpy as np
from mlxtend.frequent_patterns import apriori, association_rules
from .data_loader import load_heart_disease, load_diabetes_130
def extract_real_transactions(n=1000):
    """
    Builds clinical transaction itemsets directly from real-world records:
    - UCI Heart Disease (cardiovascular risk factors, hypertension, cholesterol)
    - Diabetes 130-US Hospitals (diabetes medications, comorbidity patterns, diagnoses)
    """
    heart = load_heart_disease()
    d130 = load_diabetes_130().head(min(n, 1200))
    transactions = []
    for _, r in heart.iterrows():
        age = float(r['age'])
        age_group = "Age: 19-35" if age <= 35 else "Age: 36-50" if age <= 50 else "Age: 51-70" if age <= 70 else "Age: 71+"
        gender = "Gender: M" if int(r['sex']) == 1 else "Gender: F"
        has_high_bp = float(r['trestbps']) >= 140
        has_high_chol = float(r['chol']) >= 240
        has_diabetes = int(r['fbs']) == 1
        has_heart_disease = int(r['diagnosis']) > 0
        item = {
            age_group: True,
            gender: True,
            "High BP": has_high_bp,
            "High Cholesterol": has_high_chol,
            "Diabetes": has_diabetes,
            "Heart Disease": has_heart_disease,
            "Diag: Circulatory": has_heart_disease,
            "Diag: Endocrine": has_diabetes
        }
        transactions.append(item)
    for _, r in d130.iterrows():
        age_bracket = str(r['age'])
        if age_bracket in ['[0-10)', '[10-20)', '[20-30)', '[30-40)']:
            age_group = "Age: 19-35"
        elif age_bracket in ['[40-50)', '[50-60)']:
            age_group = "Age: 36-50"
        elif age_bracket in ['[60-70)', '[70-80)']:
            age_group = "Age: 51-70"
        else:
            age_group = "Age: 71+"
        gender = "Gender: M" if str(r['gender']).lower() == 'male' else "Gender: F"
        has_diabetes = True
        insulin_used = str(r.get('insulin', 'No')) in ['Steady', 'Up', 'Down']
        metformin_used = str(r.get('metformin', 'No')) in ['Steady', 'Up', 'Down']
        code_str = str(r.get('diag_1', ''))
        is_circulatory = False
        is_endocrine = False
        is_respiratory = False
        is_digestive = False
        try:
            num = float(code_str)
            if 390 <= num <= 459 or num == 785:
                is_circulatory = True
            elif 250 <= num <= 250.99 or code_str.startswith('250'):
                is_endocrine = True
            elif 460 <= num <= 519 or num == 786:
                is_respiratory = True
            elif 520 <= num <= 579 or num == 787:
                is_digestive = True
        except (ValueError, TypeError):
            pass
        has_heart_disease = is_circulatory
        has_high_bp = is_circulatory or (int(r.get('number_diagnoses', 0)) >= 5)
        item = {
            age_group: True,
            gender: True,
            "High BP": has_high_bp,
            "Diabetes": has_diabetes,
            "Heart Disease": has_heart_disease,
            "Insulin Therapy": insulin_used,
            "Metformin Therapy": metformin_used,
            "Diag: Circulatory": is_circulatory,
            "Diag: Endocrine": is_endocrine or has_diabetes,
            "Diag: Respiratory": is_respiratory,
            "Diag: Digestive": is_digestive
        }
        transactions.append(item)
    df = pd.DataFrame(transactions).fillna(False).astype(bool)
    return df
def generate_transactions(n=500):
    """Backward compatibility alias returning real clinical transactions."""
    return extract_real_transactions(n)
def mine_rules(min_support=0.1, min_confidence=0.5, min_lift=1.0):
    df = extract_real_transactions(800)
    frequent_itemsets = apriori(df, min_support=min_support, use_colnames=True)
    if frequent_itemsets.empty:
        return {"rules": [], "itemsets": [], "error": "No itemsets found. Try lowering minimum support."}
    frequent_itemsets['itemsets'] = frequent_itemsets['itemsets'].apply(
        lambda s: frozenset(str(x) for x in s)
    )
    rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=min_confidence)
    if rules.empty:
        return {"rules": [], "itemsets": [], "error": "No rules found. Try lowering minimum confidence."}
    rules = rules[rules['lift'] >= min_lift]
    if rules.empty:
        return {"rules": [], "itemsets": [], "error": "No rules found. Try lowering minimum lift."}
    rules_list = []
    for idx, row in rules.iterrows():
        ant = list(row['antecedents'])
        con = list(row['consequents'])
        rules_list.append({
            "id": f"R{idx+1}",
            "antecedent": ant,
            "consequent": con,
            "support": float(row['support']),
            "confidence": float(row['confidence']),
            "lift": float(row['lift'])
        })
    frequent_itemsets['length'] = frequent_itemsets['itemsets'].apply(lambda x: len(x))
    top_itemsets = frequent_itemsets.sort_values('support', ascending=False).head(15)
    itemsets_list = []
    for _, row in top_itemsets.iterrows():
        itemsets_list.append({
            "items": list(row['itemsets']),
            "support": float(row['support'])
        })
    return {
        "rules": rules_list,
        "itemsets": itemsets_list,
        "summary": {
            "total_rules": len(rules_list),
            "max_lift": float(rules['lift'].max()) if not rules.empty else 0.0,
            "avg_confidence": float(rules['confidence'].mean()) if not rules.empty else 0.0
        }
    }
