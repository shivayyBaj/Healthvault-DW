import pandas as pd
import numpy as np
from mlxtend.frequent_patterns import apriori, association_rules

def generate_transactions(n=500):
    np.random.seed(42)
    # Generate synthetic patient profiles
    data = []
    for _ in range(n):
        age_group = np.random.choice(["Age: 19-35", "Age: 36-50", "Age: 51-70", "Age: 71+"], p=[0.2, 0.3, 0.3, 0.2])
        gender = np.random.choice(["Gender: M", "Gender: F"])
        
        # Base probabilities
        p_smoke = 0.2
        p_hyper = 0.3
        p_diabetes = 0.15
        
        if "51-70" in age_group or "71+" in age_group:
            p_hyper += 0.2
            p_diabetes += 0.15
            
        smoking = np.random.random() < p_smoke
        high_bp = np.random.random() < p_hyper
        diabetes = np.random.random() < p_diabetes
        
        # Heart disease is heavily dependent on the others
        p_heart = 0.05
        if smoking: p_heart += 0.1
        if high_bp: p_heart += 0.2
        if diabetes: p_heart += 0.2
        heart_disease = np.random.random() < p_heart
        
        record = {
            age_group: True,
            gender: True,
            "Smoker": smoking,
            "High BP": high_bp,
            "Diabetes": diabetes,
            "Heart Disease": heart_disease,
        }
        
        # Add diagnosis category
        diag = np.random.choice(["Diag: Circulatory", "Diag: Endocrine", "Diag: Respiratory", "Diag: Digestive"])
        if heart_disease:
            diag = "Diag: Circulatory"
        elif diabetes:
            diag = "Diag: Endocrine"
            
        record[diag] = True
        data.append(record)
        
    df = pd.DataFrame(data).fillna(False).astype(bool)
    return df

def mine_rules(min_support=0.1, min_confidence=0.5, min_lift=1.0):
    df = generate_transactions(800)
    
    # 1. Frequent Itemsets
    frequent_itemsets = apriori(df, min_support=min_support, use_colnames=True)
    
    if frequent_itemsets.empty:
        return {"rules": [], "itemsets": [], "error": "No itemsets found. Try lowering minimum support."}
    
    # Ensure items are standard Python str to avoid NumPy 2.x generic scalar casting in mlxtend
    frequent_itemsets['itemsets'] = frequent_itemsets['itemsets'].apply(
        lambda s: frozenset(str(x) for x in s)
    )
        
    # 2. Association Rules
    rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=min_confidence)
    
    if rules.empty:
        return {"rules": [], "itemsets": [], "error": "No rules found. Try lowering minimum confidence."}
        
    rules = rules[rules['lift'] >= min_lift]
    
    if rules.empty:
        return {"rules": [], "itemsets": [], "error": "No rules found. Try lowering minimum lift."}
    
    # Format rules for JSON
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
        
    # Format itemsets for JSON (Top 15)
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
            "max_lift": float(rules['lift'].max()),
            "avg_confidence": float(rules['confidence'].mean())
        }
    }
