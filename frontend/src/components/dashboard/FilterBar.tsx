import { Filter, Calendar, Users, Activity, Briefcase } from 'lucide-react';

export default function FilterBar() {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2 text-slate-700 font-medium mr-4">
        <Filter className="h-5 w-5" />
        <span>Filters:</span>
      </div>
      
      <select className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-healthcare-500 outline-none">
        <option value="">All Dates</option>
        <option value="last30">Last 30 Days</option>
        <option value="last90">Last 90 Days</option>
        <option value="ytd">Year to Date</option>
      </select>

      <select className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-healthcare-500 outline-none">
        <option value="">All Genders</option>
        <option value="M">Male</option>
        <option value="F">Female</option>
      </select>

      <select className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-healthcare-500 outline-none">
        <option value="">All Age Groups</option>
        <option value="0-18">0-18</option>
        <option value="19-35">19-35</option>
        <option value="36-50">36-50</option>
        <option value="51-70">51-70</option>
        <option value="71+">71+</option>
      </select>
      
      <select className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-healthcare-500 outline-none">
        <option value="">All Departments</option>
        <option value="Cardiology">Cardiology</option>
        <option value="Endocrinology">Endocrinology</option>
        <option value="Neurology">Neurology</option>
      </select>
    </div>
  );
}
