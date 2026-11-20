import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Play, Database, Server, CheckCircle, XCircle, AlertTriangle, Clock, Download } from 'lucide-react';

export default function ETLPipeline() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pipeline');

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['etlHistory'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:8000/api/etl/history');
      return data;
    }
  });

  const runETL = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post('http://localhost:8000/api/etl/run');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['etlHistory'] });
    }
  });

  const latestRun = runETL.data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ETL Pipeline</h2>
          <p className="text-slate-500 text-sm mt-1">Extract, Transform, and Load process management</p>
        </div>
        <button 
          onClick={() => runETL.mutate()}
          disabled={runETL.isPending}
          className="flex items-center gap-2 bg-healthcare-600 text-white px-5 py-2.5 rounded-md hover:bg-healthcare-700 transition-colors shadow-sm font-medium disabled:opacity-50"
        >
          {runETL.isPending ? <Clock className="animate-spin h-5 w-5" /> : <Play className="h-5 w-5" />}
          {runETL.isPending ? 'Running Pipeline...' : 'Run Full ETL'}
        </button>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`${activeTab === 'pipeline' ? 'border-healthcare-500 text-healthcare-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pipeline Execution
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`${activeTab === 'history' ? 'border-healthcare-500 text-healthcare-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Run History
          </button>
        </nav>
      </div>

      {activeTab === 'pipeline' && (
        <div className="space-y-6">

          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Execution Stages</h3>
            <div className="flex items-center justify-between text-center relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 -translate-y-1/2"></div>
              {['Extract', 'Profile', 'Clean', 'Transform', 'Validate', 'Load'].map((stage, idx) => (
                <div key={stage} className="flex flex-col items-center bg-white px-2">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 mb-2 ${
                    runETL.isSuccess ? 'border-green-500 bg-green-50 text-green-600' : 
                    runETL.isPending ? 'border-blue-500 bg-blue-50 text-blue-600 animate-pulse' : 
                    'border-slate-300 bg-slate-50 text-slate-400'
                  }`}>
                    {runETL.isSuccess ? <CheckCircle className="h-6 w-6" /> : <Server className="h-5 w-5" />}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{stage}</span>
                </div>
              ))}
            </div>
          </div>

          {latestRun && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Execution Summary</h3>
                  <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase">Success</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-sm text-slate-500">Rows Extracted</p>
                    <p className="text-2xl font-bold text-slate-800">{latestRun.metrics.extracted}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-sm text-slate-500">Rows Cleaned</p>
                    <p className="text-2xl font-bold text-slate-800">{latestRun.metrics.cleaned}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-sm text-slate-500">Rows Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{latestRun.metrics.rejected}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-sm text-slate-500">Rows Loaded</p>
                    <p className="text-2xl font-bold text-green-600">{latestRun.metrics.loaded}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center text-sm text-slate-500">
                  <span>Duration: {latestRun.metrics.duration_seconds.toFixed(2)}s</span>
                  <button className="flex items-center gap-1 text-healthcare-600 hover:text-healthcare-800 font-medium">
                    <Download className="h-4 w-4" /> Download Cleaned Dataset
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Data Quality Report</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Missing Values Found</p>
                      <p className="text-xs text-slate-500">Insurance Type: {latestRun.data_quality.missing_values.insurance_type}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Invalid Categorical Values Dropped</p>
                      <p className="text-xs text-slate-500">ICD Codes: {latestRun.data_quality.invalid_categorical}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Duplicates Removed</p>
                      <p className="text-xs text-slate-500">Total: {latestRun.data_quality.duplicate_count}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Run ID</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Processed</th>
              </tr>
            </thead>
            <tbody>
              {historyLoading ? (
                <tr><td colSpan={4} className="text-center py-8">Loading history...</td></tr>
              ) : history?.map((run: any) => (
                <tr key={run.run_id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">#{run.run_id}</td>
                  <td className="px-6 py-4">{new Date(run.start_time).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${run.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">{run.records_processed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
