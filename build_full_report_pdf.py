from pdf_engine import PDFDoc, PageBuilder

def generate_full_pdf():
    pdf = PDFDoc()
    
    # ==========================================
    # PAGE 1: TITLE / COVER PAGE
    # ==========================================
    p1 = PageBuilder(1, 20)
    # Page border
    p1.draw_rect(35, 35, 525, 772, stroke_rgb=(0.15, 0.28, 0.5), stroke_width=2.0)
    p1.draw_rect(39, 39, 517, 764, stroke_rgb=(0.7, 0.75, 0.85), stroke_width=0.75)
    
    # Institution Header
    p1.text(297.64, 755, "Jaypee Institute of Information Technology", font="F2", size=18, r=0.08, g=0.18, b=0.4, align="center")
    p1.text(297.64, 735, "Sector - 62, Noida", font="F1", size=12.5, r=0.2, g=0.2, b=0.2, align="center")
    p1.text(297.64, 715, "Department of Computer Science & Engineering", font="F2", size=13, r=0.15, g=0.25, b=0.45, align="center")
    
    # Emblem / Shield Box
    p1.draw_rect(255, 600, 85, 85, fill_rgb=(0.95, 0.97, 1.0), stroke_rgb=(0.15, 0.35, 0.7), stroke_width=1.5)
    p1.text(297.64, 658, "JIIT", font="F2", size=18, r=0.12, g=0.3, b=0.65, align="center")
    p1.text(297.64, 640, "NOIDA", font="F2", size=9, r=0.25, g=0.35, b=0.5, align="center")
    p1.text(297.64, 622, "ESTD. 2001", font="F1", size=8, r=0.4, g=0.4, b=0.4, align="center")
    p1.text(297.64, 608, "VIDYA TATTVA JYOTIRMAYA", font="F1", size=7.0, r=0.3, g=0.4, b=0.6, align="center")
    
    # Project Title
    p1.text(297.64, 545, "HealthVault DW", font="F2", size=24, r=0.08, g=0.22, b=0.5, align="center")
    p1.text(297.64, 520, "Healthcare Data Warehouse & Intelligent Analytics Platform", font="F3", size=12, r=0.2, g=0.25, b=0.35, align="center")
    
    # Academic Session & Subject
    p1.text(297.64, 470, "Academic Session: 2026-2027", font="F2", size=12, r=0.1, g=0.1, b=0.1, align="center")
    p1.text(297.64, 450, "Data Mining and Data Warehousing Project Report", font="F1", size=11, r=0.3, g=0.3, b=0.35, align="center")
    
    # Bottom Horizontal Rule
    p1.draw_line(50, 370, 545, 370, width=0.75, r=0.8, g=0.82, b=0.88)
    
    # Submitted To (Left Column)
    p1.text(65, 345, "Submitted To:", font="F2", size=12, r=0.08, g=0.2, b=0.45)
    p1.text(65, 325, "Dr. Diksha Pandey", font="F2", size=10, r=0.15, g=0.15, b=0.15)
    p1.text(65, 310, "Assistant Professor, Dept. of CSE", font="F1", size=8.5, r=0.35, g=0.35, b=0.35)
    p1.text(65, 290, "Dr. Sayani Ghosal", font="F2", size=10, r=0.15, g=0.15, b=0.15)
    p1.text(65, 275, "Assistant Professor, Dept. of CSE", font="F1", size=8.5, r=0.35, g=0.35, b=0.35)
    p1.text(65, 255, "Dr. Rajshree Srivastava", font="F2", size=10, r=0.15, g=0.15, b=0.15)
    p1.text(65, 240, "Assistant Professor, Dept. of CSE", font="F1", size=8.5, r=0.35, g=0.35, b=0.35)
    p1.text(65, 215, "Jaypee Institute of Information Technology, Noida", font="F3", size=8.0, r=0.4, g=0.4, b=0.45)

    # Submitted By (Right Column)
    p1.text(320, 345, "Submitted By:", font="F2", size=12, r=0.08, g=0.2, b=0.45)
    # Mini table for students
    headers_s = ["Name", "Batch", "Enrollment"]
    rows_s = [
        ["Ashutosh Pandey", "B7", "2401030284"],
        ["Shivesh Bajpai", "B7", "2401030296"],
        ["Upanshi Mittal", "B7", "2401030303"],
        ["Anushka Shukla", "B7", "2401030012"]
    ]
    cur_ty = 325
    p1.draw_rect(320, cur_ty - 12, 220, 14, fill_rgb=(0.15, 0.28, 0.5))
    p1.text(325, cur_ty - 9, "Name", font="F2", size=8.5, r=1, g=1, b=1)
    p1.text(420, cur_ty - 9, "Batch", font="F2", size=8.5, r=1, g=1, b=1)
    p1.text(460, cur_ty - 9, "Enrollment", font="F2", size=8.5, r=1, g=1, b=1)
    cur_ty -= 12
    for r_idx, r_data in enumerate(rows_s):
        fill = (0.95, 0.97, 1.0) if r_idx % 2 == 1 else (1.0, 1.0, 1.0)
        p1.draw_rect(320, cur_ty - 14, 220, 14, fill_rgb=fill, stroke_rgb=(0.85, 0.88, 0.92), stroke_width=0.5)
        p1.text(325, cur_ty - 10, r_data[0], font="F2" if "Shivesh" in r_data[0] or "Anushka" in r_data[0] else "F1", size=8.2, r=0.15, g=0.15, b=0.2)
        p1.text(425, cur_ty - 10, r_data[1], font="F1", size=8.2, r=0.2, g=0.2, b=0.2)
        p1.text(465, cur_ty - 10, r_data[2], font="F2", size=8.2, r=0.1, g=0.2, b=0.45)
        cur_ty -= 14
        
    p1.text(320, 215, "B.Tech CSE - 6th Semester", font="F3", size=8.5, r=0.35, g=0.35, b=0.4)
    pdf.pages.append(p1.render())
    
    # ==========================================
    # PAGE 2: CERTIFICATE & ACKNOWLEDGEMENTS
    # ==========================================
    p2 = PageBuilder(2, 20)
    p2.add_h1("CERTIFICATE OF ORIGINALITY")
    p2.add_paragraph(
        "This is to certify that the project report entitled 'HealthVault DW: Healthcare Data Warehouse & "
        "Intelligent Analytics Platform', submitted by Ashutosh Pandey (2401030284), Shivesh Bajpai (2401030296), "
        "Upanshi Mittal (2401030303), and Anushka Shukla (2401030012) in partial fulfillment of the requirements for "
        "the award of the degree of Bachelor of Technology in Computer Science & Engineering at Jaypee Institute of "
        "Information Technology, Sector-62, Noida, is an authentic record of the research and engineering work "
        "carried out by them under our supervision and guidance."
    )
    p2.add_paragraph(
        "To the best of our knowledge, the matter embodied in this capstone report has not been submitted elsewhere "
        "for the award of any other degree, diploma, or academic credential."
    )
    p2.y -= 25
    # Signature Lines
    p2.draw_line(50, p2.y, 180, p2.y, width=1.0, r=0.3, g=0.3, b=0.3)
    p2.draw_line(230, p2.y, 360, p2.y, width=1.0, r=0.3, g=0.3, b=0.3)
    p2.draw_line(410, p2.y, 540, p2.y, width=1.0, r=0.3, g=0.3, b=0.3)
    p2.text(50, p2.y - 12, "Dr. Diksha Pandey", font="F2", size=9, r=0.1, g=0.1, b=0.1)
    p2.text(50, p2.y - 23, "Assistant Professor, Dept. of CSE", font="F1", size=7.5, r=0.3, g=0.3, b=0.3)
    p2.text(230, p2.y - 12, "Dr. Sayani Ghosal", font="F2", size=9, r=0.1, g=0.1, b=0.1)
    p2.text(230, p2.y - 23, "Assistant Professor, Dept. of CSE", font="F1", size=7.5, r=0.3, g=0.3, b=0.3)
    p2.text(410, p2.y - 12, "Dr. Rajshree Srivastava", font="F2", size=9, r=0.1, g=0.1, b=0.1)
    p2.text(410, p2.y - 23, "Assistant Professor, Dept. of CSE", font="F1", size=7.5, r=0.3, g=0.3, b=0.3)
    
    p2.y -= 55
    p2.add_h1("ACKNOWLEDGEMENTS")
    p2.add_paragraph(
        "We wish to express our profound gratitude and heartfelt appreciation to our esteemed course instructors and project "
        "guides, Dr. Diksha Pandey, Dr. Sayani Ghosal, and Dr. Rajshree Srivastava, Department of Computer Science & "
        "Engineering, Jaypee Institute of Information Technology, Noida, for their invaluable mentorship, insightful "
        "critiques, and continuous academic guidance throughout the design and realization of HealthVault DW."
    )
    p2.add_paragraph(
        "We also convey our sincere thanks to the Head of the Department and the administration of JIIT Noida for "
        "providing the computational laboratory resources, network facilities, and access to academic repositories that "
        "enabled the rigorous testing of large-scale clinical data pipelines."
    )
    p2.add_paragraph(
        "Finally, we extend our heartfelt gratitude to one another for exemplary team cooperation, synchronized sprint "
        "milestones, and passionate technical collaboration across both backend data engineering and frontend analytics."
    )
    p2.y -= 15
    p2.text(380, p2.y, "Team Members: Ashutosh Pandey, Shivesh Bajpai,", font="F3", size=8.5, r=0.2, g=0.25, b=0.35)
    p2.text(440, p2.y - 11, "Upanshi Mittal, Anushka Shukla", font="F3", size=8.5, r=0.2, g=0.25, b=0.35)
    pdf.pages.append(p2.render())

    # ==========================================
    # PAGE 3: ABSTRACT & TABLE OF CONTENTS
    # ==========================================
    p3 = PageBuilder(3, 20)
    p3.add_h1("ABSTRACT")
    p3.add_paragraph(
        "Modern hospital systems generate massive, heterogeneous electronic health records (EHRs) encompassing clinical "
        "diagnoses, pharmacy dispatches, inpatient admissions, and financial expenditures. Traditional transaction processing "
        "(OLTP) architectures are fundamentally unsuited for multi-perspective clinical analytics due to high locking overhead "
        "and normalized table fragmentation. This project presents HealthVault DW, an enterprise-grade Healthcare Data Warehouse "
        "and Intelligent Analytics Platform engineered to ingest, clean, and analyze multi-hospital clinical encounters.",
        size=9.2, leading=12.0
    )
    p3.add_paragraph(
        "HealthVault DW establishes a multidimensional Star Schema featuring Slowly Changing Dimensions (SCD Type 2) across "
        "71,518 unique patients and 101,766 hospital visits from three benchmark clinical datasets (Diabetes 130-US Hospitals, "
        "UCI Heart Disease, and Pima Indians Diabetes). An automated ETL engine cleans missing values, assigns surrogate keys, "
        "and links diagnostic classifications. An integrated OLAP engine enables interactive Roll-Up, Drill-Down, Slicing, "
        "Dicing, and Pivoting. Furthermore, advanced data mining modules integrate: (i) SMOTE-balanced supervised learning "
        "for 30-day readmission prediction, (ii) K-Means clustering and PCA for patient health stratification, (iii) Apriori "
        "association rule mining discovering 1,270 clinical comorbidity and polypharmacy patterns, (iv) ARIMA time-series "
        "forecasting for hospital bed census, and (v) SHAP and LIME Explainable AI (XAI) for transparent clinical interpretability.",
        size=9.2, leading=12.0
    )
    p3.text(50, p3.y - 4, "Keywords: Data Warehousing, Star Schema, SCD Type 2, OLAP, Apriori, K-Means, SMOTE, ARIMA, SHAP/LIME.", font="F3", size=8.5, r=0.2, g=0.3, b=0.5)
    
    p3.y -= 25
    p3.add_h1("TABLE OF CONTENTS")
    toc_items = [
        ("Chapter 1: Introduction, Motivation & Clinical Problem Statement", "Page 4"),
        ("Chapter 2: Literature Review & Theoretical Foundations", "Page 5"),
        ("Chapter 3: Topics Covered & Course Curriculum Alignment", "Page 6"),
        ("Chapter 4: Clinical Datasets & Preprocessing Methodology", "Page 7"),
        ("Chapter 5: System Architecture & Proposed Work", "Page 8"),
        ("Chapter 6: Multidimensional Star Schema & SCD Type 2 Design", "Page 9"),
        ("Chapter 7: OLAP Multidimensional Engine Design & Primitives", "Page 10"),
        ("Chapter 8: Data Mining - Supervised Learning & SMOTE Pipeline", "Page 11"),
        ("Chapter 9: Data Mining - Clustering (K-Means/PCA) & Association Rules", "Page 12"),
        ("Chapter 10: Time-Series Forecasting (ARIMA) & Hypothesis Testing", "Page 13"),
        ("Chapter 11: Explainable AI Framework (SHAP & LIME)", "Page 14"),
        ("Chapter 12: Implementation Details: Member 1 (Shivesh Bajpai)", "Page 15"),
        ("Chapter 13: Implementation Details: Member 2 (Anushka Shukla)", "Page 16"),
        ("Chapter 14: Implementation Details: Member 3 (Ashutosh Pandey)", "Page 17"),
        ("Chapter 15: Implementation Details: Member 4 (Upanshi Mittal)", "Page 18"),
        ("Chapter 16: Experimental Results, Dashboards & Visual Analytics", "Page 19"),
        ("Chapter 17: Conclusion, Future Scope & Academic References", "Page 20"),
    ]
    for title, p_str in toc_items:
        p3.text(50, p3.y, title, font="F1", size=8.5, r=0.15, g=0.15, b=0.2)
        p3.text(510, p3.y, p_str, font="F2", size=8.5, r=0.1, g=0.2, b=0.45)
        p3.draw_line(50 + len(title)*5.2, p3.y + 2, 505, p3.y + 2, width=0.5, r=0.85, g=0.85, b=0.85)
        p3.y -= 13.5
    pdf.pages.append(p3.render())

    # ==========================================
    # PAGE 4: CHAPTER 1 - INTRODUCTION & MOTIVATION
    # ==========================================
    p4 = PageBuilder(4, 20)
    p4.add_h1("Chapter 1: Introduction, Motivation & Problem Statement")
    p4.add_h2("1.1 Introduction")
    p4.add_paragraph(
        "The modern healthcare delivery ecosystem is characterized by an exponential expansion in electronic health record (EHR) "
        "data generation. Hospital enterprises, regional healthcare networks, and medical centers continuously record multi-dimensional "
        "information: inpatient encounter chronologies, laboratory test values, attending physician specializations, international "
        "disease classification (ICD) codes, surgical intervention records, and itemized billing statements. Despite the sheer volume "
        "of captured information, converting operational data into proactive clinical and administrative insights remains a major challenge."
    )
    p4.add_h2("1.2 Motivation")
    p4.add_paragraph(
        "Operational databases in hospitals are constructed upon Online Transaction Processing (OLTP) principles, strictly normalized "
        "into Third Normal Form (3NF) to optimize transactional throughput and eliminate insert/update anomalies. However, executing "
        "exploratory queries across multi-year patient timelines introduces debilitating lock contention and multi-table join latency. "
        "A dedicated Healthcare Data Warehouse (HDW) resolves this by organizing facts into denormalized dimensional structures."
    )
    p4.add_callout(
        "Core Clinical Challenge: Hospital Readmission Burden",
        "Unplanned 30-day hospital readmissions impose billions of dollars in annual penalties under the Hospital Readmissions "
        "Reduction Program (HRRP), signaling gaps in discharge protocols and post-acute chronic disease management.",
        r_bar=0.8, g_bar=0.25, b_bar=0.25
    )
    p4.add_h2("1.3 Formal Problem Statement")
    p4.add_paragraph("HealthVault DW addresses five fundamental computational and analytical challenges in modern healthcare informatics:")
    p4.add_bullet("1. Data Fragmentation & Schema Heterogeneity:", "Consolidating disparate clinical datasets into an integrated warehouse.")
    p4.add_bullet("2. Historical State Degradation:", "Preserving temporal changes in patient demographics and insurances via SCD Type 2.")
    p4.add_bullet("3. Rigid Analytical Reporting:", "Providing an interactive OLAP engine supporting instantaneous Roll-Up, Drill-Down, and Slice.")
    p4.add_bullet("4. Extreme Clinical Class Imbalance:", "Mitigating majority-class bias in 30-day readmission prediction using SMOTE.")
    p4.add_bullet("5. Clinical Decision Black-Boxes:", "Delivering game-theoretic SHAP and local LIME feature attributions to justify ML predictions.")
    pdf.pages.append(p4.render())

    # ==========================================
    # PAGE 5: CHAPTER 2 - LITERATURE SURVEY
    # ==========================================
    p5 = PageBuilder(5, 20)
    p5.add_h1("Chapter 2: Literature Review & Theoretical Foundations")
    p5.add_h2("2.1 Dimensional Modeling: The Kimball Methodology")
    p5.add_paragraph(
        "Dimensional modeling, formulated by Ralph Kimball, represents the foundation of analytical data warehousing. Kimball "
        "distinguishes between transactional operational systems and multidimensional analytical schemas. Central to this paradigm "
        "is the Star Schema, comprising numerical Fact Tables surrounded by descriptive Dimension Tables connected through foreign keys."
    )
    p5.add_paragraph(
        "To capture attributes that change slowly over time (e.g., patient insurance coverage or BMI categories), Slowly Changing "
        "Dimensions (SCD) are deployed. While SCD Type 1 overwrites existing records, destroying historical audit trails, SCD Type 2 "
        "generates a new record with surrogate primary keys, valid date intervals, and an active status flag."
    )
    p5.add_h2("2.2 The CRISP-DM Framework in Healthcare")
    p5.add_paragraph(
        "HealthVault DW adheres to the Cross-Industry Standard Process for Data Mining (CRISP-DM), encompassing Business Understanding, "
        "Data Understanding, Data Preparation, Dimensional Modeling, Machine Learning Evaluation, and Deployment via Interactive Dashboards."
    )
    p5.add_h2("2.3 Theoretical Foundations of Applied Algorithms")
    p5.add_bullet("SMOTE Resampling:", "Synthesizes minority instances along feature-space k-NN line segments to prevent classifier bias.")
    p5.add_bullet("Apriori Association Mining:", "Exploits the anti-monotone property of frequent itemsets to uncover multi-drug interactions.")
    p5.add_bullet("K-Means & PCA Clustering:", "Partitions multi-attribute biomarker profiles into distinct metabolic risk strata.")
    p5.add_bullet("ARIMA Time-Series Modeling:", "Leverages autoregressive and moving average terms to forecast daily hospital admissions.")
    p5.add_bullet("Game-Theoretic SHAP Attributions:", "Computes exact Shapley values to apportion individual risk factors to clinical outcomes.")
    pdf.pages.append(p5.render())

    # ==========================================
    # PAGE 6: CHAPTER 3 - TOPICS COVERED & CURRICULUM
    # ==========================================
    p6 = PageBuilder(6, 20)
    p6.add_h1("Chapter 3: Topics Covered & Course Alignment")
    p6.add_paragraph(
        "HealthVault DW provides a rigorous, end-to-end implementation of all core subject areas mandated by the academic "
        "curriculum of Data Mining and Data Warehousing (DMDW). Below is the comprehensive topic-to-module mapping matrix:"
    )
    headers_c = ["DMDW Subject Topic", "HealthVault DW Implementation", "Module / Service"]
    rows_c = [
        ["Multidimensional Modeling", "Star Schema: FactPatientVisit + 4 Dimensions", "models.py"],
        ["Slowly Changing Dimensions", "SCD Type 2 with effective_date, expiry_date, is_current", "models.py / etl_service.py"],
        ["ETL Pipeline Architecture", "Extract, Clean, Surrogate Key Generation, Bulk Load", "etl_service.py / data_loader.py"],
        ["OLAP Primitives", "Roll-Up, Drill-Down, Slice, Dice, and Pivot Operations", "olap_service.py"],
        ["Data Preprocessing", "ICD-9 Mapping, Median Imputation, Standard Scaling", "data_loader.py"],
        ["Class Imbalance Handling", "SMOTE (Synthetic Minority Over-sampling Technique)", "ml_service.py"],
        ["Supervised Classification", "Multi-Model Benchmarking (RF, GBDT, LR, DT, KNN, MLP)", "ml_service.py"],
        ["Model Evaluation Metrics", "Confusion Matrix, ROC Curves, Precision, Recall, F1", "ml_service.py"],
        ["Unsupervised Clustering", "K-Means Clustering with Elbow and Silhouette Validation", "clustering_service.py"],
        ["Dimensionality Reduction", "Principal Component Analysis (PCA 2D Projection)", "clustering_service.py"],
        ["Association Rule Mining", "Apriori Algorithm (Support, Confidence, Lift Filters)", "association_service.py"],
        ["Time-Series Forecasting", "ARIMA(2,1,1) Admissions Forecasting with 95% CI", "forecasting_service.py"],
        ["Inferential Hypothesis Testing", "Two-Sample t-Test, One-Way ANOVA, Chi-Square", "stats_service.py"],
        ["Explainable AI (XAI)", "TreeSHAP Global/Local Importance and LIME Perturbations", "xai_service.py"]
    ]
    p6.add_table(headers_c, rows_c, [130, 245, 112])
    pdf.pages.append(p6.render())

    # ==========================================
    # PAGE 7: CHAPTER 4 - CLINICAL DATASETS
    # ==========================================
    p7 = PageBuilder(7, 20)
    p7.add_h1("Chapter 4: Clinical Datasets & Preprocessing Methodology")
    p7.add_h2("4.1 Dataset Inventories")
    p7.add_paragraph("HealthVault DW synthesizes three real-world, peer-reviewed clinical repositories to evaluate the warehouse and algorithms:")
    
    headers_d = ["Dataset Name", "Records", "Attributes", "Clinical Target / Role in Warehouse"]
    rows_d = [
        ["Diabetes 130-US Hospitals", "101,766", "50", "30-Day Readmission Target; Primary Fact Table Driver"],
        ["UCI Heart Disease (Cleveland)", "303", "14", "Angiographic Disease; Enriches BP, Heart Rate, Cholesterol"],
        ["Pima Indians Diabetes", "768", "9", "Onset Diabetes; Enriches Serum Glucose, BMI & Insulin"]
    ]
    p7.add_table(headers_d, rows_d, [135, 55, 55, 242])
    
    p7.add_h2("4.2 Preprocessing & Data Cleansing Routines")
    p7.add_bullet("Missing Value Imputation:", "Replaced '?' symbols with 'Unknown' for payer codes and median values for laboratory counts.")
    p7.add_bullet("ICD-9 Disease Categorization:", "Mapped numeric codes to clinical groups (Circulatory, Respiratory, Digestive, Diabetes).")
    p7.add_bullet("Biomarker Harmonization:", "Probabilistically linked physiological vitals to enrich hospital inpatient records.")
    
    p7.add_code_block([
        "# Clinical Preprocessing & Categorization Routine",
        "def map_icd9_category(code):",
        "    if code.startswith(('390', '459')) or code == '785': return 'Circulatory'",
        "    if code.startswith(('460', '519')) or code == '786': return 'Respiratory'",
        "    if code.startswith(('520', '579')) or code == '787': return 'Digestive'",
        "    if code.startswith(('250')): return 'Diabetes'",
        "    return 'Other'"
    ], title="Listing 4.1: ICD-9 Disease Code Categorization Logic")
    pdf.pages.append(p7.render())

    # ==========================================
    # PAGE 8: CHAPTER 5 - SYSTEM ARCHITECTURE
    # ==========================================
    p8 = PageBuilder(8, 20)
    p8.add_h1("Chapter 5: System Architecture & Proposed Work")
    p8.add_h2("5.1 Three-Tier Architecture")
    p8.add_paragraph(
        "HealthVault DW adopts a modern Three-Tier Architecture providing clear separation between Data Ingestion, Analytical "
        "Processing, and Presentation Visualizations:"
    )
    
    # Textual diagram box
    box_lines = [
        "+---------------------------------------------------------------------------------------+",
        "| TIER 1: DATA SOURCES & STAGING AREA                                                   |",
        "|  - Diabetes 130-US Hospitals (101,766 Rows) | UCI Heart (303) | Pima Diabetes (768)  |",
        "|  - Automated ETL Pipeline: Profiling, Cleaning, SCD-2 Version Tracking               |",
        "+---------------------------------------------------------------------------------------+",
        "                                           |                                             ",
        "                                           v                                             ",
        "+---------------------------------------------------------------------------------------+",
        "| TIER 2: ENTERPRISE DATA WAREHOUSE & ANALYTICAL MINING ENGINES                        |",
        "|  - Star Schema Repository (SQLite / SQLAlchemy)                                       |",
        "|  - OLAP Multidimensional Engine (Roll-Up, Drill-Down, Slice, Dice, Pivot)             |",
        "|  - Machine Learning & Mining Engine (Supervised Classifiers, SMOTE, K-Means, Apriori)|",
        "|  - Explainable AI Engine (SHAP Game-Theoretic Values & LIME Perturbations)            |",
        "+---------------------------------------------------------------------------------------+",
        "                                           |                                             ",
        "                                           v                                             ",
        "+---------------------------------------------------------------------------------------+",
        "| TIER 3: PRESENTATION & VISUAL ANALYTICS DASHBOARD                                     |",
        "|  - High-Throughput REST API Gateway (FastAPI / Flask)                                 |",
        "|  - React 18 + TypeScript Analytical Dashboard (Recharts, Reactive FilterBar)          |",
        "+---------------------------------------------------------------------------------------+"
    ]
    p8.add_code_block(box_lines, title="Figure 5.1: Three-Tier Healthcare Data Warehouse Architecture")
    
    p8.add_h2("5.2 Proposed Work Objectives")
    p8.add_bullet("Surrogate Key Generation:", "Decouple analytical queries from brittle operational patient natural identifiers.")
    p8.add_bullet("Multi-Model Benchmarking:", "Evaluate six classifiers under balanced vs unbalanced clinical distributions.")
    p8.add_bullet("Explainable Clinical Insights:", "Deliver transparent justifications for predictive outputs to clinical staff.")
    pdf.pages.append(p8.render())

    # ==========================================
    # PAGE 9: CHAPTER 6 - STAR SCHEMA & SCD-2
    # ==========================================
    p9 = PageBuilder(9, 20)
    p9.add_h1("Chapter 6: Multidimensional Star Schema & SCD-2 Design")
    p9.add_h2("6.1 Star Schema Architecture")
    p9.add_paragraph(
        "At the core of HealthVault DW is a classic Star Schema centered around the 'FactPatientVisit' table, surrounded by four "
        "conformed dimension tables: DimPatient, DimDoctor, DimDiagnosis, and DimDate."
    )
    
    schema_diagram = [
        "                      +---------------------------------------+",
        "                      |              DimDoctor                |",
        "                      |---------------------------------------|",
        "                      | doctor_key (PK) | name | department   |",
        "                      +---------------------------------------+",
        "                                          |",
        "  +----------------------+                | 1:N              +----------------------+",
        "  |      DimPatient      |                |                  |     DimDiagnosis     |",
        "  |----------------------| 1:N +----------------------+ 1:N  |----------------------|",
        "  | patient_key (PK,SCD2)|-----+  FactPatientVisit    +------| diagnosis_key (PK)   |",
        "  | patient_id (Natural) |     |----------------------|      | icd_code | category  |",
        "  | age | gender | bmi   |     | visit_key (PK)       |      +----------------------+",
        "  | insurance_type       |     | length_of_stay       |                 |",
        "  | effective_date       |     | treatment_cost ($)   |                 | 1:N",
        "  | expiry_date          |     | blood_pressure       |      +----------------------+",
        "  | is_current (Boolean) |     | glucose_level        |      |       DimDate        |",
        "  +----------------------+     | readmission_flag     |      |----------------------|",
        "                               +----------------------+      | date_key (PK YYYYMMDD|",
        "                                          |                  | date | day | month   |",
        "                                          +------------------| quarter | year       |",
        "                                                 1:N         +----------------------+"
    ]
    p9.add_code_block(schema_diagram, title="Figure 6.1: HealthVault DW Star Schema Entity-Relationship Model")
    
    p9.add_h2("6.2 SCD Type 2 Implementation")
    p9.add_paragraph(
        "When patient demographics or insurance changes, SCD Type 2 marks the active record's 'expiry_date' to the current date "
        "and sets 'is_current = False'. A new record is inserted with a newly minted 'patient_key' surrogate and 'is_current = True'. "
        "Historical visits remain linked to their original surrogate key, preserving historical analytical integrity."
    )
    pdf.pages.append(p9.render())

    # ==========================================
    # PAGE 10: CHAPTER 7 - OLAP ENGINE DESIGN
    # ==========================================
    p10 = PageBuilder(10, 20)
    p10.add_h1("Chapter 7: OLAP Multidimensional Engine Design")
    p10.add_h2("7.1 Multidimensional OLAP Primitives")
    p10.add_paragraph(
        "The OLAP engine provides rapid multidimensional views over hospital admissions, length of stay, and medical expenses. "
        "HealthVault DW implements five classic analytical primitives:"
    )
    p10.add_bullet("1. Roll-Up (Climb Hierarchy):", "Aggregates atomic encounter metrics up the temporal dimension: Day -> Month -> Quarter -> Year.")
    p10.add_bullet("2. Drill-Down (Descend Hierarchy):", "Navigates from summary organizational units down to individual physicians and patient visits.")
    p10.add_bullet("3. Slice (Fixed Dimension):", "Extracts a 2D sub-cube by fixing a single dimensional coordinate (e.g., Department = 'Cardiology').")
    p10.add_bullet("4. Dice (Multi-Dimensional Bound):", "Extracts sub-cubes satisfying multi-dimensional bounding predicates (e.g., Age 60-80 AND Year 2026).")
    p10.add_bullet("5. Pivot (Rotate Axis):", "Rotates dimensional axes for cross-tabulation analysis (e.g., Rows: Department, Columns: Age Cohort).")
    
    p10.add_h2("7.2 Mathematical Foundations of OLAP")
    p10.add_paragraph(
        "Given an n-dimensional data cube C(d1, d2, ..., dn) and a hierarchy h: L0 -> L1 -> ... -> Lk, the Roll-Up operator replaces "
        "granular dimension values with higher-level ancestors, summing the fact measure M:"
    )
    p10.add_code_block([
        "# Mathematical Definition of Roll-Up Operator",
        "M_rollup(L_{i+1}) = sum_{x in children(L_{i+1})} M(x)",
        "",
        "# Mathematical Definition of Slicing Operator",
        "C_slice = sigma_{d_i = v_k}(C)",
        "",
        "# Mathematical Definition of Dicing Operator",
        "C_dice = sigma_{(d_1 in V_1) and (d_2 in V_2) ... and (d_m in V_m)}(C)"
    ], title="Listing 7.1: Formal Definitions of OLAP Primitives")
    pdf.pages.append(p10.render())

    # ==========================================
    # PAGE 11: CHAPTER 8 - SUPERVISED LEARNING & SMOTE
    # ==========================================
    p11 = PageBuilder(11, 20)
    p11.add_h1("Chapter 8: Data Mining - Supervised Learning & SMOTE")
    p11.add_h2("8.1 30-Day Readmission Risk Classification")
    p11.add_paragraph(
        "Predicting whether a discharged inpatient will require unplanned readmission within 30 days is formulated as a binary "
        "supervised classification task. In the Diabetes 130-US Hospitals dataset, readmitted encounters account for only 11.2% "
        "(11,357 positive vs 90,409 negative encounters), presenting a severe class imbalance challenge."
    )
    p11.add_h2("8.2 SMOTE Formulation")
    p11.add_paragraph(
        "Training classifiers directly on uncorrected distributions causes algorithms to predict negative discharges for almost all "
        "cases, achieving ~88.8% accuracy with near-zero recall. To correct this, HealthVault DW applies SMOTE (Synthetic Minority "
        "Over-sampling Technique):"
    )
    p11.add_code_block([
        "# SMOTE Vector Synthesis Formula",
        "x_new = x_i + lambda * (x_zi - x_i),  where lambda ~ Uniform(0, 1)",
        "# x_zi is a randomly chosen neighbor from the k-nearest minority instances."
    ], title="Listing 8.1: SMOTE Mathematical Synthesis Formula")
    
    p11.add_h2("8.3 Multi-Model Benchmarking Suite")
    p11.add_paragraph("HealthVault DW trains and cross-evaluates six distinct machine learning algorithms:")
    p11.add_bullet("Random Forest (RF):", "Ensemble of 100 decorrelated decision trees with bootstrap aggregation.")
    p11.add_bullet("Gradient Boosting (GBDT):", "Sequential boosting minimizing logistic loss via gradient descent.")
    p11.add_bullet("Logistic Regression (LR):", "L2-regularized linear model serving as an interpretable baseline.")
    p11.add_bullet("Decision Tree (CART):", "Recursive binary partitioning tree minimizing Gini impurity.")
    p11.add_bullet("K-Nearest Neighbors (KNN):", "Instance-based non-parametric classifier using Euclidean distance.")
    p11.add_bullet("Multi-Layer Perceptron (MLP):", "Feedforward neural network with ReLU activations and Adam optimizer.")
    pdf.pages.append(p11.render())

    # ==========================================
    # PAGE 12: CHAPTER 9 - CLUSTERING & ASSOCIATION
    # ==========================================
    p12 = PageBuilder(12, 20)
    p12.add_h1("Chapter 9: Clustering (K-Means/PCA) & Association Rules")
    p12.add_h2("9.1 Unsupervised Patient Health Stratification (K-Means + PCA)")
    p12.add_paragraph(
        "To group patients into meaningful clinical cohorts without pre-existing labels, HealthVault DW applies K-Means clustering "
        "over standardized continuous biomarkers: Age, BMI, Blood Glucose, Blood Pressure, and Heart Rate."
    )
    p12.add_paragraph(
        "The optimal number of clusters (k = 3) was determined through Elbow method inertia analysis and Silhouette coefficient "
        "evaluation (mean score = 0.482). 2D PCA projection reveals three distinct clinical patient cohorts:"
    )
    p12.add_bullet("Cohort 0: 'Routine / Metabolically Stable':", "Younger patients, normal BMI, standard length of stay.")
    p12.add_bullet("Cohort 1: 'Cardiometabolic Risk Strata':", "Elevated resting BP, higher BMI, moderate inpatient length of stay.")
    p12.add_bullet("Cohort 2: 'Acute / Complex Diabetic Cohort':", "High serum glucose, advanced age, frequent readmissions.")
    
    p12.add_h2("9.2 Association Rule Mining (The Apriori Algorithm)")
    p12.add_paragraph(
        "Clinical inpatient stays often involve concurrent secondary diagnoses and multiple drug prescriptions. HealthVault DW "
        "converts each encounter into a transaction of medical events to uncover clinical comorbidities:"
    )
    p12.add_code_block([
        "# Association Rule Quality Metrics",
        "Support(A => B) = P(A union B) = count(A union B) / |D|",
        "Confidence(A => B) = P(B | A) = Support(A union B) / Support(A)",
        "Lift(A => B) = Confidence(A => B) / Support(B)"
    ], title="Listing 9.1: Apriori Association Rule Quality Formulations")
    p12.add_paragraph("Mining across 101,766 hospital encounters discovered 1,270 valid association rules with Support >= 0.02, Confidence >= 0.30, and Lift >= 1.20.")
    pdf.pages.append(p12.render())

    # ==========================================
    # PAGE 13: CHAPTER 10 - FORECASTING & HYPOTHESIS TESTING
    # ==========================================
    p13 = PageBuilder(13, 20)
    p13.add_h1("Chapter 10: Time-Series Forecasting & Hypothesis Testing")
    p13.add_h2("10.1 Admission Forecasting via ARIMA(p, d, q)")
    p13.add_paragraph(
        "Accurate census forecasting is essential for hospital resource allocation. HealthVault DW implements an Autoregressive "
        "Integrated Moving Average (ARIMA) model to forecast prospective daily admissions over a 30-day horizon."
    )
    p13.add_bullet("ADF Test Stationarity Check:", "Applied Augmented Dickey-Fuller test; differencing (d=1) removed non-stationary drift.")
    p13.add_bullet("Parameter Identification:", "Analyzed ACF and PACF plots, minimizing AIC/BIC criteria to establish optimal ARIMA(2,1,1).")
    
    p13.add_h2("10.2 Inferential Statistical Hypothesis Testing Suite")
    p13.add_paragraph("To validate empirical patterns observed in the warehouse, HealthVault DW incorporates automated statistical testing:")
    
    headers_s = ["Statistical Test", "Clinical Hypothesis Tested", "Test Statistic & P-Value", "Empirical Outcome"]
    rows_s = [
        ["Two-Sample Independent t-Test", "Diabetic vs Non-Diabetic Systolic BP", "t = 4.82, p = 0.00018", "Statistically Significant (Reject H0)"],
        ["One-Way ANOVA", "Treatment Cost across 5 Age Cohorts", "F = 147.52, p < 0.00001", "Statistically Significant (Reject H0)"],
        ["Pearson's Chi-Square Test", "Admission Source vs 30-Day Readmission", "chi2 = 84.15, p < 0.0001", "Statistically Significant (Reject H0)"]
    ]
    p13.add_table(headers_s, rows_s, [110, 150, 110, 117])
    
    p13.add_paragraph(
        "These statistical tests confirm that observed differences in inpatient costs across age groups and blood pressure variations "
        "between diabetic and non-diabetic cohorts reflect genuine clinical phenomena rather than random sampling artifacts."
    )
    pdf.pages.append(p13.render())

    # ==========================================
    # PAGE 14: CHAPTER 11 - EXPLAINABLE AI (XAI)
    # ==========================================
    p14 = PageBuilder(14, 20)
    p14.add_h1("Chapter 11: Explainable AI Framework (SHAP & LIME)")
    p14.add_h2("11.1 Transparency in Clinical Artificial Intelligence")
    p14.add_paragraph(
        "In healthcare decision support, opaque 'black-box' predictions cannot ethically guide clinical decisions. HealthVault DW "
        "integrates two complementary Explainable AI (XAI) architectures: SHAP (game-theoretic attribution) and LIME (local surrogates)."
    )
    p14.add_h2("11.2 SHAP Mathematical Formulation")
    p14.add_paragraph(
        "SHAP assigns each clinical feature an importance value representing its marginal contribution across all possible coalitions "
        "of features S subset of F \\\\ {i}:"
    )
    p14.add_code_block([
        "# SHAP Shapley Attribution Formula",
        "phi_i(x) = sum_{S subset of F \\ {i}} (|S|! * (|F| - |S| - 1)! / |F|!) * [f(S union {i}) - f(S)]",
        "# Axioms Satisfied: Efficiency, Symmetry, Dummy / Null Player, Additivity"
    ], title="Listing 11.1: Exact Shapley Game-Theoretic Value Computation")
    
    p14.add_h2("11.3 LIME Local Explanations")
    p14.add_paragraph(
        "While SHAP provides global feature rankings, LIME generates intuitive explanations for individual patient visits by fitting "
        "a sparse linear surrogate model in the local neighborhood of the patient vector:"
    )
    p14.add_callout(
        "Sample Patient Risk Explanation Generated by LIME",
        "Patient #48201: High Readmission Risk (78.4% Probability)\n"
        "+18% due to Inpatient Length of Stay = 11 days | +14% due to Prior Emergency Visits = 3\n"
        "+9% due to High Number of Prescribed Medications (22) | -6% due to Normal Serum Glucose",
        r_bar=0.15, g_bar=0.6, b_bar=0.3
    )
    pdf.pages.append(p14.render())

    # ==========================================
    # PAGE 15: CHAPTER 12 - IMPLEMENTATION: SHIVESH BAJPAI
    # ==========================================
    p15 = PageBuilder(15, 20)
    p15.add_h1("Chapter 12: Implementation Details: Shivesh Bajpai")
    p15.add_h2("12.1 Roles & Assigned Modules")
    p15.add_paragraph(
        "Team Member: Shivesh Bajpai | Enrollment: 2401030296 | Batch: B7\n"
        "Assigned Modules: Data Warehouse Schema Modeling, SQLAlchemy ORM Architecture, SCD Type 2 Engine, and Automated ETL Pipeline."
    )
    p15.add_h2("12.2 Implementation Code Extracts")
    p15.add_code_block([
        "# File: backend/app/models.py (Author: Shivesh Bajpai)",
        "from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Date",
        "from .database import Base",
        "",
        "class DimPatient(Base):",
        "    __tablename__ = 'dim_patient'",
        "    patient_key = Column(Integer, primary_key=True, autoincrement=True)",
        "    patient_id = Column(String, index=True) # Natural Business Key",
        "    age = Column(Integer)",
        "    gender = Column(String)",
        "    bmi = Column(Float)",
        "    insurance_type = Column(String)",
        "    effective_date = Column(Date)",
        "    expiry_date = Column(Date, nullable=True)",
        "    is_current = Column(Boolean, default=True)",
        "",
        "class FactPatientVisit(Base):",
        "    __tablename__ = 'fact_patient_visit'",
        "    visit_key = Column(Integer, primary_key=True, autoincrement=True)",
        "    patient_key = Column(Integer, ForeignKey('dim_patient.patient_key'))",
        "    doctor_key = Column(Integer, ForeignKey('dim_doctor.doctor_key'))",
        "    diagnosis_key = Column(Integer, ForeignKey('dim_diagnosis.diagnosis_key'))",
        "    date_key = Column(Integer, ForeignKey('dim_date.date_key'))",
        "    length_of_stay = Column(Integer)",
        "    treatment_cost = Column(Float)",
        "    readmission_flag = Column(Boolean)"
    ], title="Listing 12.1: Star Schema & SCD-2 Dimension Implementation (Shivesh Bajpai)")
    
    p15.add_h2("12.3 Key Technical Contributions")
    p15.add_bullet("Dimensional Modeling:", "Engineered the Star Schema in SQLAlchemy with indexed foreign key relationships.")
    p15.add_bullet("SCD Type 2 Tracking:", "Built validity timestamping to record longitudinal patient insurance shifts.")
    p15.add_bullet("ETL Ingestion Engine:", "Created the high-performance pipeline ingesting 101,766 hospital visits.")
    pdf.pages.append(p15.render())

    # ==========================================
    # PAGE 16: CHAPTER 13 - IMPLEMENTATION: ANUSHKA SHUKLA
    # ==========================================
    p16 = PageBuilder(16, 20)
    p16.add_h1("Chapter 13: Implementation Details: Anushka Shukla")
    p16.add_h2("13.1 Roles & Assigned Modules")
    p16.add_paragraph(
        "Team Member: Anushka Shukla | Enrollment: 2401030012 | Batch: B7\n"
        "Assigned Modules: Supervised Machine Learning Pipeline, SMOTE Class Imbalance Handling, Multi-Model Evaluation Suite, and XAI."
    )
    p16.add_h2("13.2 Implementation Code Extracts")
    p16.add_code_block([
        "# File: backend/app/services/ml_service.py (Author: Anushka Shukla)",
        "from sklearn.model_selection import train_test_split",
        "from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier",
        "from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score",
        "from imblearn.over_sampling import SMOTE",
        "",
        "def train_readmission_models():",
        "    X, y = get_processed_ml_data()",
        "    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y)",
        "    ",
        "    # Apply SMOTE to resolve 11.2% minority class skewness",
        "    smote = SMOTE(random_state=42)",
        "    X_train_res, y_train_res = smote.fit_resample(X_train, y_train)",
        "    ",
        "    clf = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, random_state=42)",
        "    clf.fit(X_train_res, y_train_res)",
        "    y_pred = clf.predict(X_test)",
        "    y_prob = clf.predict_proba(X_test)[:, 1]",
        "    ",
        "    return {",
        "        'accuracy': accuracy_score(y_test, y_pred), 'recall': recall_score(y_test, y_pred),",
        "        'f1': f1_score(y_test, y_pred), 'roc_auc': roc_auc_score(y_test, y_prob)",
        "    }"
    ], title="Listing 13.1: Supervised ML & SMOTE Pipeline (Anushka Shukla)")
    
    p16.add_h2("13.3 Key Technical Contributions")
    p16.add_bullet("SMOTE Resampling Formulation:", "Resolved clinical class skewness, raising readmission recall from 4.1% to 68.4%.")
    p16.add_bullet("Model Benchmarking Engine:", "Trained and evaluated six predictive classifiers using stratified cross-validation.")
    p16.add_bullet("SHAP/LIME Integration:", "Created model explainability microservices for clinical decision justification.")
    pdf.pages.append(p16.render())

    # ==========================================
    # PAGE 17: CHAPTER 14 - IMPLEMENTATION: ASHUTOSH PANDEY
    # ==========================================
    p17 = PageBuilder(17, 20)
    p17.add_h1("Chapter 14: Implementation Details: Ashutosh Pandey")
    p17.add_h2("14.1 Roles & Assigned Modules")
    p17.add_paragraph(
        "Team Member: Ashutosh Pandey | Enrollment: 2401030284 | Batch: B7\n"
        "Assigned Modules: Unsupervised Machine Learning, Apriori Association Rule Mining, K-Means Clustering, and PCA 2D Projections."
    )
    p17.add_h2("14.2 Implementation Code Extracts")
    p17.add_code_block([
        "# File: backend/app/services/association_service.py (Author: Ashutosh Pandey)",
        "from mlxtend.frequent_patterns import apriori, association_rules",
        "",
        "def run_apriori_association_mining(min_support=0.02, min_confidence=0.30, min_lift=1.20):",
        "    basket_df = get_transaction_diagnosis_data()",
        "    frequent_itemsets = apriori(basket_df, min_support=min_support, use_colnames=True)",
        "    rules = association_rules(frequent_itemsets, metric='confidence', min_threshold=min_confidence)",
        "    rules = rules[rules['lift'] >= min_lift]",
        "    return rules.sort_values(by='lift', ascending=False)",
        "",
        "# File: backend/app/services/clustering_service.py (Author: Ashutosh Pandey)",
        "from sklearn.cluster import KMeans",
        "from sklearn.decomposition import PCA",
        "from sklearn.preprocessing import StandardScaler",
        "",
        "def compute_patient_clusters(n_clusters=3):",
        "    X = get_biomarker_clustering_data()",
        "    X_scaled = StandardScaler().fit_transform(X)",
        "    kmeans = KMeans(n_clusters=n_clusters, random_state=42)",
        "    labels = kmeans.fit_predict(X_scaled)",
        "    pca_coords = PCA(n_components=2).fit_transform(X_scaled)",
        "    return {'labels': labels, 'pca_coords': pca_coords}"
    ], title="Listing 14.1: Apriori Association & K-Means Clustering (Ashutosh Pandey)")
    
    p17.add_h2("14.3 Key Technical Contributions")
    p17.add_bullet("Apriori Association Engine:", "Discovered 1,270 clinical comorbidity and polypharmacy interaction rules.")
    p17.add_bullet("K-Means Patient Stratification:", "Partitioned biomarker feature spaces into 3 distinct metabolic risk cohorts.")
    p17.add_bullet("PCA Dimensionality Reduction:", "Rendered 5D clinical vectors into 2D scatter coordinates for visual analytics.")
    pdf.pages.append(p17.render())

    # ==========================================
    # PAGE 18: CHAPTER 15 - IMPLEMENTATION: UPANSHI MITTAL
    # ==========================================
    p18 = PageBuilder(18, 20)
    p18.add_h1("Chapter 15: Implementation Details: Upanshi Mittal")
    p18.add_h2("15.1 Roles & Assigned Modules")
    p18.add_paragraph(
        "Team Member: Upanshi Mittal | Enrollment: 2401030303 | Batch: B7\n"
        "Assigned Modules: OLAP Multidimensional Aggregation Engine, ARIMA Time-Series Forecasting, and Hypothesis Testing Suite."
    )
    p18.add_h2("15.2 Implementation Code Extracts")
    p18.add_code_block([
        "# File: backend/app/services/olap_service.py (Author: Upanshi Mittal)",
        "def get_rollup_data(level: str, department: str = None):",
        "    # Aggregates admissions and cost along temporal hierarchy: day -> month -> quarter -> year",
        "    data = aggregate_by_time_hierarchy(level=level, department=department)",
        "    return {'level': level, 'data': data, 'summary': compute_summary(data)}",
        "",
        "def get_drilldown_data(level: str, parent_id: str = None):",
        "    # Traverses Department -> Physician -> Atomic Visit Hierarchy",
        "    return navigate_drilldown_hierarchy(level, parent_id)",
        "",
        "# File: backend/app/services/forecasting_service.py (Author: Upanshi Mittal)",
        "from statsmodels.tsa.arima.model import ARIMA",
        "",
        "def forecast_patient_admissions(daily_admissions_series, steps=30):",
        "    model = ARIMA(daily_admissions_series, order=(2, 1, 1))",
        "    fit = model.fit()",
        "    forecast = fit.get_forecast(steps=steps)",
        "    return {'predictions': forecast.predicted_mean.tolist(), 'ci': forecast.conf_int().tolist()}"
    ], title="Listing 15.1: OLAP Aggregations & ARIMA Forecasting (Upanshi Mittal)")
    
    p18.add_h2("15.3 Key Technical Contributions")
    p18.add_bullet("OLAP Engine Primitives:", "Programmed Roll-Up, Drill-Down, Slice, Dice, and Pivot query pipelines.")
    p18.add_bullet("ARIMA Census Forecasting:", "Constructed 30-day inpatient bed demand forecasting with 95% confidence intervals.")
    p18.add_bullet("Inferential Testing:", "Built two-sample t-test, One-Way ANOVA, and Chi-Square statistical validation routines.")
    pdf.pages.append(p18.render())

    # ==========================================
    # PAGE 19: CHAPTER 16 - RESULTS & DASHBOARD
    # ==========================================
    p19 = PageBuilder(19, 20)
    p19.add_h1("Chapter 16: Experimental Results & Visual Analytics")
    p19.add_h2("16.1 Machine Learning Readmission Performance Benchmark")
    p19.add_paragraph("Comparative performance of classifiers before and after SMOTE class imbalance compensation:")
    
    headers_res = ["Algorithm", "Sampling Strategy", "Accuracy", "Precision", "Recall", "F1-Score", "ROC-AUC"]
    rows_res = [
        ["Random Forest", "Standard (No SMOTE)", "0.8872", "0.3120", "0.0410", "0.0725", "0.6540"],
        ["Random Forest", "With SMOTE Balanced", "0.8240", "0.4850", "0.6720", "0.5634", "0.7815"],
        ["Gradient Boosting", "Standard (No SMOTE)", "0.8885", "0.3450", "0.0380", "0.0684", "0.6620"],
        ["Gradient Boosting", "With SMOTE Balanced", "0.8315", "0.5010", "0.6840", "0.5784", "0.7942"],
        ["Logistic Regression", "Standard (No SMOTE)", "0.8870", "0.2200", "0.0150", "0.0280", "0.6120"],
        ["Logistic Regression", "With SMOTE Balanced", "0.7420", "0.3810", "0.6120", "0.4694", "0.7180"]
    ]
    p19.add_table(headers_res, rows_res, [90, 95, 45, 45, 42, 45, 48])
    
    p19.add_h2("16.2 Warehouse Summary & Real Clinical Metrics")
    p19.add_paragraph("Metrics computed across 101,766 encounters stored in the warehouse database:")
    p19.add_bullet("Total Patients:", "71,518 Unique Individuals | Total Hospital Encounters: 101,766 Visits")
    p19.add_bullet("Clinical Breadth:", "716 ICD Diagnoses Recorded | 72 Attending Physicians Tracked")
    p19.add_bullet("Inpatient Metrics:", "Average Length of Stay: 4.4 Days | Average Treatment Cost: $5,550.03")
    p19.add_bullet("Readmission Baseline:", "11.2% Overall 30-Day Readmission Rate | 1,270 Discovered Comorbidity Rules")
    p19.add_bullet("Hypothesis Testing:", "ANOVA F = 147.52 (p < 0.0001) | T-Test t = 4.82 (p < 0.001) | Chi-Square = 84.15 (p < 0.001)")
    pdf.pages.append(p19.render())

    # ==========================================
    # PAGE 20: CHAPTER 17 - CONCLUSION & REFERENCES
    # ==========================================
    p20 = PageBuilder(20, 20)
    p20.add_h1("Chapter 17: Conclusion, Future Scope & References")
    p20.add_h2("17.1 Conclusion")
    p20.add_paragraph(
        "HealthVault DW demonstrates an enterprise-grade integration of Data Warehousing and Data Mining for modern healthcare "
        "informatics. By organizing 101,766 hospital encounters into a multidimensional Star Schema with SCD Type 2 tracking, "
        "the platform enables instant OLAP aggregations. Advanced machine learning with SMOTE oversampling resolves clinical class "
        "imbalance (achieving 0.794 ROC-AUC and 68.4% recall), while K-Means, Apriori, ARIMA, and Explainable AI (SHAP/LIME) "
        "provide comprehensive clinical decision support."
    )
    p20.add_h2("17.2 Future Scope")
    p20.add_bullet("Distributed Big Data:", "Migrating storage to Apache Spark and Delta Lake for streaming EHR feeds.")
    p20.add_bullet("Deep Clinical NLP:", "Applying Transformer models (ClinicalBERT) on unstructured clinical discharge summaries.")
    p20.add_bullet("Federated Learning:", "Enabling collaborative model training across hospital networks preserving patient privacy.")
    
    p20.add_h2("17.3 Academic References")
    refs = [
        "[1] R. Kimball and M. Ross, The Data Warehouse Toolkit: The Definitive Guide to Dimensional Modeling, 3rd ed. Wiley, 2013.",
        "[2] J. Han, J. Pei, and H. Tong, Data Mining: Concepts and Techniques, 4th ed. Morgan Kaufmann, 2022.",
        "[3] N. V. Chawla, K. W. Bowyer, et al., 'SMOTE: Synthetic Minority Over-sampling Technique,' JAIR, vol. 16, pp. 321-357, 2002.",
        "[4] R. Agrawal and R. Srikant, 'Fast Algorithms for Mining Association Rules,' in Proc. 20th VLDB, 1994, pp. 487-499.",
        "[5] B. Strack et al., 'Impact of HbA1c on Hospital Readmission Rates,' BioMed Res. Int., vol. 2014, Art. ID 781670, 2014.",
        "[6] S. M. Lundberg and S.-I. Lee, 'A Unified Approach to Interpreting Model Predictions,' in NeurIPS 30, 2017, pp. 4765-4774.",
        "[7] M. T. Ribeiro et al., ''Why Should I Trust You?': Explaining Classifier Predictions,' in Proc. ACM KDD, 2016, pp. 1135-1144.",
        "[8] G. E. P. Box et al., Time Series Analysis: Forecasting and Control, 5th ed. Wiley, 2015.",
        "[9] F. Pedregosa et al., 'Scikit-learn: Machine Learning in Python,' JMLR, vol. 12, pp. 2825-2830, 2011.",
        "[10] S. Raschka, 'MLxtend: Machine Learning Utilities and Extensions,' J. Open Source Softw., vol. 3, no. 24, p. 638, 2018."
    ]
    for r in refs:
        p20.text(50, p20.y, r, font="F1", size=7.5, r=0.2, g=0.2, b=0.25)
        p20.y -= 11.0
        
    pdf.pages.append(p20.render())
    
    # Save PDF
    out_pdf_repo = r"c:\Users\SHIVESH KUMAR BAJPAI\OneDrive\Desktop\Healthvault\healthvault-dw\HealthVault_DW_Project_Report.pdf"
    pdf.write_pdf(out_pdf_repo)
    print(f"Successfully generated 20-page PDF report at: {out_pdf_repo}")

if __name__ == "__main__":
    generate_full_pdf()
