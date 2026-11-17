import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Stethoscope, Activity, User, FileText, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export default function Prediction() {
  const [formData, setFormData] = useState({
    age: 65,
    gender: 'Male',
    bmi: 28.5,
    glucose: 140,
    bp_sys: 135,
    heart_rate: 80,
    los: 5,
    chronic_conditions: 2,
    prev_admissions: 1,
    insurance: 'Medicare',
    diagnosis: 'Circulatory',
    department: 'Cardiology'
  });

  const predict = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await axios.post('http://localhost:8000/api/ml/predict', data);
      return res.data;
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    predict.mutate(formData);
  };

  const result = predict.data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">30-Day Readmission Predictor</h2>
        <p className="text-slate-500 mt-2">Enter patient vitals and demographics to estimate readmission risk.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* INPUT FORM */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2"><User className="h-4 w-4"/> Demographics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-healthcare-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-healthcare-500 outline-none">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Insurance</label>
                  <select name="insurance" value={formData.insurance} onChange={handleChange} className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-healthcare-500 outline-none">
                    <option value="Medicare">Medicare</option>
                    <option value="Medicaid">Medicaid</option>
                    <option value="Private">Private</option>
                    <option value="Uninsured">Uninsured</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2"><Activity className="h-4 w-4"/> Vitals & Conditions</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">BMI</label>
                  <input type="number" step="0.1" name="bmi" value={formData.bmi} onChange={handleChange} className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-healthcare-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Glucose</label>
                  <input type="number" name="glucose" value={formData.glucose} onChange={handleChange} className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-healthcare-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Systolic BP</label>
                  <input type="number" name="bp_sys" value={formData.bp_sys} onChange={handleChange} className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-healthcare-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Heart Rate</label>
                  <input type="number" name="heart_rate" value={formData.heart_rate} onChange={handleChange} className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-healthcare-500 outline-none" required />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-2"><FileText className="h-4 w-4"/> Visit Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Length of Stay</label>
                  <input type="number" name="los" value={formData.los} onChange={handleChange} className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-healthcare-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prior Admissions</label>
                  <input type="number" name="prev_admissions" value={formData.prev_admissions} onChange={handleChange} className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-healthcare-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Chronic Count</label>
                  <input type="number" name="chronic_conditions" value={formData.chronic_conditions} onChange={handleChange} className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-healthcare-500 outline-none" required />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
                  <select name="diagnosis" value={formData.diagnosis} onChange={handleChange} className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-healthcare-500 outline-none">
                    <option value="Circulatory">Circulatory</option>
                    <option value="Endocrine">Endocrine</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Digestive">Digestive</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={predict.isPending}
              className="w-full bg-healthcare-600 text-white font-bold py-3 rounded-lg hover:bg-healthcare-700 transition-colors shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {predict.isPending ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Stethoscope className="h-5 w-5" />}
              Generate Risk Prediction
            </button>
          </form>
        </div>

        {/* RESULTS PANEL */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm sticky top-6 overflow-hidden">
            <div className="bg-slate-800 text-white p-4 text-center">
              <h3 className="font-bold text-lg">Analysis Result</h3>
            </div>
            
            <div className="p-6">
              {!result && !predict.isPending && (
                <div className="text-center py-12 text-slate-400">
                  <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Awaiting patient data submission...</p>
                </div>
              )}

              {predict.isPending && (
                <div className="text-center py-12 text-slate-400">
                  <div className="h-12 w-12 border-4 border-healthcare-200 border-t-healthcare-600 rounded-full animate-spin mx-auto mb-4" />
                  <p>Running ML Pipeline Inference...</p>
                </div>
              )}

              {result?.error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex gap-3 items-start">
                  <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{result.error}</p>
                </div>
              )}

              {result && !result.error && (
                <div className="space-y-6 flex flex-col items-center">
                  
                  {/* Risk Gauge/Meter equivalent */}
                  <div className="text-center w-full">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">Readmission Risk</p>
                    <div className={`p-6 rounded-full inline-block border-4 shadow-inner ${
                      result.risk_level === 'High' ? 'bg-red-50 border-red-500 text-red-600' :
                      result.risk_level === 'Medium' ? 'bg-amber-50 border-amber-500 text-amber-600' :
                      'bg-green-50 border-green-500 text-green-600'
                    }`}>
                      <span className="text-4xl font-black block">{(result.probability * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-50 border border-slate-100 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-slate-500 text-sm">Classification</span>
                      <span className={`font-bold ${result.predicted_class === 1 ? 'text-red-600' : 'text-green-600'}`}>
                        {result.predicted_class === 1 ? 'Positive (Readmission)' : 'Negative (Safe)'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-slate-500 text-sm">Risk Tier</span>
                      <span className="font-bold text-slate-800">{result.risk_level}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-sm">Active Model</span>
                      <span className="font-mono text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {result.model_used}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2 items-start mt-4">
                    <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 font-medium leading-relaxed">
                      {result.disclaimer} This system demonstrates predictive analytics capabilities and does not provide clinical diagnoses.
                    </p>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
