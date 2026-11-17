interface ModelTableProps {
  data: any[];
}

export default function ModelTable({ data }: ModelTableProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden col-span-2">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">Readmission Classification Models</h3>
        <p className="text-sm text-slate-500">Performance metrics across trained algorithms</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">Model</th>
              <th className="px-6 py-3 text-right">Accuracy</th>
              <th className="px-6 py-3 text-right">F1 Score</th>
              <th className="px-6 py-3 text-right">ROC-AUC</th>
              <th className="px-6 py-3 text-right">Precision</th>
              <th className="px-6 py-3 text-right">Recall</th>
            </tr>
          </thead>
          <tbody>
            {data.map((model, idx) => (
              <tr key={idx} className="bg-white border-b hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{model.model}</td>
                <td className="px-6 py-4 text-right">{(model.accuracy * 100).toFixed(1)}%</td>
                <td className="px-6 py-4 text-right">{(model.f1 * 100).toFixed(1)}%</td>
                <td className="px-6 py-4 text-right">{(model.roc_auc * 100).toFixed(1)}%</td>
                <td className="px-6 py-4 text-right">{(model.precision * 100).toFixed(1)}%</td>
                <td className="px-6 py-4 text-right">{(model.recall * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
