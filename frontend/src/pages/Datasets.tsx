import React, { useState, useMemo } from 'react';
import { 
  Database, Search, Filter, Download, ChevronLeft, ChevronRight, 
  Info, Table as TableIcon, FileText, AlertTriangle, BarChart2, 
  CheckCircle2, AlertCircle, LayoutGrid
} from 'lucide-react';

// --- MOCK DATA FOR DATASETS ---

const DATASETS = [
  {
    id: 'uci-heart',
    name: 'UCI Heart Disease',
    source: 'UCI Machine Learning Repository',
    records: 303,
    attributes: 14,
    target: 'num (angiographic disease status)',
    intendedUse: 'Classification of heart disease presence. Used for basic classification model baseline.',
    missingValues: '0.1% (in ca, thal)',
    numColumns: 5,
    catColumns: 9,
    isSynthetic: false,
    disclaimer: 'This dataset is for educational purposes and should not be used for actual clinical diagnostics.',
    schema: [
      { col: 'age', type: 'Numeric', desc: 'Age in years' },
      { col: 'sex', type: 'Categorical', desc: '1 = male; 0 = female' },
      { col: 'cp', type: 'Categorical', desc: 'Chest pain type (4 values)' },
      { col: 'trestbps', type: 'Numeric', desc: 'Resting blood pressure' },
      { col: 'chol', type: 'Numeric', desc: 'Serum cholestoral in mg/dl' },
      { col: 'fbs', type: 'Categorical', desc: 'Fasting blood sugar > 120 mg/dl' },
      { col: 'restecg', type: 'Categorical', desc: 'Resting electrocardiographic results' },
      { col: 'thalach', type: 'Numeric', desc: 'Maximum heart rate achieved' },
      { col: 'exang', type: 'Categorical', desc: 'Exercise induced angina' },
      { col: 'oldpeak', type: 'Numeric', desc: 'ST depression induced by exercise' },
      { col: 'target', type: 'Categorical', desc: '0 = no disease, 1 = disease' },
    ],
    preview: Array.from({ length: 25 }, (_, i) => ({
      age: Math.floor(Math.random() * 40 + 30),
      sex: Math.random() > 0.5 ? 1 : 0,
      cp: Math.floor(Math.random() * 4),
      trestbps: Math.floor(Math.random() * 60 + 100),
      chol: Math.floor(Math.random() * 100 + 150),
      fbs: Math.random() > 0.8 ? 1 : 0,
      restecg: Math.floor(Math.random() * 3),
      thalach: Math.floor(Math.random() * 60 + 100),
      exang: Math.random() > 0.6 ? 1 : 0,
      oldpeak: (Math.random() * 4).toFixed(1),
      target: Math.random() > 0.5 ? 1 : 0,
    }))
  },
  {
    id: 'pima-diabetes',
    name: 'Pima Indians Diabetes',
    source: 'National Institute of Diabetes and Digestive and Kidney Diseases',
    records: 768,
    attributes: 9,
    target: 'Outcome (0 or 1)',
    intendedUse: 'Predicting the onset of diabetes based on diagnostic measures.',
    missingValues: '0% (but 0 values encode missing data)',
    numColumns: 8,
    catColumns: 1,
    isSynthetic: false,
    disclaimer: 'Historical dataset. Not indicative of modern clinical profiles.',
    schema: [
      { col: 'Pregnancies', type: 'Numeric', desc: 'Number of times pregnant' },
      { col: 'Glucose', type: 'Numeric', desc: 'Plasma glucose concentration' },
      { col: 'BloodPressure', type: 'Numeric', desc: 'Diastolic blood pressure' },
      { col: 'SkinThickness', type: 'Numeric', desc: 'Triceps skin fold thickness' },
      { col: 'Insulin', type: 'Numeric', desc: '2-Hour serum insulin' },
      { col: 'BMI', type: 'Numeric', desc: 'Body mass index' },
      { col: 'DiabetesPedigree', type: 'Numeric', desc: 'Diabetes pedigree function' },
      { col: 'Age', type: 'Numeric', desc: 'Age (years)' },
      { col: 'Outcome', type: 'Categorical', desc: 'Class variable (0 or 1)' },
    ],
    preview: Array.from({ length: 25 }, (_, i) => ({
      Pregnancies: Math.floor(Math.random() * 10),
      Glucose: Math.floor(Math.random() * 100 + 80),
      BloodPressure: Math.floor(Math.random() * 40 + 60),
      SkinThickness: Math.floor(Math.random() * 40),
      Insulin: Math.floor(Math.random() * 200),
      BMI: (Math.random() * 20 + 20).toFixed(1),
      DiabetesPedigree: (Math.random() * 1.5).toFixed(3),
      Age: Math.floor(Math.random() * 50 + 21),
      Outcome: Math.random() > 0.65 ? 1 : 0,
    }))
  },
  {
    id: 'diabetes-130',
    name: 'Diabetes 130-US Hospitals',
    source: 'Health Facts database (Cerner Corporation)',
    records: 101766,
    attributes: 50,
    target: 'readmitted (<30, >30, NO)',
    intendedUse: 'Predicting hospital readmission for patients with diabetes.',
    missingValues: 'Significant (weight, payer_code, medical_specialty)',
    numColumns: 13,
    catColumns: 37,
    isSynthetic: false,
    disclaimer: 'Complex real-world dataset. Clinical generalizations should not be made from models trained solely on this data.',
    schema: [
      { col: 'encounter_id', type: 'Numeric', desc: 'Unique identifier of an encounter' },
      { col: 'patient_nbr', type: 'Numeric', desc: 'Unique identifier of a patient' },
      { col: 'race', type: 'Categorical', desc: 'Values: Caucasian, Asian, African American, etc.' },
      { col: 'gender', type: 'Categorical', desc: 'Values: male, female, unknown/invalid' },
      { col: 'age', type: 'Categorical', desc: 'Grouped in 10-year intervals' },
      { col: 'time_in_hospital', type: 'Numeric', desc: 'Integer number of days' },
      { col: 'num_lab_procedures', type: 'Numeric', desc: 'Number of lab tests performed' },
      { col: 'num_medications', type: 'Numeric', desc: 'Number of distinct generic names' },
      { col: 'readmitted', type: 'Categorical', desc: 'Days to inpatient readmission' },
    ],
    preview: Array.from({ length: 25 }, (_, i) => ({
      encounter_id: Math.floor(Math.random() * 1000000 + 100000),
      patient_nbr: Math.floor(Math.random() * 100000 + 10000),
      race: ['Caucasian', 'AfricanAmerican', 'Hispanic', 'Other'][Math.floor(Math.random() * 4)],
      gender: ['Male', 'Female'][Math.floor(Math.random() * 2)],
      age: ['[50-60)', '[60-70)', '[70-80)', '[80-90)'][Math.floor(Math.random() * 4)],
      time_in_hospital: Math.floor(Math.random() * 10 + 1),
      num_lab_procedures: Math.floor(Math.random() * 50 + 10),
      num_medications: Math.floor(Math.random() * 20 + 5),
      readmitted: ['NO', '<30', '>30'][Math.floor(Math.random() * 3)],
    }))
  },
  {
    id: 'synthetic-patient',
    name: 'Synthetic Patient Dataset',
    source: 'Faker & Scipy (Generated)',
    records: 50000,
    attributes: 25,
    target: 'Multiple (Readmission, Risk Score)',
    intendedUse: 'System load testing, UI demonstrations, and algorithm baseline benchmarking without privacy constraints.',
    missingValues: 'Controlled (5% across specific columns)',
    numColumns: 12,
    catColumns: 13,
    isSynthetic: true,
    disclaimer: 'This dataset is 100% synthetically generated. It contains no real patient information and cannot be used for clinical insights.',
    schema: [
      { col: 'patient_id', type: 'Categorical', desc: 'UUID' },
      { col: 'age', type: 'Numeric', desc: '18-95 years' },
      { col: 'gender', type: 'Categorical', desc: 'M, F, Other' },
      { col: 'bmi', type: 'Numeric', desc: 'Generated with normal distribution' },
      { col: 'blood_pressure', type: 'Numeric', desc: 'Systolic/Diastolic numeric representation' },
      { col: 'insurance_type', type: 'Categorical', desc: 'Medicare, Medicaid, Private, None' },
      { col: 'treatment_cost', type: 'Numeric', desc: 'Cost in USD' },
      { col: 'readmission_risk', type: 'Numeric', desc: 'Calculated 0.0 - 1.0' },
      { col: 'is_readmitted', type: 'Categorical', desc: 'Boolean target' },
    ],
    preview: Array.from({ length: 25 }, (_, i) => ({
      patient_id: `PT-${Math.floor(Math.random() * 10000)}`,
      age: Math.floor(Math.random() * 70 + 18),
      gender: ['Male', 'Female'][Math.floor(Math.random() * 2)],
      bmi: (Math.random() * 15 + 18).toFixed(1),
      blood_pressure: Math.floor(Math.random() * 40 + 100),
      insurance_type: ['Medicare', 'Private', 'Medicaid'][Math.floor(Math.random() * 3)],
      treatment_cost: (Math.random() * 10000 + 500).toFixed(2),
      readmission_risk: Math.random().toFixed(2),
      is_readmitted: Math.random() > 0.8 ? 'True' : 'False',
    }))
  },
];

