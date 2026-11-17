import { Users, Activity, Stethoscope, Briefcase, AlertTriangle, Clock, DollarSign, UserCheck } from 'lucide-react';

interface KPIGridProps {
  data: any;
}

export default function KPIGrid({ data }: KPIGridProps) {
  const kpis = [
    { title: 'Total Patients', value: data.totalPatients?.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Visits', value: data.totalVisits?.toLocaleString(), icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Total Diagnoses', value: data.totalDiagnoses?.toLocaleString(), icon: Stethoscope, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Total Doctors', value: data.totalDoctors?.toLocaleString(), icon: Briefcase, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { title: 'Readmission Rate', value: `${(data.readmissionRate * 100).toFixed(1)}%`, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Avg Length of Stay', value: `${data.avgLengthOfStay} days`, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Avg Treatment Cost', value: `$${data.avgTreatmentCost?.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Average Age', value: data.avgAge, icon: UserCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div key={idx} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
            </div>
            <div className={`p-3 rounded-full ${kpi.bg} ${kpi.color}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
