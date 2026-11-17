import random
from datetime import datetime, timedelta

DEPARTMENTS = ["Cardiology", "Endocrinology", "Neurology", "Orthopedics", "Internal Medicine"]
DOCTORS = {
    "Cardiology": ["Dr. Smith", "Dr. Patel", "Dr. Williams"],
    "Endocrinology": ["Dr. Jones", "Dr. Kumar", "Dr. Chen"],
    "Neurology": ["Dr. Brown", "Dr. Davis", "Dr. Martinez"],
    "Orthopedics": ["Dr. Wilson", "Dr. Taylor", "Dr. Anderson"],
    "Internal Medicine": ["Dr. Thomas", "Dr. Jackson", "Dr. White"],
}
DIAGNOSIS_CATEGORIES = ["Circulatory", "Endocrine", "Respiratory", "Digestive", "Musculoskeletal"]


def get_rollup_data(level: str, department: str = None):
    random.seed(42)
    data = []
    mult = 0.38 if department else 1.0

    if level == "year":
        for year in [2023, 2024, 2025, 2026]:
            data.append({
                "label": str(year),
                "admissions": int(random.randint(2800, 4500) * mult),
                "cost": round(random.uniform(1_200_000, 2_500_000) * mult, 2),
                "avg_los": round(random.uniform(3.5, 5.5), 1),
            })
    elif level == "quarter":
        for year in [2025, 2026]:
            for q in range(1, 5):
                if year == 2026 and q > 3:
                    continue
                data.append({
                    "label": f"Q{q} {year}",
                    "admissions": int(random.randint(700, 1200) * mult),
                    "cost": round(random.uniform(300_000, 700_000) * mult, 2),
                    "avg_los": round(random.uniform(3.5, 5.5), 1),
                })
    elif level == "month":
        for i in range(11, -1, -1):
            d = datetime.now() - timedelta(days=30 * i)
            data.append({
                "label": d.strftime("%b %Y"),
                "admissions": int(random.randint(180, 420) * mult),
                "cost": round(random.uniform(80_000, 200_000) * mult, 2),
                "avg_los": round(random.uniform(3.5, 5.5), 1),
            })
    elif level == "day":
        for i in range(29, -1, -1):
            d = datetime.now() - timedelta(days=i)
            data.append({
                "label": d.strftime("%d %b"),
                "admissions": int(random.randint(5, 45) * mult),
                "cost": round(random.uniform(2_000, 15_000) * mult, 2),
                "avg_los": round(random.uniform(3.5, 5.5), 1),
            })

    total_adm = sum(r["admissions"] for r in data)
    total_cost = sum(r["cost"] for r in data)
    return {
        "level": level,
        "department_filter": department,
        "data": data,
        "summary": {
            "total_admissions": total_adm,
            "total_cost": round(total_cost, 2),
            "avg_cost_per_admission": round(total_cost / total_adm, 2) if total_adm else 0,
        },
    }


def get_drilldown_data(level: str, parent_id: str = None):
    random.seed(99)

    if level == "department":
        data = []
        for dept in DEPARTMENTS:
            data.append({
                "id": dept,
                "label": dept,
                "admissions": random.randint(800, 3800),
                "cost": round(random.uniform(400_000, 1_800_000), 2),
                "avg_los": round(random.uniform(3.0, 6.0), 1),
                "child_count": len(DOCTORS.get(dept, [])),
            })
        return {"level": "department", "parent": None, "data": data,
                "breadcrumb": [{"label": "All Departments", "id": None, "level": "department"}]}

    elif level == "doctor" and parent_id:
        docs = DOCTORS.get(parent_id, ["Dr. Unknown"])
        data = []
        for doc in docs:
            data.append({
                "id": f"{parent_id}::{doc}",
                "label": doc,
                "admissions": random.randint(150, 800),
                "cost": round(random.uniform(80_000, 400_000), 2),
                "avg_los": round(random.uniform(3.0, 6.0), 1),
                "child_count": random.randint(40, 200),
            })
        return {
            "level": "doctor", "parent": parent_id, "data": data,
            "breadcrumb": [
                {"label": "All Departments", "id": None, "level": "department"},
                {"label": parent_id, "id": parent_id, "level": "doctor"},
            ],
        }

    elif level == "visit" and parent_id:
        dept, doctor = parent_id.split("::", 1)
        data = []
        for i in range(1, 16):
            vd = datetime.now() - timedelta(days=random.randint(1, 90))
            data.append({
                "id": f"V{i:04d}",
                "label": f"Visit V{i:04d}",
                "patient_id": f"P{random.randint(1, 999):04d}",
                "date": vd.strftime("%Y-%m-%d"),
                "diagnosis": random.choice(["Hypertension", "Type 2 Diabetes", "Asthma", "Heart Disease"]),
                "los": random.randint(1, 14),
                "cost": round(random.uniform(500, 8_000), 2),
                "readmission": random.choice([True, False, False]),
            })
        return {
            "level": "visit", "parent": parent_id, "doctor": doctor, "department": dept, "data": data,
            "breadcrumb": [
                {"label": "All Departments", "id": None, "level": "department"},
                {"label": dept, "id": dept, "level": "doctor"},
                {"label": doctor, "id": parent_id, "level": "visit"},
            ],
        }

    return {"level": "department", "data": [], "breadcrumb": []}