const TABS = ['Overview', 'Schema', 'Preview', 'Missing Values', 'Statistics', 'Distributions', 'Data Quality'];

export default function Datasets() {
  const [activeDatasetId, setActiveDatasetId] = useState(DATASETS[0].id);
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Data Table State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc'|'desc'} | null>(null);
  
  const dataset = DATASETS.find(d => d.id === activeDatasetId)!;
  const ITEMS_PER_PAGE = 10;

  // Process data for preview table
  const processedData = useMemo(() => {
    let data = [...dataset.preview];
    
    if (searchTerm) {
      data = data.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    if (sortConfig) {
      data.sort((a, b) => {
        const valA = (a as Record<string, any>)[sortConfig.key];
        const valB = (b as Record<string, any>)[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return data;
  }, [dataset, searchTerm, sortConfig]);

  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const currentData = processedData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExportCSV = () => {
    if (dataset.preview.length === 0) return;
    const headers = Object.keys(dataset.preview[0]).join(',');
    const csvContent = dataset.preview.map(row => Object.values(row).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${dataset.id}_sample.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Database className="h-8 w-8 text-indigo-600" />
            Dataset Explorer
          </h1>
          <p className="mt-2 text-gray-500">
            Browse, preview, and inspect the datasets used in this data warehouse.
          </p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {DATASETS.map(d => (
            <button
              key={d.id}
              onClick={() => { setActiveDatasetId(d.id); setActiveTab('Overview'); setCurrentPage(1); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeDatasetId === d.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Dataset Header Card */}
        <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100">
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{dataset.name}</h2>
            {dataset.isSynthetic && (
              <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <LayoutGrid className="w-3 h-3" /> Synthetic / Demo
              </span>
            )}
          </div>
          
          <p className="text-gray-600 mb-6 flex items-center gap-2">
            <Info className="h-4 w-4" /> Source: {dataset.source}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 font-semibold uppercase">Records</p>
              <p className="text-xl font-bold text-gray-900">{dataset.records.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 font-semibold uppercase">Attributes</p>
              <p className="text-xl font-bold text-gray-900">{dataset.attributes}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 font-semibold uppercase">Num / Cat Columns</p>
              <p className="text-xl font-bold text-gray-900">{dataset.numColumns} / {dataset.catColumns}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 font-semibold uppercase">Target Variable</p>
              <p className="text-lg font-bold text-indigo-600 truncate" title={dataset.target}>{dataset.target}</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border-y border-amber-200 px-6 py-3 flex gap-3 text-amber-900 items-start">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            <span className="font-semibold block mb-0.5">Clinical Suitability Disclaimer</span>
            {dataset.disclaimer}
          </p>
        </div>

        {/* Tabs navigation */}
        <div className="border-b border-gray-200 px-6 flex overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 min-h-[400px]">
          
          {activeTab === 'Overview' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-gray-400" /> Intended Project Use
                </h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {dataset.intendedUse}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Missing Values Status</h3>
                  <p className="text-gray-900 font-medium">{dataset.missingValues}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Data Type</h3>
                  <p className="text-gray-900 font-medium flex items-center gap-2">
                    {dataset.isSynthetic ? 'Synthetically Generated' : 'Real-World Collected'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Schema' && (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dataset.schema.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.col}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          row.type === 'Numeric' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Preview' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search data..."
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="pl-10 block w-full sm:w-64 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                  />
                </div>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" /> Export CSV (Sample)
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(dataset.preview[0] || {}).map(key => (
                        <th 
                          key={key} 
                          onClick={() => handleSort(key)}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-1">
                            {key}
                            {sortConfig?.key === key && (
                              <span className="text-gray-400">
                                {sortConfig.direction === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentData.length > 0 ? currentData.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {Object.values(row).map((val: any, j) => (
                          <td key={j} className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {val}
                          </td>
                        ))}
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={Object.keys(dataset.preview[0] || {}).length} className="px-4 py-8 text-center text-sm text-gray-500">
                          No matching records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-xl">
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, processedData.length)}</span> of <span className="font-medium">{processedData.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Placeholders for advanced tabs (Statistics, Distributions, Data Quality, Missing Values) */}
          {['Missing Values', 'Statistics', 'Distributions', 'Data Quality'].includes(activeTab) && (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <BarChart2 className="h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">{activeTab} Visualization</h3>
              <p className="text-sm mt-1 max-w-md text-center">
                This academic module focuses on the schema and preview. Full exploratory data analysis charts for {activeTab.toLowerCase()} would be rendered here in a full BI tool.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
