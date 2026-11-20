import { Filter, RotateCcw } from 'lucide-react';

export interface DashboardFilters {
  dateRange: string;
  gender: string;
  ageGroup: string;
  department: string;
}

interface FilterBarProps {
  filters: DashboardFilters;
  onChange: (key: keyof DashboardFilters, value: string) => void;
  onReset?: () => void;
}

export default function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  const hasActiveFilters = Boolean(
    filters.dateRange || filters.gender || filters.ageGroup || filters.department
  );

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2 text-slate-700 font-medium mr-2">
        <Filter className="h-5 w-5 text-indigo-600" />
        <span>Filters:</span>
      </div>

      <select 
        value={filters.dateRange}
        onChange={(e) => onChange('dateRange', e.target.value)}
        className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer hover:border-slate-400 font-medium text-slate-700"
      >
        <option value="">All Dates</option>
        <option value="last30">Last 30 Days</option>
        <option value="last90">Last 90 Days</option>
        <option value="ytd">Year to Date</option>
      </select>

      <select 
        value={filters.gender}
        onChange={(e) => onChange('gender', e.target.value)}
        className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer hover:border-slate-400 font-medium text-slate-700"
      >
        <option value="">All Genders</option>
        <option value="M">Male</option>
        <option value="F">Female</option>
      </select>

      <select 
        value={filters.ageGroup}
        onChange={(e) => onChange('ageGroup', e.target.value)}
        className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer hover:border-slate-400 font-medium text-slate-700"
      >
        <option value="">All Age Groups</option>
        <option value="0-18">0-18</option>
        <option value="19-35">19-35</option>
        <option value="36-50">36-50</option>
        <option value="51-70">51-70</option>
        <option value="71+">71+</option>
      </select>

      <select 
        value={filters.department}
        onChange={(e) => onChange('department', e.target.value)}
        className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer hover:border-slate-400 font-medium text-slate-700"
      >
        <option value="">All Departments</option>
        <option value="Cardiology">Cardiology</option>
        <option value="Emergency">Emergency / Trauma</option>
        <option value="Family">Family / General Practice</option>
        <option value="InternalMedicine">Internal Medicine</option>
        <option value="Nephrology">Nephrology</option>
        <option value="Orthopedics">Orthopedics</option>
        <option value="Pulmonology">Pulmonology</option>
        <option value="Surgery">Surgery</option>
      </select>

      {hasActiveFilters && onReset && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-3 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 transition-colors ml-auto border border-indigo-200"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filters
        </button>
      )}
    </div>
  );
}
