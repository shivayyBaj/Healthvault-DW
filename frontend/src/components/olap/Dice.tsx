import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Activity, DollarSign, Users, AlertTriangle } from 'lucide-react';

const FILTERS = {
  year: { label: 'Year', options: ['all', '2023', '2024', '2025', '2026'] },
  quarter: { label: 'Quarter', options: ['all', 'Q1', 'Q2', 'Q3', 'Q4'] },
  department: { label: 'Department', options: ['all', 'Cardiology', 'Endocrinology', 'Neurology', 'Orthopedics', 'Internal Medicine'] },
  diagnosis: { label: 'Diagnosis', options: ['all', 'Circulatory', 'Endocrine', 'Respiratory', 'Digestive', 'Musculoskeletal'] },
  gender: { label: 'Gender', options: ['all', 'M', 'F'] },
  age_range: { label: 'Age Range', options: ['all', '0-18', '19-35', '36-50', '51-70', '71+'] },
};

function fmt(n: number) {
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K` : `$${n}`;
}

export default function Dice() {
  const [filters, setFilters] = useState<Record<string, string>>({
    year: 'all',
    quarter: 'all',
    department: 'all',
    diagnosis: 'all',
    gender: 'all',
    age_range: 'all',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['olap-dice', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => params.append(k, v));
      const { data } = await axios.get(`http://localhost:8000/api/olap/dice?${params}`);
      return data;
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const kpis = data?.kpis;
  const breakdown = data?.breakdown ?? [];
  const trend = data?.monthly_trend ?? [];
  const activeCount = data?.active_filter_count ?? 0;

  const activeFiltersText = useMemo(() => {
    const active = Object.entries(filters)
      .filter(([_, v]) => v !== 'all')
      .map(([k, v]) => `${FILTERS[k as keyof typeof FILTERS].label}="${v}"`);
    if (active.length === 0) return 'No filters applied. Showing all data.';
    return active.join(' AND ');
  }, [filters]);

  const querySummary = `Dicing the data cube by applying multiple filters simultaneously. Current condition: ${activeFiltersText}`;

  return (
    <div className="space-y-5">

      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-700 mb-4 border-b border-slate-100 pb-2">Apply Multiple Filters (Dice)</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(FILTERS).map(([key, { label, options }]) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{label}</label>
              <select
                value={filters[key]}
                onChange={(e) => handleFilterChange(key, e.target.value)}
                className={`w-full border rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-healthcare-500 outline-none ${
                  filters[key] !== 'all' ? 'border-healthcare-500 bg-healthcare-50 text-healthcare-900' : 'border-slate-300'
                }`}
              >
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'all' ? `All ${label}s` : opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
        <span className="font-semibold">📊 Current Query: </span>{querySummary}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Filtered Admissions', value: kpis?.total_admissions?.toLocaleString(), icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Filtered Cost', value: kpis ? fmt(kpis.total_cost) : '—', icon: DollarSign, color: 'text-green-600 bg-green-50' },
          { label: 'Avg Cost / Visit', value: kpis ? fmt(kpis.avg_cost) : '—', icon: Activity, color: 'text-purple-600 bg-purple-50' },
          { label: 'Readmission Rate', value: kpis ? `${(kpis.readmission_rate * 100).toFixed(1)}%` : '—', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-full ${k.color}`}><Icon className="h-4 w-4" /></div>
              <div>
                <p className="text-xs text-slate-500">{k.label}</p>
                <p className="text-lg font-bold text-slate-800">{isLoading ? '…' : k.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h4 className="font-semibold text-slate-700 mb-4">Admissions by Diagnosis Category</h4>
          <div className="h-56">
            {isLoading ? <div className="h-full bg-slate-100 animate-pulse rounded" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdown} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="category" type="category" width={110} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => v.toLocaleString()} />
                  <Bar dataKey="admissions" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h4 className="font-semibold text-slate-700 mb-4">Treatment Cost Trend</h4>
          <div className="h-56">
            {isLoading ? <div className="h-full bg-slate-100 animate-pulse rounded" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
