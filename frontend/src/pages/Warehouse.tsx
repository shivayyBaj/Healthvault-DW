import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Database, History, Calendar, Heart, Shield, CheckCircle } from 'lucide-react';

export default function Warehouse() {
  const [patientId, setPatientId] = useState('P0001');
  const [searchInput, setSearchInput] = useState('P0001');

  const { data: history, isLoading, isError } = useQuery({
    queryKey: ['patientHistory', patientId],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:8000/api/warehouse/patients/${patientId}`);
      return data;
    },
    enabled: !!patientId
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setPatientId(searchInput.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Data Warehouse</h2>
        <p className="text-slate-500 text-sm mt-1">Star Schema explorer & SCD Type 2 demonstrator</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <History className="h-5 w-5 text-healthcare-600" /> Patient History (SCD Type 2)
            </h3>
            <p className="text-sm text-slate-500">Track changes to patient dimensions over time</p>
          </div>
          <form onSubmit={handleSearch} className="flex relative">
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Patient ID (e.g. P001)"
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-healthcare-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <button type="submit" className="bg-healthcare-600 text-white px-4 py-2 rounded-r-md hover:bg-healthcare-700 transition-colors text-sm font-medium">
              Search
            </button>
          </form>
        </div>

        <div className="p-6">
          {isLoading && <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-200 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-slate-200 rounded"></div></div></div></div>}

          {isError && <div className="text-red-500 p-4 bg-red-50 rounded-md">Error loading patient history. Is the backend running?</div>}

          {history && history.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Database className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p>No dimension records found for Patient ID: <strong>{patientId}</strong></p>
              <p className="text-sm mt-1">Run the ETL pipeline to generate synthetic history.</p>
            </div>
          )}

          {history && history.length > 0 && (
            <div className="relative border-l-2 border-slate-200 ml-3 md:ml-6 space-y-8">
              {history.map((record: any, index: number) => (
                <div key={record.patient_key} className="relative pl-8">

                  <div className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-white ${record.is_current ? 'bg-green-500' : 'bg-slate-400'}`}></div>

                  <div className={`bg-white p-5 rounded-lg border shadow-sm transition-all ${record.is_current ? 'border-green-200 ring-1 ring-green-100' : 'border-slate-200'}`}>
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-lg">Version {index + 1}</h4>
                          {record.is_current && <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full"><CheckCircle className="h-3 w-3"/> CURRENT</span>}
                        </div>
                        <p className="text-xs text-slate-500 font-mono mt-1">Surrogate Key: {record.patient_key}</p>
                      </div>
                      <div className="text-right flex items-center gap-4 text-sm">
                        <div className="text-slate-600">
                          <p className="font-medium flex items-center justify-end gap-1"><Calendar className="h-3 w-3"/> Effective</p>
                          <p>{record.effective_date}</p>
                        </div>
                        <div className="text-slate-600">
                          <p className="font-medium flex items-center justify-end gap-1"><Calendar className="h-3 w-3"/> Expiry</p>
                          <p>{record.expiry_date || '9999-12-31'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-md border border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-1"><Shield className="h-3 w-3"/> Insurance</p>
                        <p className="font-semibold text-slate-800">{record.insurance_type || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-1"><Heart className="h-3 w-3"/> BMI</p>
                        <p className="font-semibold text-slate-800">{record.bmi}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-1">Age</p>
                        <p className="font-semibold text-slate-800">{record.age}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-1">Gender</p>
                        <p className="font-semibold text-slate-800">{record.gender}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
