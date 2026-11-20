import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AlertTriangle, Download, RefreshCw } from 'lucide-react';
import KPIGrid from '../components/dashboard/KPIGrid';
import FilterBar, { DashboardFilters } from '../components/dashboard/FilterBar';
import ModelTable from '../components/dashboard/ModelTable';
import { TrendChart, ReadmissionPie, DiagnosisBar, ForecastChart, PCAScatter } from '../components/dashboard/Charts';

const INITIAL_FILTERS: DashboardFilters = {
  dateRange: '',
  gender: '',
  ageGroup: '',
  department: '',
};

const fetchFullDashboard = async (filters: DashboardFilters) => {
  const params = new URLSearchParams();
  if (filters.dateRange) params.append('date_range', filters.dateRange);
  if (filters.gender) params.append('gender', filters.gender);
  if (filters.ageGroup) params.append('age_group', filters.ageGroup);
  if (filters.department) params.append('department', filters.department);

  const queryString = params.toString();
  const url = `http://localhost:8000/api/dashboard/full${queryString ? `?${queryString}` : ''}`;
  const { data } = await axios.get(url);
  return data;
};

export default function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilters>(INITIAL_FILTERS);

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['dashboardFull', filters],
    queryFn: () => fetchFullDashboard(filters),
  });

  if (isLoading && !data) {
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
        <p className="text-sm mt-2">Ensure the Flask backend is running on port 8000.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">HealthVault DW</h1>
            {isFetching && (
              <span className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" /> Updating...
              </span>
            )}
          </div>
          <h2 className="text-lg text-slate-500 mt-1">Healthcare Data Warehouse & Intelligent Analytics</h2>
        </div>
        <button 
          onClick={() => {
            const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
            const dlAnchor = document.createElement('a');
            dlAnchor.setAttribute("href", jsonStr);
            dlAnchor.setAttribute("download", "healthvault_dashboard_export.json");
            dlAnchor.click();
          }}
          className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium"
        >
          <Download className="h-4 w-4" /> Export Data
        </button>
      </div>

      <FilterBar 
        filters={filters} 
        onChange={handleFilterChange} 
        onReset={handleResetFilters} 
      />

      <KPIGrid data={data.kpis} />

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

          <DiagnosisBar data={(data.departmentActivity || []).map((d: any) => ({ name: d.name, value: d.visits }))} /> 
        </div>

        <div className="col-span-1 lg:col-span-3">
          <ModelTable data={data.modelSummary} />
        </div>
      </div>
    </div>
  );
}
