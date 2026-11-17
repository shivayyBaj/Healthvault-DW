import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Activity, DollarSign, Users, Clock } from 'lucide-react';

const DIMENSIONS: Record<string, { label: string; values: string[] }> = {
  year: { label: 'Year', values: ['2023', '2024', '2025', '2026'] },
  quarter: { label: 'Quarter', values: ['Q1', 'Q2', 'Q3', 'Q4'] },
  gender: { label: 'Gender', values: ['M', 'F'] },
  department: { label: 'Department', values: ['Cardiology', 'Endocrinology', 'Neurology', 'Orthopedics', 'Internal Medicine'] },
  diagnosis: { label: 'Diagnosis Category', values: ['Circulatory', 'Endocrine', 'Respiratory', 'Digestive', 'Musculoskeletal'] },
};

function fmt(n: number) {
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K` : `$${n}`;
}

export default function Slice() {
  const [dimension, setDimension] = useState('year');
  const [value, setValue] = useState('2026');

  const { data, isLoading } = useQuery({
    queryKey: ['olap-slice', dimension, value],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://localhost:8000/api/olap/slice?dimension=${dimension}&value=${encodeURIComponent(value)}`
      );
      return data;
    },
  });

  const handleDimChange = (dim: string) => {
    setDimension(dim);
    setValue(DIMENSIONS[dim].values[0]);
  };

  const kpis = data?.kpis;
  const trend = data?.monthly_trend ?? [];
  const diagBreakdown = data?.diagnosis_breakdown ?? [];

  const querySummary = `Selecting a single dimension value: ${DIMENSIONS[dimension]?.label} = "${value}". All metrics below are filtered to this exact dimension value only.`;

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap gap-6 items-end bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Dimension (what to slice on)</label>
          <select
            value={dimension}
            onChange={(e) => handleDimChange(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-healthcare-500 outline-none min-w-[180px]"
          >
            {Object.entries(DIMENSIONS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Value (exact slice)</label>
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-healthcare-500 outline-none min-w-[180px]"
          >
            {DIMENSIONS[dimension]?.values.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-right">
          <p className="text-xs text-slate-400">Slice Operation</p>
          <p className="text-sm font-mono font-semibold text-slate-700">
            WHERE {DIMENSIONS[dimension]?.label} = "{value}"
          </p>
        </div>
      </div>

      {/* Query Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
        <span className="font-semibold">📊 Current Query: </span>{querySummary}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Admissions', value: kpis?.total_admissions?.toLocaleString(), icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Cost', value: kpis ? fmt(kpis.total_cost) : '—', icon: DollarSign, color: 'text-green-600 bg-green-50' },
          { label: 'Avg Cost', value: kpis ? fmt(kpis.avg_cost) : '—', icon: Activity, color: 'text-purple-600 bg-purple-50' },
          { label: 'Avg Length of Stay', value: kpis ? `${kpis.avg_los} days` : '—', icon: Clock, color: 'text-orange-600 bg-orange-50' },
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h4 className="font-semibold text-slate-700 mb-4">Monthly Admission Trend — {DIMENSIONS[dimension]?.label}: {value}</h4>
          <div className="h-56">
            {isLoading ? <div className="h-full bg-slate-100 animate-pulse rounded" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="admissions" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h4 className="font-semibold text-slate-700 mb-4">Diagnosis Category Breakdown</h4>
          <div className="h-56">
            {isLoading ? <div className="h-full bg-slate-100 animate-pulse rounded" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diagBreakdown} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="category" type="category" width={110} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => v.toLocaleString()} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
