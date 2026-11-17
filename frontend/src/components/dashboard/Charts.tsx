import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const PIE_COLORS = ['#ef4444', '#10b981'];

export function TrendChart({ data, title }: { data: any[], title: string }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm col-span-2">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
            <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Line type="monotone" dataKey="admissions" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, fill: '#0ea5e9'}} activeDot={{r: 6}} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ReadmissionPie({ data }: { data: any[] }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Readmission Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DiagnosisBar({ data }: { data: any[] }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm col-span-2">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Diagnosis Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px' }} />
            <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ForecastChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm col-span-2">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Admission Forecast</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
            <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="actual" name="Historical" barSize={20} fill="#0ea5e9" radius={[4,4,0,0]} />
            <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#f59e0b" strokeWidth={3} strokeDasharray="5 5" dot={{r: 4}} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PCAScatter({ data }: { data: any[] }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Patient Segmentation (K-Means PCA)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="pca1" name="PCA 1" tickLine={false} axisLine={false} />
            <YAxis type="number" dataKey="pca2" name="PCA 2" tickLine={false} axisLine={false} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Patients" data={data} fill="#10b981" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
