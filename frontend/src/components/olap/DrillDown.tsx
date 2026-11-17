import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ChevronRight, Home, MousePointerClick } from 'lucide-react';

const COLORS = ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

function fmt(n: number) {
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K` : `$${n}`;
}

export default function DrillDown() {
  const [level, setLevel] = useState<'department' | 'doctor' | 'visit'>('department');
  const [parentId, setParentId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<Array<{ label: string; id: string | null; level: string }>>([
    { label: 'All Departments', id: null, level: 'department' },
  ]);

  const { data, isLoading } = useQuery({
    queryKey: ['olap-drilldown', level, parentId],
    queryFn: async () => {
      const params = new URLSearchParams({ level });
      if (parentId) params.set('parent_id', parentId);
      const { data } = await axios.get(`http://localhost:8000/api/olap/drilldown?${params}`);
      return data;
    },
  });

  const rows: any[] = data?.data ?? [];
  const isVisitLevel = level === 'visit';

  function handleBarClick(entry: any) {
    if (level === 'department') {
      setParentId(entry.id);
      setLevel('doctor');
      setBreadcrumb([
        { label: 'All Departments', id: null, level: 'department' },
        { label: entry.label, id: entry.id, level: 'doctor' },
      ]);
    } else if (level === 'doctor') {
      setParentId(entry.id);
      setLevel('visit');
      const dept = breadcrumb.find((b) => b.level === 'doctor')?.label ?? '';
      setBreadcrumb([
        { label: 'All Departments', id: null, level: 'department' },
        { label: dept, id: dept, level: 'doctor' },
        { label: entry.label, id: entry.id, level: 'visit' },
      ]);
    }
  }

  function handleBreadcrumbClick(crumb: typeof breadcrumb[0]) {
    if (crumb.level === 'department') {
      setLevel('department');
      setParentId(null);
      setBreadcrumb([{ label: 'All Departments', id: null, level: 'department' }]);
    } else if (crumb.level === 'doctor') {
      setLevel('doctor');
      setParentId(crumb.id);
      setBreadcrumb(breadcrumb.slice(0, 2));
    }
  }

  const levelLabel = level === 'department' ? 'Department' : level === 'doctor' ? 'Doctor' : 'Individual Visit';
  const nextLevelHint = level === 'department' ? 'Click a bar to drill into doctors'
    : level === 'doctor' ? 'Click a bar to see individual visits'
    : null;

  const querySummary = level === 'department'
    ? 'Showing total admissions and treatment cost aggregated by department. Click any bar to drill down.'
    : level === 'doctor'
    ? `Showing doctor-level breakdown within ${breadcrumb[1]?.label}. Click any bar to view individual visits.`
    : `Showing individual visit records for ${data?.doctor ?? ''}. This is the lowest granularity level.`;

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-sm flex-wrap">
        <Home className="h-4 w-4 text-slate-400" />
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="h-4 w-4 text-slate-300" />}
            <button
              onClick={() => handleBreadcrumbClick(crumb)}
              className={`font-medium transition-colors ${
                i === breadcrumb.length - 1
                  ? 'text-healthcare-700 cursor-default'
                  : 'text-slate-500 hover:text-healthcare-600 hover:underline'
              }`}
            >
              {crumb.label}
            </button>
          </span>
        ))}
        <span className="ml-auto text-xs text-slate-400 font-medium uppercase">
          {levelLabel} Level
        </span>
      </div>

      {/* Query Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
        <span className="font-semibold">📊 Current Query: </span>{querySummary}
      </div>

      {nextLevelHint && (
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-lg border border-dashed border-slate-300">
          <MousePointerClick className="h-4 w-4 text-healthcare-500" />
          {nextLevelHint}
        </div>
      )}

      {/* Chart — only for dept and doctor */}
      {!isVisitLevel && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h4 className="font-semibold text-slate-700 mb-4">
            Admissions by {levelLabel}
          </h4>
          <div className="h-64">
            {isLoading ? (
              <div className="h-full bg-slate-100 animate-pulse rounded" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="label" type="category" width={130} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: number, name: string) =>
                      name === 'admissions' ? [v.toLocaleString(), 'Admissions'] : [fmt(v), 'Cost']
                    }
                  />
                  <Bar
                    dataKey="admissions"
                    radius={[0, 4, 4, 0]}
                    cursor={level !== 'doctor' ? 'pointer' : 'pointer'}
                    onClick={(entry) => handleBarClick(entry)}
                  >
                    {rows.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h4 className="font-semibold text-slate-700">
            {isVisitLevel ? 'Individual Visit Records' : `${levelLabel} Summary Table`}
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs font-semibold text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                {isVisitLevel ? (
                  <>
                    <th className="px-5 py-3">Visit ID</th>
                    <th className="px-5 py-3">Patient</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Diagnosis</th>
                    <th className="px-5 py-3 text-right">LoS</th>
                    <th className="px-5 py-3 text-right">Cost</th>
                    <th className="px-5 py-3 text-center">Readmission</th>
                  </>
                ) : (
                  <>
                    <th className="px-5 py-3">{levelLabel}</th>
                    <th className="px-5 py-3 text-right">Admissions</th>
                    <th className="px-5 py-3 text-right">Cost</th>
                    <th className="px-5 py-3 text-right">Avg LoS</th>
                    <th className="px-5 py-3 text-right">{level === 'department' ? 'Doctors' : 'Visits'}</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td colSpan={7} className="px-5 py-3">
                        <div className="h-4 bg-slate-100 animate-pulse rounded" />
                      </td>
                    </tr>
                  ))
                : rows.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b last:border-0 hover:bg-slate-50 transition-colors ${!isVisitLevel ? 'cursor-pointer' : ''}`}
                      onClick={() => !isVisitLevel && handleBarClick(row)}
                    >
                      {isVisitLevel ? (
                        <>
                          <td className="px-5 py-3 font-mono text-xs text-slate-700">{row.id}</td>
                          <td className="px-5 py-3">{row.patient_id}</td>
                          <td className="px-5 py-3">{row.date}</td>
                          <td className="px-5 py-3">{row.diagnosis}</td>
                          <td className="px-5 py-3 text-right">{row.los}d</td>
                          <td className="px-5 py-3 text-right">{fmt(row.cost)}</td>
                          <td className="px-5 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.readmission ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {row.readmission ? 'Yes' : 'No'}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-3 font-medium text-slate-800 text-healthcare-600 hover:underline">{row.label}</td>
                          <td className="px-5 py-3 text-right">{row.admissions.toLocaleString()}</td>
                          <td className="px-5 py-3 text-right">{fmt(row.cost)}</td>
                          <td className="px-5 py-3 text-right">{row.avg_los}d</td>
                          <td className="px-5 py-3 text-right">{row.child_count}</td>
                        </>
                      )}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
