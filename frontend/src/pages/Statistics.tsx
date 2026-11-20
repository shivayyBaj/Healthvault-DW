import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Download, Info, CheckCircle2, AlertCircle, BarChart3, Calculator, Scale, FileSpreadsheet } from 'lucide-react';

export default function Statistics() {
  const [activeTab, setActiveTab] = useState('descriptive');
  const [descVar, setDescVar] = useState('treatment_cost');

  const { data: descData, isLoading: descLoading } = useQuery({
    queryKey: ['stats-desc', descVar],
    queryFn: async () => (await axios.get(`http://localhost:8000/api/stats/descriptive?variable=${descVar}`)).data,
    enabled: activeTab === 'descriptive'
  });

  const { data: ttestData, isLoading: ttestLoading } = useQuery({
    queryKey: ['stats-ttest'],
    queryFn: async () => (await axios.get('http://localhost:8000/api/stats/ttest')).data,
    enabled: activeTab === 'ttest'
  });

  const { data: chiData, isLoading: chiLoading } = useQuery({
    queryKey: ['stats-chi'],
    queryFn: async () => (await axios.get('http://localhost:8000/api/stats/chisquare')).data,
    enabled: activeTab === 'chi'
  });

  const { data: anovaData, isLoading: anovaLoading } = useQuery({
    queryKey: ['stats-anova'],
    queryFn: async () => (await axios.get('http://localhost:8000/api/stats/anova')).data,
    enabled: activeTab === 'anova'
  });

  const downloadCsv = (data: any, filename: string) => {
    if (!data) return;

    let csvStr = '';

    if (activeTab === 'chi') {
      csvStr = 'Gender,Diagnosis,Observed,Expected\n';
      data.table.forEach((row: any) => {
        csvStr += `${row.gender},${row.diagnosis},${row.observed},${row.expected.toFixed(2)}\n`;
      });
    } else if (activeTab === 'anova') {
      csvStr = 'Group,Count,Mean,StdDev\n';
      data.group_stats.forEach((row: any) => {
        csvStr += `${row.group},${row.count},${row.mean.toFixed(2)},${row.std.toFixed(2)}\n`;
      });
    } else {
      const flat = Object.entries(data).filter(([_, v]) => typeof v !== 'object');
      csvStr = 'Metric,Value\n' + flat.map(([k, v]) => `${k},${v}`).join('\n');
    }

    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const HypothesisBlock = ({ data }: { data: any }) => {
    if (!data) return null;
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-6">
        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Info className="h-5 w-5 text-blue-500" /> Statistical Hypotheses</h4>
        <div className="space-y-2 text-sm text-slate-700">
          <p><span className="font-semibold text-slate-900">H₀ (Null Hypothesis):</span> {data.hypotheses.null}</p>
          <p><span className="font-semibold text-slate-900">H₁ (Alternative Hypothesis):</span> {data.hypotheses.alternative}</p>
          <p><span className="font-semibold text-slate-900">Significance Level (α):</span> {data.alpha}</p>
        </div>
      </div>
    );
  };

  const InterpretationBlock = ({ data }: { data: any }) => {
    if (!data) return null;
    return (
      <div className={`border rounded-lg p-5 mt-6 ${data.significant ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
        <h4 className={`font-bold mb-3 flex items-center gap-2 ${data.significant ? 'text-green-800' : 'text-slate-800'}`}>
          {data.significant ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-slate-500" />} 
          Statistical Interpretation
        </h4>
        <div className="space-y-3 text-sm">
          <p className={data.significant ? 'text-green-900' : 'text-slate-700'}>{data.interpretation}</p>
          <div className="bg-white/60 p-3 rounded border border-white/40 italic text-slate-600 text-xs">
            <span className="font-semibold">Important Distinction:</span> A "statistically significant association or difference" merely indicates that the observed pattern is unlikely to be due to random chance under the null hypothesis. It does <strong>not</strong> imply a causal relationship. For example, age is associated with higher treatment costs, but age itself may not directly cause the cost; rather, the complex medical conditions that correlate with age drive the cost.
          </div>
        </div>
      </div>
    );
  };

  const TABS = [
    { id: 'descriptive', label: 'Descriptive Stats', icon: Calculator },
    { id: 'ttest', label: 't-test (BP vs Diabetes)', icon: Scale },
    { id: 'chi', label: 'Chi-Square (Gender vs Diagnosis)', icon: BarChart3 },
    { id: 'anova', label: 'ANOVA (Cost vs Age)', icon: FileSpreadsheet },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Statistical Analysis</h2>
          <p className="text-slate-500 text-sm mt-1">Rigorous hypothesis testing and descriptive analytics</p>
        </div>
        <button 
          onClick={() => downloadCsv(
            activeTab === 'descriptive' ? descData : activeTab === 'ttest' ? ttestData : activeTab === 'chi' ? chiData : anovaData,
            `healthvault_stats_${activeTab}`
          )}
          className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors shadow-sm font-medium text-sm"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                active ? 'border-healthcare-600 text-healthcare-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-healthcare-600' : 'text-slate-400'}`} /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">

        {activeTab === 'descriptive' && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="mb-6 max-w-sm">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select Numeric Variable</label>
              <select 
                value={descVar} 
                onChange={e => setDescVar(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-healthcare-500 outline-none"
              >
                <option value="treatment_cost">Treatment Cost ($)</option>
                <option value="blood_pressure">Systolic Blood Pressure (mmHg)</option>
                <option value="length_of_stay">Length of Stay (Days)</option>
                <option value="glucose">Glucose Level (mg/dL)</option>
                <option value="heart_rate">Heart Rate (bpm)</option>
              </select>
            </div>

            {descLoading ? <div className="h-40 bg-slate-100 animate-pulse rounded" /> : descData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg"><p className="text-xs text-slate-500 uppercase font-semibold">Count (N)</p><p className="text-2xl font-bold text-slate-800">{descData.count}</p></div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg"><p className="text-xs text-slate-500 uppercase font-semibold">Mean (μ)</p><p className="text-2xl font-bold text-slate-800">{descData.mean.toFixed(2)}</p></div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg"><p className="text-xs text-slate-500 uppercase font-semibold">Median</p><p className="text-2xl font-bold text-slate-800">{descData.median.toFixed(2)}</p></div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg"><p className="text-xs text-slate-500 uppercase font-semibold">Std Deviation (σ)</p><p className="text-2xl font-bold text-slate-800">{descData.std_dev.toFixed(2)}</p></div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg"><p className="text-xs text-slate-500 uppercase font-semibold">Variance (σ²)</p><p className="text-xl font-semibold text-slate-700">{descData.variance.toFixed(2)}</p></div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg"><p className="text-xs text-slate-500 uppercase font-semibold">Min / Max</p><p className="text-xl font-semibold text-slate-700">{descData.min.toFixed(1)} / {descData.max.toFixed(1)}</p></div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg"><p className="text-xs text-slate-500 uppercase font-semibold">Q1 / Q3</p><p className="text-xl font-semibold text-slate-700">{descData.q1.toFixed(1)} / {descData.q3.toFixed(1)}</p></div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg"><p className="text-xs text-slate-500 uppercase font-semibold">95% Confidence Interval</p><p className="text-xl font-semibold text-slate-700">[{descData.ci_lower.toFixed(1)}, {descData.ci_upper.toFixed(1)}]</p></div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ttest' && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            {ttestLoading ? <div className="h-64 bg-slate-100 animate-pulse rounded" /> : ttestData && (
              <>
                <HypothesisBlock data={ttestData} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-slate-700 mb-3 border-b pb-2">Group Statistics</h5>
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                        <tr><th className="p-2">Group</th><th className="p-2">N</th><th className="p-2">Mean BP (mmHg)</th></tr>
                      </thead>
                      <tbody>
                        <tr className="border-b"><td className="p-2 font-medium">Diabetic</td><td className="p-2">{ttestData.n_diabetic}</td><td className="p-2 font-semibold text-red-600">{ttestData.mean_diabetic.toFixed(2)}</td></tr>
                        <tr><td className="p-2 font-medium">Non-Diabetic</td><td className="p-2">{ttestData.n_nondiabetic}</td><td className="p-2 font-semibold text-green-600">{ttestData.mean_nondiabetic.toFixed(2)}</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-700 mb-3 border-b pb-2">Test Results</h5>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Mean Difference</span><span className="font-mono font-medium">{ttestData.mean_diff.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">t-statistic</span><span className="font-mono font-medium">{ttestData.t_stat.toFixed(4)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">p-value</span><span className={`font-mono font-bold ${ttestData.p_value < 0.05 ? 'text-green-600' : 'text-slate-700'}`}>{ttestData.p_value < 0.001 ? '< 0.001' : ttestData.p_value.toFixed(4)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">95% CI of Difference</span><span className="font-mono font-medium">[{ttestData.ci_lower.toFixed(2)}, {ttestData.ci_upper.toFixed(2)}]</span></div>
                    </div>
                  </div>
                </div>

                <InterpretationBlock data={ttestData} />
              </>
            )}
          </div>
        )}

        {activeTab === 'chi' && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            {chiLoading ? <div className="h-64 bg-slate-100 animate-pulse rounded" /> : chiData && (
              <>
                <HypothesisBlock data={chiData} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <h5 className="font-semibold text-slate-700 mb-3 border-b pb-2">Contingency Table: Observed (Expected)</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-center border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 text-xs uppercase">
                            <th className="border p-2 text-left">Gender</th>
                            {chiData.categories.map((c: string) => <th key={c} className="border p-2">{c}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {chiData.genders.map((g: string) => (
                            <tr key={g}>
                              <td className="border p-2 text-left font-semibold text-slate-700 bg-slate-50">{g}</td>
                              {chiData.categories.map((c: string) => {
                                const cell = chiData.table.find((x: any) => x.gender === g && x.diagnosis === c);
                                return (
                                  <td key={c} className="border p-2">
                                    <span className="block font-bold text-slate-800">{cell.observed}</span>
                                    <span className="block text-xs text-slate-500">({cell.expected.toFixed(1)})</span>
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-700 mb-3 border-b pb-2">Test Results</h5>
                    <div className="space-y-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div className="flex flex-col"><span className="text-slate-500 text-xs uppercase">Chi-Square Statistic (χ²)</span><span className="font-mono font-medium text-lg">{chiData.chi2_stat.toFixed(4)}</span></div>
                      <div className="flex flex-col"><span className="text-slate-500 text-xs uppercase">Degrees of Freedom (df)</span><span className="font-mono font-medium text-lg">{chiData.dof}</span></div>
                      <div className="flex flex-col"><span className="text-slate-500 text-xs uppercase">p-value</span><span className={`font-mono font-bold text-lg ${chiData.p_value < 0.05 ? 'text-green-600' : 'text-slate-700'}`}>{chiData.p_value < 0.001 ? '< 0.001' : chiData.p_value.toFixed(4)}</span></div>
                    </div>
                  </div>
                </div>

                <InterpretationBlock data={chiData} />
              </>
            )}
          </div>
        )}

        {activeTab === 'anova' && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            {anovaLoading ? <div className="h-64 bg-slate-100 animate-pulse rounded" /> : anovaData && (
              <>
                <HypothesisBlock data={anovaData} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-slate-700 mb-3 border-b pb-2">Group Statistics (Treatment Cost)</h5>
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                        <tr><th className="p-2 border-b">Age Group</th><th className="p-2 border-b">N</th><th className="p-2 border-b">Mean Cost</th><th className="p-2 border-b">Std Dev</th></tr>
                      </thead>
                      <tbody>
                        {anovaData.group_stats.map((g: any) => (
                          <tr key={g.group} className="border-b last:border-0 hover:bg-slate-50">
                            <td className="p-2 font-medium">{g.group}</td>
                            <td className="p-2">{g.count}</td>
                            <td className="p-2 font-mono font-semibold">${g.mean.toFixed(2)}</td>
                            <td className="p-2 font-mono text-slate-500">${g.std.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-700 mb-3 border-b pb-2">ANOVA Table / Results</h5>
                    <div className="space-y-4 text-sm bg-slate-50 p-5 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-center"><span className="text-slate-500">F-statistic</span><span className="font-mono font-medium text-lg">{anovaData.f_stat.toFixed(4)}</span></div>
                      <div className="flex justify-between items-center"><span className="text-slate-500">p-value</span><span className={`font-mono font-bold text-lg ${anovaData.p_value < 0.05 ? 'text-green-600' : 'text-slate-700'}`}>{anovaData.p_value < 0.001 ? '< 0.001' : anovaData.p_value.toFixed(4)}</span></div>
                    </div>
                  </div>
                </div>

                <InterpretationBlock data={anovaData} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
