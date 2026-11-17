import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Activity, 
  BarChart2, 
  Network, 
  ScatterChart, 
  Stethoscope, 
  Scale, 
  LineChart, 
  TrendingUp, 
  Settings,
  Info,
  ServerCog
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Data Warehouse', path: '/warehouse', icon: Database },
  { name: 'ETL & Data Quality', path: '/etl', icon: ServerCog },
  { name: 'OLAP', path: '/olap', icon: BarChart2 },
  { name: 'Statistics', path: '/statistics', icon: Scale },
  { name: 'Association Rules', path: '/association-rules', icon: Network },
  { name: 'Clustering', path: '/clustering', icon: ScatterChart },
  { name: 'Prediction', path: '/prediction', icon: Stethoscope },
  { name: 'Model Comparison', path: '/model-comparison', icon: Settings },
  { name: 'Explainability', path: '/explainability', icon: Info },
  { name: 'Forecasting', path: '/forecasting', icon: TrendingUp },
  { name: 'WEKA', path: '/weka', icon: LineChart },
  { name: 'Datasets', path: '/datasets', icon: Database },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
        <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
          <Activity className="text-indigo-500 h-5 w-5" />
          HealthVault <span className="text-indigo-500">DW</span>
        </h1>
      </div>
      <div className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                    isActive 
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                  }`
                }
              >
                <Icon className={`h-4 w-4 ${item.path === '/prediction' ? 'opacity-80' : ''}`} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
