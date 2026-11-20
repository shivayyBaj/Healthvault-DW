import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { TrendingUp, Settings, Activity, Info, BookOpen, AlertCircle } from 'lucide-react';

const fetchForecast = async (payload: any) => {
  const { data } = await axios.post('http://localhost:8000/api/ml/forecasting', payload);
  return data;
};

export default function Forecasting() {
  const [aggregation, setAggregation] = useState<'day' | 'week'>('day');
  const [historyDays, setHistoryDays] = useState<number>(365);
  const [horizon, setHorizon] = useState<number>(30);

  const [p, setP] = useState<number>(5);
  const [d, setD] = useState<number>(1);
  const [q, setQ] = useState<number>(0);

  const mutation = useMutation({
    mutationFn: fetchForecast,
  });

  React.useEffect(() => {
    mutation.mutate({ aggregation, history_days: historyDays, horizon, p, d, q });

  }, []);

  const handleRun = () => {
    mutation.mutate({ aggregation, history_days: historyDays, horizon, p, d, q });
  };

  let chartData: any[] = [];
  if (mutation.data && !mutation.data.error) {
    const historyMap = new Map();
    mutation.data.history.forEach((h: any) => {
      historyMap.set(h.date, {
        date: h.date,
        actual: h.actual,
        fitted: h.predicted
      });
    });

    mutation.data.forecast.forEach((f: any) => {
      if (historyMap.has(f.date)) {
        historyMap.set(f.date, {
          ...historyMap.get(f.date),
          forecast: f.forecast,
          ci_range: [f.lower_bound, f.upper_bound]
        });
      } else {
        historyMap.set(f.date, {
          date: f.date,
          forecast: f.forecast,
          ci_range: [f.lower_bound, f.upper_bound]
        });
      }
    });

    chartData = Array.from(historyMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  const lastHistoryDate = mutation.data && !mutation.data.error && mutation.data.history.length > 0 
    ? mutation.data.history[mutation.data.history.length - 1].date 
    : null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-indigo-600" />
            Time-Series Forecasting
          </h1>
          <p className="mt-2 text-gray-500">
            Predict future patient admission volumes based on historical patterns.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-gray-500" />
              Model Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aggregation</label>
                <select 
                  value={aggregation} 
                  onChange={(e) => setAggregation(e.target.value as any)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                >
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Historical Range (Days)</label>
                <input 
                  type="number" 
                  value={historyDays} 
                  onChange={(e) => setHistoryDays(parseInt(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forecast Horizon ({aggregation}s)</label>
                <input 
                  type="number" 
                  value={horizon} 
                  onChange={(e) => setHorizon(parseInt(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-900 mb-2">ARIMA Parameters</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 text-center">AR (p)</label>
                    <input type="number" min="0" value={p} onChange={(e) => setP(parseInt(e.target.value))} className="w-full text-center rounded-md border-gray-300 p-1.5 border sm:text-sm"/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 text-center">Diff (d)</label>
                    <input type="number" min="0" value={d} onChange={(e) => setD(parseInt(e.target.value))} className="w-full text-center rounded-md border-gray-300 p-1.5 border sm:text-sm"/>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 text-center">MA (q)</label>
                    <input type="number" min="0" value={q} onChange={(e) => setQ(parseInt(e.target.value))} className="w-full text-center rounded-md border-gray-300 p-1.5 border sm:text-sm"/>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRun}
                disabled={mutation.isPending}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors disabled:opacity-50 mt-4"
              >
                {mutation.isPending ? 'Generating Forecast...' : 'Run Forecast'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">

          {mutation.isPending && !mutation.data && (
            <div className="h-96 bg-white rounded-2xl border border-gray-100 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <Activity className="h-10 w-10 text-indigo-500 animate-pulse mb-4" />
                <p className="text-indigo-600 font-medium">Fitting Time-Series Model...</p>
              </div>
            </div>
          )}

          {mutation.data?.error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
              {mutation.data.error}
            </div>
          )}

          {mutation.data && !mutation.data.error && (
            <>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">MAE</div>
                  <div className="text-2xl font-bold text-gray-900">{mutation.data.metrics.mae.toFixed(2)}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">RMSE</div>
                  <div className="text-2xl font-bold text-gray-900">{mutation.data.metrics.rmse.toFixed(2)}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">AIC</div>
                  <div className="text-2xl font-bold text-gray-900">{mutation.data.metrics.aic.toFixed(1)}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Order (p,d,q)</div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {`(${mutation.data.metrics.order.join(',')})`}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Historical vs Forecasted Admissions</h3>

                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{fontSize: 12}} 
                        minTickGap={30}
                        tickFormatter={(val) => {
                          const d = new Date(val);
                          return `${d.getMonth()+1}/${d.getDate()}`;
                        }}
                      />
                      <YAxis tick={{fontSize: 12}} />
                      <Tooltip 
                        labelStyle={{fontWeight: 'bold', color: '#111827'}}
                        itemStyle={{fontSize: '13px'}}
                        formatter={(value: any, name: string) => {
                          if (Array.isArray(value)) return [`${value[0].toFixed(1)} to ${value[1].toFixed(1)}`, '95% Confidence'];
                          return [value.toFixed(1), name.charAt(0).toUpperCase() + name.slice(1)];
                        }}
                      />
                      <Legend />
                      {lastHistoryDate && <ReferenceLine x={lastHistoryDate} stroke="#9CA3AF" strokeDasharray="3 3" />}

                      <Area type="monotone" dataKey="ci_range" fill="#E0E7FF" stroke="none" name="95% Confidence" />
                      <Line type="monotone" dataKey="actual" stroke="#111827" strokeWidth={2} dot={false} name="Actual" />

                      <Line type="monotone" dataKey="forecast" stroke="#4F46E5" strokeWidth={3} dot={false} name="Forecast" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Recent Validation (Last 5 periods)</h3>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actual</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Predicted</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {mutation.data.eval_table.map((row: any) => (
                        <tr key={row.date} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{row.date}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">{row.actual.toFixed(1)}</td>
                          <td className="px-4 py-2 text-sm text-gray-500 text-right">{row.predicted.toFixed(1)}</td>
                          <td className="px-4 py-2 text-sm text-right font-medium">
                            <span className={row.error > 0 ? "text-green-600" : "text-red-600"}>
                              {row.error > 0 ? '+' : ''}{row.error.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6">
                  <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Forecasting Concepts
                  </h3>
                  <div className="space-y-4 text-sm text-indigo-900/80">
                    <div>
                      <strong className="text-indigo-900 block">Time Series</strong>
                      A sequence of data points indexed in time order. Here, we observe admission volumes over days or weeks.
                    </div>
                    <div>
                      <strong className="text-indigo-900 block">Trend & Seasonality</strong>
                      <span className="font-semibold">Trend</span> is the long-term progression of the series (e.g., admissions steadily increasing over years). <span className="font-semibold">Seasonality</span> refers to recurring, predictable fluctuations (e.g., fewer admissions on weekends).
                    </div>
                    <div>
                      <strong className="text-indigo-900 block">Forecast Horizon</strong>
                      The length of time into the future for which predictions are being made.
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="bg-white/60 p-3 rounded-lg">
                        <strong className="text-indigo-900 block">MAE</strong>
                        <span className="text-xs">Mean Absolute Error. The average absolute difference between predicted and actual values. Lower is better.</span>
                      </div>
                      <div className="bg-white/60 p-3 rounded-lg">
                        <strong className="text-indigo-900 block">RMSE</strong>
                        <span className="text-xs">Root Mean Squared Error. Penalizes larger errors more heavily than MAE. Lower is better.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </>
          )}

        </div>
      </div>
    </div>
  );
}
