import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Info, Activity, BrainCircuit, UserCheck, AlertTriangle, Lightbulb,
  RefreshCw, FileText, ChevronDown, Cpu
} from 'lucide-react';

const API = 'http://localhost:8000';

const fetchModels = async () => {
  const { data } = await axios.get(`${API}/api/ml/models`);
  return data;
};

const fetchGlobalExplanation = async (modelName: string) => {
  const { data } = await axios.get(`${API}/api/ml/xai/global`, {
    params: { model_name: modelName },
  });
  return data;
};

const generateLocalExplanation = async ({ patientData, modelName }: { patientData: any; modelName: string }) => {
  const { data } = await axios.post(`${API}/api/ml/xai/local`, {
    ...patientData,
    model_name: modelName,
  });
  return data;
};

const defaultPatient = {
  age: 65,
  gender: 'Male',
  bmi: 28.5,
  glucose: 140,
  bp_sys: 135,
  heart_rate: 78,
  los: 5,
  chronic_conditions: 2,
  prev_admissions: 1,
  insurance: 'Medicare',
  diagnosis: 'Circulatory',
  department: 'Cardiology',
};

const MODEL_COLORS: Record<string, string> = {
  'Random Forest':       'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Logistic Regression': 'bg-blue-100 text-blue-800 border-blue-300',
  'KNN':                 'bg-purple-100 text-purple-800 border-purple-300',
  'Naive Bayes':         'bg-amber-100 text-amber-800 border-amber-300',
  'Decision Tree':       'bg-rose-100 text-rose-800 border-rose-300',
  'SVM':                 'bg-cyan-100 text-cyan-800 border-cyan-300',
};

