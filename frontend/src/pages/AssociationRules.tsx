import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Download, Info, Link as LinkIcon, Network, TrendingUp, AlertTriangle } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, BarChart, Bar, Cell } from 'recharts';

export default function AssociationRules() {
  const [minSupport, setMinSupport] = useState(0.1);
  const [minConfidence, setMinConfidence] = useState(0.4);
  const [minLift, setMinLift] = useState(1.1);
  const [selectedRule, setSelectedRule] = useState<any>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['association-rules', minSupport, minConfidence, minLift],
    queryFn: async () => {
      const { data } = await axios.get(
        `http://localhost:8000/api/ml/association?min_support=${minSupport}&min_confidence=${minConfidence}&min_lift=${minLift}`
      );
      return data;
    },
    retry: false
  });

  const rules = data?.rules || [];
  const itemsets = data?.itemsets || [];
  const apiError = data?.error;

  const formatList = (val: any): string => {
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'string') return val;
    return val != null ? String(val) : '';
  };

  const topItemsets = itemsets.slice(0, 10).map((item: any) => ({
    ...item,
    label: formatList(item.items)
  }));

  const downloadCsv = () => {
    if (!rules.length) return;
    const header = 'Rule ID,Antecedent,Consequent,Support,Confidence,Lift\n';
    const csv = rules.map((r: any) => 
      `${r.id},"${formatList(r.antecedent)}","${formatList(r.consequent)}",${r.support.toFixed(4)},${r.confidence.toFixed(4)},${r.lift.toFixed(4)}`
    ).join('\n');
    
    const blob = new Blob([header + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'association_rules.csv';
    a.click();
  };

  const MetricExplanation = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 space-y-2 mb-6">
      <div className="font-bold flex items-center gap-2 text-blue-900"><Info className="h-4 w-4" /> Apriori Algorithm Metrics</div>
      <p><strong>Support:</strong> The fraction of total transactions that contain BOTH the antecedent and consequent. (How often this rule happens overall).</p>
      <p><strong>Confidence:</strong> The probability that a transaction contains the consequent GIVEN that it contains the antecedent. (How reliable the rule is).</p>
      <p><strong>Lift:</strong> The ratio of observed support to expected support if the two sets were independent. A lift &gt; 1 indicates a positive correlation (they appear together more often than by random chance).</p>
      <p className="text-xs italic mt-2 opacity-80">Note: These rules are mined from synthetically generated experimental data to demonstrate algorithm functionality. Do not interpret these as real-world clinical findings.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Association Rule Mining</h2>
          <p className="text-slate-500 text-sm mt-1">Discovering hidden patterns and itemsets using the Apriori algorithm</p>
        </div>
        <button 
          onClick={downloadCsv}
          disabled={!rules.length}
          className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors shadow-sm font-medium text-sm disabled:opacity-50"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <MetricExplanation />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT COLUMN: Controls & Rules Table */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-wrap gap-6 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Min Support ({minSupport.toFixed(2)})</label>
              <input type="range" min="0.01" max="0.5" step="0.01" value={minSupport} onChange={e => setMinSupport(parseFloat(e.target.value))} className="w-full accent-healthcare-600" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Min Confidence ({minConfidence.toFixed(2)})</label>
              <input type="range" min="0.1" max="1.0" step="0.05" value={minConfidence} onChange={e => setMinConfidence(parseFloat(e.target.value))} className="w-full accent-healthcare-600" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Min Lift ({minLift.toFixed(2)})</label>
              <input type="range" min="0.5" max="5.0" step="0.1" value={minLift} onChange={e => setMinLift(parseFloat(e.target.value))} className="w-full accent-healthcare-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h4 className="font-semibold text-slate-700">Discovered Rules ({rules.length})</h4>
              {data?.summary && <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">Max Lift: {data.summary.max_lift.toFixed(2)}</span>}
            </div>
            
            {isLoading ? (
               <div className="p-8 text-center text-slate-500">Mining rules...</div>
            ) : apiError ? (
              <div className="p-8 text-center text-red-500 flex flex-col items-center gap-2"><AlertTriangle className="h-8 w-8" /> {apiError}</div>
            ) : rules.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No rules found with current thresholds. Try lowering them.</div>
            ) : (
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs font-semibold text-slate-500 uppercase bg-slate-50 sticky top-0 shadow-sm">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Antecedent (If)</th>
                      <th className="px-4 py-3">Consequent (Then)</th>
                      <th className="px-4 py-3 text-right">Support</th>
                      <th className="px-4 py-3 text-right">Confidence</th>
                      <th className="px-4 py-3 text-right">Lift</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule: any) => (
                      <tr 
                        key={rule.id} 
                        onClick={() => setSelectedRule(rule)}
                        className={`border-b last:border-0 cursor-pointer transition-colors ${selectedRule?.id === rule.id ? 'bg-healthcare-50 border-healthcare-200' : 'hover:bg-slate-50'}`}
                      >
                        <td className="px-4 py-3 font-medium text-slate-500">{rule.id}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{formatList(rule.antecedent)}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{formatList(rule.consequent)}</td>
                        <td className="px-4 py-3 text-right">{rule.support.toFixed(3)}</td>
                        <td className="px-4 py-3 text-right text-healthcare-700 font-medium">{(rule.confidence * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right text-purple-700 font-bold">{rule.lift.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Visualizations */}
          {rules.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-700 mb-4 text-sm text-center">Support vs Confidence (Size = Lift)</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="support" name="Support" type="number" tick={{fontSize:11}} label={{value: 'Support', position: 'bottom', fontSize: 11}} />
                      <YAxis dataKey="confidence" name="Confidence" type="number" tick={{fontSize:11}} />
                      <ZAxis dataKey="lift" range={[50, 400]} name="Lift" />
                      <Tooltip cursor={{strokeDasharray: '3 3'}} formatter={(val: number, name: string) => [val.toFixed(3), name]} />
                      <Scatter name="Rules" data={rules} fill="#0ea5e9" opacity={0.6} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                <h4 className="font-semibold text-slate-700 mb-4 text-sm text-center">Top 10 Frequent Itemsets</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topItemsets} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{fontSize: 10}} />
                      <YAxis 
                        dataKey="label" 
                        type="category" 
                        width={120} 
                        tick={{fontSize: 9}} 
                        tickFormatter={(val) => {
                          const str = formatList(val);
                          return str.length > 20 ? str.substring(0, 20) + '...' : str;
                        }} 
                      />
                      <Tooltip formatter={(val: number) => val.toFixed(3)} labelFormatter={(lbl) => lbl} />
                      <Bar dataKey="support" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={15} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Detail Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm sticky top-6">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-slate-500" />
              <h4 className="font-semibold text-slate-700">Rule Details</h4>
            </div>
            <div className="p-5">
              {!selectedRule ? (
                <p className="text-sm text-slate-500 text-center py-10">Click on a rule in the table to view its detailed interpretation.</p>
              ) : (
                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rule {selectedRule.id}</span>
                    <div className="mt-3 space-y-3">
                      <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <span className="block text-xs font-semibold text-slate-500 mb-1">IF (Antecedent)</span>
                        <span className="font-medium text-slate-800">{formatList(selectedRule.antecedent)}</span>
                      </div>
                      <div className="flex justify-center text-slate-400"><TrendingUp className="h-5 w-5" /></div>
                      <div className="bg-healthcare-50 p-3 rounded border border-healthcare-200">
                        <span className="block text-xs font-semibold text-healthcare-600 mb-1">THEN (Consequent)</span>
                        <span className="font-bold text-healthcare-900">{formatList(selectedRule.consequent)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-600">Support</span>
                        <span className="text-sm font-bold text-slate-800">{(selectedRule.support * 100).toFixed(1)}%</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        This specific combination appears in {(selectedRule.support * 100).toFixed(1)}% of all patients in the dataset.
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-600">Confidence</span>
                        <span className="text-sm font-bold text-healthcare-700">{(selectedRule.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        When a patient has {formatList(selectedRule.antecedent)}, there is a {(selectedRule.confidence * 100).toFixed(1)}% probability they also have {formatList(selectedRule.consequent)}.
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-600">Lift</span>
                        <span className="text-sm font-bold text-purple-700">{selectedRule.lift.toFixed(2)}x</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        These factors occur together {selectedRule.lift.toFixed(2)} times more often than would be expected if they were completely unrelated.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