def get_slice_data(slice_dim: str, slice_value: str):
    random.seed(77)
    months_data = []
    for i in range(11, -1, -1):
        d = datetime.now() - timedelta(days=30 * i)
        months_data.append({
            "month": d.strftime("%b %Y"),
            "admissions": random.randint(100, 400),
            "cost": round(random.uniform(50_000, 200_000), 2),
            "readmissions": random.randint(10, 60),
        })
    diagnosis_breakdown = [
        {"category": cat, "count": random.randint(50, 400),
         "avg_cost": round(random.uniform(1_000, 8_000), 2)}
        for cat in DIAGNOSIS_CATEGORIES
    ]
    total_adm = sum(m["admissions"] for m in months_data)
    total_cost = sum(m["cost"] for m in months_data)
    return {
        "slice_dimension": slice_dim,
        "slice_value": slice_value,
        "monthly_trend": months_data,
        "diagnosis_breakdown": diagnosis_breakdown,
        "kpis": {
            "total_admissions": total_adm,
            "total_cost": round(total_cost, 2),
            "avg_cost": round(total_cost / total_adm, 2) if total_adm else 0,
            "avg_los": round(random.uniform(3.5, 5.5), 1),
        },
    }


def get_dice_data(filters: dict):
    random.seed(55)
    active = sum(1 for v in filters.values() if v and v.lower() != "all")
    reduction = max(0.08, 1.0 - active * 0.12)

    base_adm = 12840
    base_cost = 54_600_000.0

    filtered_adm = int(base_adm * reduction * random.uniform(0.85, 1.15))
    filtered_cost = round(base_cost * reduction * random.uniform(0.85, 1.15), 2)

    cats = (
        DIAGNOSIS_CATEGORIES
        if not filters.get("diagnosis") or filters["diagnosis"].lower() == "all"
        else [filters["diagnosis"]]
    )
    breakdown = []
    for cat in cats:
        cnt = max(1, int(filtered_adm * random.uniform(0.12, 0.30)))
        breakdown.append({
            "category": cat,
            "admissions": cnt,
            "avg_cost": round(filtered_cost / max(filtered_adm, 1) * random.uniform(0.8, 1.2), 2),
            "readmission_rate": round(random.uniform(0.10, 0.25), 3),
        })

    monthly = []
    for i in range(5, -1, -1):
        d = datetime.now() - timedelta(days=30 * i)
        monthly.append({
            "month": d.strftime("%b %Y"),
            "admissions": max(1, int(filtered_adm / 6 * random.uniform(0.7, 1.3))),
            "cost": round(filtered_cost / 6 * random.uniform(0.7, 1.3), 2),
        })

    return {
        "filters_applied": filters,
        "active_filter_count": active,
        "kpis": {
            "total_admissions": filtered_adm,
            "total_cost": filtered_cost,
            "avg_cost": round(filtered_cost / max(filtered_adm, 1), 2),
            "readmission_rate": round(random.uniform(0.12, 0.22), 3),
        },
        "breakdown": breakdown,
        "monthly_trend": monthly,
    }
