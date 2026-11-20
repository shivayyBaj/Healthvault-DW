import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Activity, DollarSign, Users, Clock } from 'lucide-react';

const LEVELS = ['day', 'month', 'quarter', 'year'] as const;
type Level = typeof LEVELS[number];

const LEVEL_LABELS: Record<Level, string> = {
  day: 'Daily',
  month: 'Monthly',
  quarter: 'Quarterly',
  year: 'Yearly',
};

const DEPARTMENTS = ['', 'Cardiology', 'Endocrinology', 'Neurology', 'Orthopedics', 'Internal Medicine'];

const BAR_COLOR = '#0ea5e9';

function fmt(n: number) {
  return n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(1)}K`
    : `$${n}`;
}

export default function RollUp() {
  const [level, setLevel] = useState<Level>('month');
  const [department, setDepartment] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['olap-rollup', level, department],
    queryFn: async () => {
      const params = new URLSearchParams({ level });
      if (department) params.set('department', department);
      const { data } = await axios.get(`http://localhost:8000/api/olap/rollup?${params}`);
      return data;
    },
  });

  const summary = data?.summary;
  const rows: any[] = data?.data ?? [];

  const querySummary = `Showing ${LEVEL_LABELS[level].toLowerCase()} admissions and treatment cost${
    department ? ` filtered to ${department}` : ' across all departments'
  }. Each bar represents one ${level === 'day' ? 'day' : level === 'month' ? 'month' : level === 'quarter' ? 'quarter' : 'year'}.`;

  return (
    <div className="space-y-5">

      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Aggregation Level</p>
          <div className="flex rounded-md border border-slate-300 overflow-hidden">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                  level === l
                    ? 'bg-healthcare-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {LEVEL_LABELS[l]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Department</p>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-healthcare-500 outline-none"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d || 'All Departments'}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
        <span className="font-semibold">📊 Current Query: </span>{querySummary}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Admissions', value: summary?.total_admissions?.toLocaleString(), icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Treatment Cost', value: summary ? fmt(summary.total_cost) : '—', icon: DollarSign, color: 'text-green-600 bg-green-50' },
          { label: 'Avg Cost / Admission', value: summary ? fmt(summary.avg_cost_per_admission) : '—', icon: Activity, color: 'text-purple-600 bg-purple-50' },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex items-center gap-4">
              <div className={`p-3 rounded-full ${kpi.color}`}><Icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-slate-500">{kpi.label}</p>
                <p className="text-xl font-bold text-slate-800">{isLoading ? '...' : kpi.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h4 className="font-semibold text-slate-700 mb-4">Admissions — {LEVEL_LABELS[level]}</h4>
          <div className="h-56">
            {isLoading ? (
              <div className="h-full bg-slate-100 animate-pulse rounded" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => v.toLocaleString()} />
                  <Bar dataKey="admissions" fill={BAR_COLOR} radius={[3, 3, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h4 className="font-semibold text-slate-700 mb-4">Treatment Cost — {LEVEL_LABELS[level]}</h4>
          <div className="h-56">
            {isLoading ? (
              <div className="h-full bg-slate-100 animate-pulse rounded" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rows} margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h4 className="font-semibold text-slate-700">Pivot Table — {LEVEL_LABELS[level]} Breakdown</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs font-semibold text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-5 py-3">Period</th>
                <th className="px-5 py-3 text-right">Admissions</th>
                <th className="px-5 py-3 text-right">Treatment Cost</th>
                <th className="px-5 py-3 text-right">Avg LoS (days)</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td colSpan={4} className="px-5 py-3"><div className="h-4 bg-slate-100 animate-pulse rounded w-full" /></td>
                    </tr>
                  ))
                : rows.map((row, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-800">{row.label}</td>
                      <td className="px-5 py-3 text-right">{row.admissions.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right">{fmt(row.cost)}</td>
                      <td className="px-5 py-3 text-right">{row.avg_los}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
