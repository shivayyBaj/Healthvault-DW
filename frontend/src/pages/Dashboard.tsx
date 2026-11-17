import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AlertTriangle, Download } from 'lucide-react';
import KPIGrid from '../components/dashboard/KPIGrid';
import FilterBar from '../components/dashboard/FilterBar';
import ModelTable from '../components/dashboard/ModelTable';
import { TrendChart, ReadmissionPie, DiagnosisBar, ForecastChart, PCAScatter } from '../components/dashboard/Charts';

const fetchFullDashboard = async () => {
  const { data } = await axios.get('http://localhost:8000/api/dashboard/full');
  return data;
};

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardFull'],
    queryFn: fetchFullDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="h-24 bg-slate-200 animate-pulse rounded-lg"></div>
        <div className="h-16 bg-slate-200 animate-pulse rounded-lg"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-lg"></div>)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 bg-slate-200 animate-pulse rounded-lg"></div>
          <div className="h-64 bg-slate-200 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-red-200 text-red-500">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold">Failed to load dashboard data</h2>
        <p className="text-sm mt-2">Ensure the FastAPI backend is running and the database is seeded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">HealthVault DW</h1>
            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold tracking-wider uppercase border border-blue-200">
              Academic Prototype
            </span>
          </div>
          <h2 className="text-lg text-slate-500 mt-1">Healthcare Data Warehouse & Intelligent Analytics</h2>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-3 shadow-sm">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-900 leading-relaxed">
          <strong>Disclaimer:</strong> Educational analytics prototype using public/synthetic data. Not intended for clinical diagnosis, treatment recommendations, or real-world medical decisions.
        </p>
      </div>

      <FilterBar />

      <KPIGrid data={data.kpis} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2">
          <TrendChart data={data.admissionTrends} title="Monthly Admissions Trend" />
        </div>
        <div className="col-span-1">
          <ReadmissionPie data={data.readmissionDist} />
        </div>
        
        <div className="col-span-1 lg:col-span-2">
          <ForecastChart data={data.forecast} />
        </div>
        <PCAScatter data={data.patientSegmentation} />
        
        <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <DiagnosisBar data={data.diagnosisDist} />
          {/* Department Activity uses the same bar chart format */}
          <DiagnosisBar data={data.departmentActivity.map((d: any) => ({ name: d.name, value: d.visits }))} /> 
        </div>

        <div className="col-span-1 lg:col-span-3">
          <ModelTable data={data.modelSummary} />
        </div>
      </div>
    </div>
  );
}
