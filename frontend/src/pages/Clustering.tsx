import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend
} from 'recharts';
import { Users, Settings, Activity, BarChart2, Info, CheckSquare } from 'lucide-react';

const fetchClustering = async (payload: any) => {
  const { data } = await axios.post('http://localhost:8000/api/ml/clustering', payload);
  return data;
};

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

const AVAILABLE_FEATURES = [
  "Age", "BMI", "Glucose", "Blood Pressure", "Chronic Condition Count", "Treatment Cost"
];

export default function Clustering() {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(AVAILABLE_FEATURES);
  const [k, setK] = useState<number>(3);
  const [handleOutliers, setHandleOutliers] = useState<boolean>(false);

  const mutation = useMutation({
    mutationFn: fetchClustering,
  });

  React.useEffect(() => {
    mutation.mutate({ features: selectedFeatures, k, handle_outliers: handleOutliers });

  }, []);

  const handleRun = () => {
    mutation.mutate({ features: selectedFeatures, k, handle_outliers: handleOutliers });
  };

  const toggleFeature = (f: string) => {
    if (selectedFeatures.includes(f)) {
      if (selectedFeatures.length > 2) setSelectedFeatures(selectedFeatures.filter(x => x !== f));
    } else {
      setSelectedFeatures([...selectedFeatures, f]);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-lg text-sm">
          <p className="font-bold text-gray-900 mb-2 border-b pb-1">Patient: {data.id}</p>
          <p className="font-semibold text-indigo-600 mb-2">{data.Cluster}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {selectedFeatures.map(f => (
              <React.Fragment key={f}>
                <span className="text-gray-500">{f}:</span>
                <span className="text-gray-900 font-medium">{data[f] ? data[f].toFixed(1) : 'N/A'}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-600" />
            Patient Segmentation (K-Means)
          </h1>
          <p className="mt-2 text-gray-500">
            Group patients into meaningful segments using unsupervised learning.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-gray-500" />
              Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Clusters (K)</label>
                <input 
                  type="range" 
                  min="2" max="8" 
                  value={k} 
                  onChange={(e) => setK(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="text-center font-bold text-indigo-600 mt-1">{k}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                <div className="space-y-2">
                  {AVAILABLE_FEATURES.map(f => (
                    <label key={f} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        selectedFeatures.includes(f) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 group-hover:border-indigo-400'
                      }`}>
                        {selectedFeatures.includes(f) && <CheckSquare className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-sm text-gray-700">{f}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Select at least 2 features.</p>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={handleOutliers}
                    onChange={(e) => setHandleOutliers(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Handle Outliers</span>
                </label>
              </div>

              <button
                onClick={handleRun}
                disabled={mutation.isPending}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors disabled:opacity-50"
              >
                {mutation.isPending ? 'Running...' : 'Run Segmentation'}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-blue-800">
            <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              <span className="font-semibold">Note:</span> We use neutral labels (Cluster 0, Cluster 1, etc.) to avoid assigning clinical meanings unless supported by rigorous data analysis.
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">

          {mutation.isPending && !mutation.data && (
            <div className="h-96 bg-white rounded-2xl border border-gray-100 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <Activity className="h-10 w-10 text-indigo-500 animate-pulse mb-4" />
                <p className="text-indigo-600 font-medium">Clustering Patients...</p>
              </div>
            </div>
          )}

          {mutation.data && !mutation.data.error && (
            <>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Elbow Method (Inertia)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mutation.data.metrics}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="k" tick={{fontSize: 12}} label={{ value: 'K (Clusters)', position: 'insideBottom', offset: -5, fontSize: 12 }} />
                        <YAxis tick={{fontSize: 12}} width={45} />
                        <Tooltip />
                        <Line type="monotone" dataKey="inertia" stroke="#4F46E5" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Silhouette Score</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mutation.data.metrics}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="k" tick={{fontSize: 12}} label={{ value: 'K (Clusters)', position: 'insideBottom', offset: -5, fontSize: 12 }} />
                        <YAxis tick={{fontSize: 12}} domain={['dataMin - 0.05', 'dataMax + 0.05']} />
                        <Tooltip />
                        <Line type="monotone" dataKey="silhouette" stroke="#10B981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <BarChart2 className="h-5 w-5 text-indigo-500" />
                      2D PCA Visualization
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Explained Variance: PC1 ({(mutation.data.pca_variance[0]*100).toFixed(1)}%), PC2 ({(mutation.data.pca_variance[1]*100).toFixed(1)}%)
                    </p>
                  </div>
                </div>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" dataKey="PC1" name="PC1" tick={{fontSize: 12}} />
                      <YAxis type="number" dataKey="PC2" name="PC2" tick={{fontSize: 12}} />
                      <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

                      {mutation.data.profiles.map((profile: any, idx: number) => (
                        <Scatter 
                          key={profile.name}
                          name={profile.name} 
                          data={mutation.data.scatter_data.filter((d: any) => d.Cluster === profile.name)} 
                          fill={COLORS[idx % COLORS.length]} 
                        />
                      ))}
                      <Legend />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Cluster Characteristics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mutation.data.profiles.map((profile: any, idx: number) => (
                    <div key={profile.name} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="h-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-gray-900 text-lg">{profile.name}</h4>
                          <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                            n={profile.size}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {selectedFeatures.map(f => (
                            <div key={f} className="flex justify-between items-center text-sm">
                              <span className="text-gray-500">{f}</span>
                              <span className="font-medium text-gray-900">{profile.means[f].toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {mutation.data?.error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
              {mutation.data.error}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