const Explainability = () => {
  const [activeTab, setActiveTab] = useState<'global' | 'local'>('global');
  const [patientData, setPatientData] = useState(defaultPatient);
  const [selectedModel, setSelectedModel] = useState<string>('');

  const { data: models = [], isLoading: isLoadingModels } = useQuery<any[]>({
    queryKey: ['mlModels'],
    queryFn: fetchModels,
  });

  useEffect(() => {
    if (!selectedModel && models && models.length > 0) {
      const active = models.find((m: any) => m.is_active) || models[0];
      setSelectedModel(active.model_name);
    }
  }, [models, selectedModel]);

  const {
    data: globalData,
    isLoading: isLoadingGlobal,
    error: globalError,
    refetch: refetchGlobal,
  } = useQuery<any>({
    queryKey: ['xaiGlobal', selectedModel],
    queryFn: () => fetchGlobalExplanation(selectedModel),
    enabled: !!selectedModel,
  });

  const localMutation = useMutation({
    mutationFn: generateLocalExplanation,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPatientData(prev => ({
      ...prev,
      [name]: isNaN(Number(value)) || value === '' ? value : Number(value),
    }));
  };

  const handleRunLocal = (e: React.FormEvent) => {
    e.preventDefault();
    localMutation.mutate({ patientData, modelName: selectedModel });
  };

  const handleModelChange = (modelName: string) => {
    setSelectedModel(modelName);
    localMutation.reset(); 
  };

  const fillRandomPatient = () => {
    setPatientData({
      age: Math.floor(Math.random() * (90 - 18) + 18),
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      bmi: Number((Math.random() * (40 - 18.5) + 18.5).toFixed(1)),
      glucose: Math.floor(Math.random() * (200 - 80) + 80),
      bp_sys: Math.floor(Math.random() * (180 - 100) + 100),
      heart_rate: Math.floor(Math.random() * (120 - 60) + 60),
      los: Math.floor(Math.random() * 14 + 1),
      chronic_conditions: Math.floor(Math.random() * 5),
      prev_admissions: Math.floor(Math.random() * 4),
      insurance: ['Medicare', 'Medicaid', 'Private', 'Uninsured'][Math.floor(Math.random() * 4)],
      diagnosis: ['Circulatory', 'Endocrine', 'Respiratory', 'Digestive', 'Other'][Math.floor(Math.random() * 5)],
      department: ['Cardiology', 'Internal Medicine', 'Neurology', 'Orthopedics'][Math.floor(Math.random() * 4)],
    });
  };

  const selectedModelColor = MODEL_COLORS[selectedModel] || 'bg-indigo-100 text-indigo-800 border-indigo-300';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-indigo-600" />
            Explainable AI (XAI)
          </h1>
          <p className="mt-2 text-gray-500">
            Understand how each machine learning model makes its predictions.
          </p>
        </div>

        <div className="flex flex-col gap-1 min-w-[220px]">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Cpu className="h-3.5 w-3.5" /> Explain Model
          </label>
          {isLoadingModels ? (
            <div className="h-10 bg-gray-100 animate-pulse rounded-lg" />
          ) : (
            <div className="relative">
              <select
                value={selectedModel}
                onChange={e => handleModelChange(e.target.value)}
                className="w-full appearance-none rounded-xl border-2 border-indigo-200 bg-white px-4 py-2.5 pr-10 text-sm font-semibold text-indigo-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all cursor-pointer"
              >
                {(models || []).map((m: any) => (
                  <option key={m.model_name} value={m.model_name}>
                    {m.model_name}{m.is_active ? ' ★' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
            </div>
          )}
          {selectedModel && (
            <span className={`self-start text-xs px-2.5 py-0.5 rounded-full border font-medium mt-0.5 ${selectedModelColor}`}>
              {selectedModel}
            </span>
          )}
        </div>
      </div>

      {models && models.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {models.map((m: any) => (
            <button
              key={m.model_name}
              onClick={() => handleModelChange(m.model_name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                selectedModel === m.model_name
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              {m.model_name}
              {m.is_active && (
                <span className="ml-1.5 text-[10px] opacity-80">Active</span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex space-x-1 rounded-xl bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab('global')}
          className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${
            activeTab === 'global'
              ? 'bg-white text-indigo-700 shadow ring-1 ring-black/5'
              : 'text-gray-700 hover:bg-white/[0.12] hover:text-indigo-600'
          }`}
        >
          Global Explanation
        </button>
        <button
          onClick={() => setActiveTab('local')}
          className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${
            activeTab === 'local'
              ? 'bg-white text-indigo-700 shadow ring-1 ring-black/5'
              : 'text-gray-700 hover:bg-white/[0.12] hover:text-indigo-600'
          }`}
        >
          Local Explanation
        </button>
      </div>

      {activeTab === 'global' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-blue-800">
            <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold">Global Feature Importance — {selectedModel}</h4>
              <p className="text-sm mt-1">
                This visualization explains which input features influence{' '}
                <span className="font-semibold">{selectedModel}</span>'s output across the entire dataset.
                <span className="font-semibold"> It does not explain medical causation.</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">SHAP Feature Importance</h3>
              <button
                onClick={() => refetchGlobal()}
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>

            {isLoadingGlobal ? (
              <div className="h-96 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="text-sm text-gray-500 animate-pulse">Computing SHAP values for {selectedModel}…</p>
              </div>
            ) : globalError || globalData?.error ? (
              <div className="h-96 flex items-center justify-center text-red-500 gap-2">
                <AlertTriangle className="h-6 w-6" />
                <span>{(globalData as any)?.error || 'Failed to load global explanation.'}</span>
              </div>
            ) : (
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={globalData?.feature_importance}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis type="number" tick={{ fill: '#6B7280' }} />
                    <YAxis dataKey="feature" type="category" tick={{ fill: '#374151', fontSize: 12 }} width={120} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => value.toFixed(4)}
                    />
                    <Bar dataKey="importance" fill="#4F46E5" radius={[0, 4, 4, 0]}>
                      {globalData?.feature_importance.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4F46E5' : '#6366F1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {globalData?.model_used && (
              <p className="text-sm text-gray-500 mt-4 text-center">Model: {globalData.model_used}</p>
            )}
          </div>
        </div>
      )}

      {/* ── LOCAL TAB ────────────────────────────────────────────────────────── */}
      {activeTab === 'local' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">

          {/* Left: Patient Form */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-indigo-500" />
                  Patient Profile
                </h3>
                <button
                  onClick={fillRandomPatient}
                  className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" /> Randomize
                </button>
              </div>

              {/* Selected model badge inside form */}
              {selectedModel && (
                <div className={`mb-4 flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border ${selectedModelColor}`}>
                  <Cpu className="h-3.5 w-3.5" />
                  Explaining: {selectedModel}
                </div>
              )}

              <form onSubmit={handleRunLocal} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
                    <input type="number" name="age" value={patientData.age} onChange={handleInputChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                    <select name="gender" value={patientData.gender} onChange={handleInputChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">BMI</label>
                    <input type="number" step="0.1" name="bmi" value={patientData.bmi} onChange={handleInputChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Glucose</label>
                    <input type="number" name="glucose" value={patientData.glucose} onChange={handleInputChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Sys BP</label>
                    <input type="number" name="bp_sys" value={patientData.bp_sys} onChange={handleInputChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Heart Rate</label>
                    <input type="number" name="heart_rate" value={patientData.heart_rate} onChange={handleInputChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Length of Stay</label>
                    <input type="number" name="los" value={patientData.los} onChange={handleInputChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Chronic Cond.</label>
                    <input type="number" name="chronic_conditions" value={patientData.chronic_conditions} onChange={handleInputChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Prev. Admissions</label>
                    <input type="number" name="prev_admissions" value={patientData.prev_admissions} onChange={handleInputChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Insurance</label>
                    <select name="insurance" value={patientData.insurance} onChange={handleInputChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                      <option>Medicare</option>
                      <option>Medicaid</option>
                      <option>Private</option>
                      <option>Uninsured</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Diagnosis</label>
                  <select name="diagnosis" value={patientData.diagnosis} onChange={handleInputChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                    <option>Circulatory</option>
                    <option>Endocrine</option>
                    <option>Respiratory</option>
                    <option>Digestive</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                  <select name="department" value={patientData.department} onChange={handleInputChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border">
                    <option>Cardiology</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                    <option>Neurology</option>
                    <option>Orthopedics</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={localMutation.isPending || !selectedModel}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {localMutation.isPending ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" /> Generating…</>
                  ) : (
                    `Generate Explanation (${selectedModel})`
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-8 space-y-6">
            {!localMutation.data && !localMutation.isPending && (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center text-gray-500 h-full">
                <FileText className="h-16 w-16 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900">No Prediction Selected</h3>
                <p className="mt-1">Fill out the patient profile and click generate to view the local explanation.</p>
                {selectedModel && (
                  <span className={`mt-3 text-xs px-3 py-1 rounded-full border font-medium ${selectedModelColor}`}>
                    Will use: {selectedModel}
                  </span>
                )}
              </div>
            )}

            {localMutation.isPending && (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-full">
                <RefreshCw className="h-12 w-12 mb-4 text-indigo-600 animate-spin" />
                <p className="text-indigo-600 font-medium animate-pulse">Calculating SHAP and LIME values…</p>
                <p className="text-sm text-gray-500 mt-1">Running on <span className="font-semibold">{selectedModel}</span></p>
                <p className="text-sm text-gray-500">This may take a few moments</p>
              </div>
            )}

            {localMutation.error && (
              <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 flex items-center gap-4">
                <AlertTriangle className="h-8 w-8" />
                <div>
                  <h4 className="font-semibold text-lg">Error Generating Explanation</h4>
                  <p>There was a problem communicating with the explanation service.</p>
                </div>
              </div>
            )}

            {localMutation.data && !localMutation.data.error && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Prediction Summary */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">Prediction Outcome</div>
                    <div className={`text-4xl font-bold ${localMutation.data.predicted_class === 1 ? 'text-red-600' : 'text-green-600'}`}>
                      {localMutation.data.predicted_class === 1 ? 'Readmitted' : 'Not Readmitted'}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-md text-sm">{localMutation.data.model_used}</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-2">Readmission Probability</div>
                    <div className="text-5xl font-bold text-gray-900">
                      {(localMutation.data.probability * 100).toFixed(1)}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full ${
                          localMutation.data.probability >= 0.7 ? 'bg-red-600' :
                          localMutation.data.probability >= 0.4 ? 'bg-amber-500' : 'bg-green-600'
                        }`}
                        style={{ width: `${localMutation.data.probability * 100}%` }}
                      />
                    </div>
                    <span className={`mt-3 text-xs px-2.5 py-1 rounded-full font-semibold ${
                      localMutation.data.risk_level === 'High' ? 'bg-red-100 text-red-700' :
                      localMutation.data.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {localMutation.data.risk_level} Risk
                    </span>
                  </div>
                </div>

                {/* SHAP */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Top Contributing Features (SHAP)
                  </h3>
                  <div className="overflow-hidden ring-1 ring-black ring-opacity-5 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Feature</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Value</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contribution</th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Direction</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {localMutation.data.shap_contributions.slice(0, 7).map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{item.feature}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.value}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                item.contribution > 0 ? 'bg-red-50 text-red-700 ring-red-600/20' : 'bg-green-50 text-green-700 ring-green-600/20'
                              }`}>
                                {Math.abs(item.contribution).toFixed(4)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 flex items-center gap-2">
                              {item.direction === 'increases' ? (
                                <><span className="w-2 h-2 rounded-full bg-red-500" /> Increases risk</>
                              ) : (
                                <><span className="w-2 h-2 rounded-full bg-green-500" /> Decreases risk</>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* LIME */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Plain-Language Explanation (LIME)
                  </h3>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      The model arrived at this prediction by evaluating several conditions. Here are the most significant rules that influenced the decision:
                    </p>
                    <ul className="space-y-3">
                      {localMutation.data.lime_explanation.map((item: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${item.direction === 'increases' ? 'bg-red-500' : 'bg-green-500'}`} />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Because <span className="font-bold text-indigo-600 font-mono">{item.rule}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              This {item.direction === 'increases' ? 'increased' : 'decreased'} the model's prediction output by approximately {(Math.abs(item.weight) * 100).toFixed(1)} percentage points.
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Explainability;
