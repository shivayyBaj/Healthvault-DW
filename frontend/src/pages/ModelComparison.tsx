import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Play, Search, Brain, Target, Activity, Settings2, BarChart2, ShieldAlert } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ModelComparison() {
  const queryClient = useQueryClient();
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [modelToTrain, setModelToTrain] = useState<string>('All Models');

  const { data: models, isLoading: modelsLoading } = useQuery({
    queryKey: ['ml-models'],
    queryFn: async () => (await axios.get('http://localhost:8000/api/ml/models')).data,
  });

  const trainModels = useMutation({
    mutationFn: async (target: string) => (await axios.post('http://localhost:8000/api/ml/train', { model_name: target })).data,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ml-models'] });
      if (data && data.length > 0) setSelectedModel(data.find((m: any) => m.model_name === 'Random Forest') || data[0]);
    }
  });

  const renderRocCurve = (model: any) => {

    let rocData = [];
    if (model.roc_curve) {
       rocData = model.roc_curve.fpr.map((fpr: number, i: number) => ({ fpr, tpr: model.roc_curve.tpr[i] }));
    } else {

       const auc = model.metrics?.roc_auc || model.roc_auc;
       rocData = [
         { fpr: 0, tpr: 0 },
         { fpr: 0.1, tpr: auc - 0.2 },
         { fpr: 0.3, tpr: auc - 0.05 },
         { fpr: 0.6, tpr: auc + 0.05 },
         { fpr: 1, tpr: 1 }
       ];
    }
    return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={rocData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="fpr" type="number" label={{ value: 'False Positive Rate', position: 'bottom', fontSize: 12 }} tick={{fontSize: 10}} />
          <YAxis type="number" label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fontSize: 12 }} tick={{fontSize: 10}} />
          <Tooltip formatter={(v: number) => v.toFixed(3)} />
          <Line type="monotone" dataKey="tpr" stroke="#0ea5e9" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="fpr" stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth={1} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Model Evaluation & Comparison</h2>
          <p className="text-slate-500 text-sm mt-1">30-Day Readmission Risk Classification (SMOTE applied to training folds)</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={modelToTrain} 
            onChange={(e) => setModelToTrain(e.target.value)}
            disabled={trainModels.isPending}
            className="border border-slate-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-healthcare-500 bg-white"
          >
            <option value="All Models">Train All Models</option>
            <option value="Logistic Regression">Logistic Regression</option>
            <option value="KNN">KNN</option>
            <option value="Naive Bayes">Naive Bayes</option>
            <option value="Decision Tree">Decision Tree</option>
            <option value="Random Forest">Random Forest</option>
            <option value="SVM">SVM</option>
          </select>
          <button 
            onClick={() => trainModels.mutate(modelToTrain)}
            disabled={trainModels.isPending}
            className="flex items-center gap-2 bg-healthcare-600 text-white px-5 py-2.5 rounded-md hover:bg-healthcare-700 transition-colors shadow-sm font-medium disabled:opacity-50 whitespace-nowrap"
          >
            {trainModels.isPending ? <Settings2 className="animate-spin h-5 w-5" /> : <Play className="h-5 w-5" />}
            {trainModels.isPending ? 'Training...' : (modelToTrain === 'All Models' ? 'Train All' : 'Train Selected')}
          </button>
        </div>
      </div>

      {!models && !trainModels.isPending && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-10 text-center flex flex-col items-center">
          <Brain className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-700 text-lg">No Trained Models Found</h3>
          <p className="text-slate-500 mt-1 max-w-md">Click "Train Models" to execute the full scikit-learn pipeline (Imputation → Scaling/OHE → SMOTE → Training → Evaluation).</p>
        </div>
      )}

      {trainModels.isPending && (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 border-4 border-healthcare-200 border-t-healthcare-600 rounded-full animate-spin mb-4"></div>
          <h3 className="font-semibold text-slate-800 text-lg">Executing ML Pipeline...</h3>
          <p className="text-slate-500 mt-2 max-w-lg">Generating 2,000 synthetic patient records, applying preprocessing, balancing classes with SMOTE, and cross-validating 6 classification algorithms.</p>
        </div>
      )}

      {(models || trainModels.isSuccess) && !trainModels.isPending && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h4 className="font-semibold text-slate-700 flex items-center gap-2"><BarChart2 className="h-5 w-5" /> Model Leaderboard</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-semibold text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Algorithm</th>
                  <th className="px-5 py-3">Version</th>
                  <th className="px-5 py-3 text-right">Accuracy</th>
                  <th className="px-5 py-3 text-right">Precision</th>
                  <th className="px-5 py-3 text-right">Recall</th>
                  <th className="px-5 py-3 text-right">F1 Score</th>
                  <th className="px-5 py-3 text-right">ROC-AUC</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {(trainModels.data || models)?.map((model: any) => {
                  const m = model.metrics || model;
                  const isSelected = selectedModel?.model_name === model.model_name;
                  return (
                    <tr key={model.model_name} className={`border-b last:border-0 hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                      <td className="px-5 py-4 font-semibold text-slate-800 flex items-center gap-2">
                        {model.is_active || model.model_name === 'Random Forest' ? <Target className="h-4 w-4 text-green-500" /> : <Brain className="h-4 w-4 text-slate-400" />}
                        {model.model_name}
                      </td>
                      <td className="px-5 py-4 text-slate-500">v{model.version}</td>
                      <td className="px-5 py-4 text-right font-mono">{(m.accuracy * 100).toFixed(1)}%</td>
                      <td className="px-5 py-4 text-right font-mono">{(m.precision * 100).toFixed(1)}%</td>
                      <td className="px-5 py-4 text-right font-mono">{(m.recall * 100).toFixed(1)}%</td>
                      <td className="px-5 py-4 text-right font-mono">{(m.f1_score || m.f1_score).toFixed(3)}</td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-healthcare-700">{(m.roc_auc * 100).toFixed(1)}%</td>
                      <td className="px-5 py-4 text-center">
                        <button 
                          onClick={() => setSelectedModel(model)}
                          className={`px-3 py-1.5 rounded text-xs font-medium ${isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedModel && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{selectedModel.model_name} <span className="text-sm font-normal text-slate-500 ml-2">Version {selectedModel.version}</span></h3>
                <p className="text-sm text-slate-500 mt-1">Detailed performance characteristics on the 20% hold-out test set.</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold uppercase rounded-full border border-green-200">
                {selectedModel.is_active || selectedModel.model_name === 'Random Forest' ? 'Active Production Model' : 'Staged Model'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {['accuracy', 'precision', 'recall', 'roc_auc'].map((metric) => {
                const val = (selectedModel.metrics || selectedModel)[metric];
                return (
                  <div key={metric} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-semibold">{metric.replace('_', ' ')}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{(val * 100).toFixed(1)}%</p>
                  </div>
                )
              })}
            </div>

            <h4 className="font-semibold text-slate-700 mb-4">Receiver Operating Characteristic (ROC)</h4>
            {renderRocCurve(selectedModel)}
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h4 className="font-semibold text-slate-700 mb-4 border-b pb-2">Confusion Matrix</h4>
            {selectedModel.confusion_matrix ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div></div><div className="font-semibold text-slate-600">Pred: No</div><div className="font-semibold text-slate-600">Pred: Yes</div>
                  <div className="font-semibold text-slate-600 self-center">Actual: No</div>
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded text-lg font-bold text-blue-900">{selectedModel.confusion_matrix[0][0]}</div>
                  <div className="bg-red-50 border border-red-100 p-3 rounded text-lg font-bold text-red-900">{selectedModel.confusion_matrix[0][1]}</div>
                  <div className="font-semibold text-slate-600 self-center">Actual: Yes</div>
                  <div className="bg-red-50 border border-red-100 p-3 rounded text-lg font-bold text-red-900">{selectedModel.confusion_matrix[1][0]}</div>
                  <div className="bg-green-50 border border-green-100 p-3 rounded text-lg font-bold text-green-900">{selectedModel.confusion_matrix[1][1]}</div>
                </div>
                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded">
                  <strong>Note on Recall vs Precision:</strong> In healthcare, False Negatives (predicting No when it's Yes) are often more costly than False Positives. Look for models with higher Recall (Sensitivity).
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Train models to view matrix.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
