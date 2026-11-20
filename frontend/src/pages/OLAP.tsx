import { useState } from 'react';
import { Layers, ListTree, Filter, Hash } from 'lucide-react';
import RollUp from '../components/olap/RollUp';
import DrillDown from '../components/olap/DrillDown';
import Slice from '../components/olap/Slice';
import Dice from '../components/olap/Dice';

const TABS = [
  { id: 'rollup', label: 'Roll-Up', icon: Layers, desc: 'Aggregate data from fine to coarse levels' },
  { id: 'drilldown', label: 'Drill-Down', icon: ListTree, desc: 'Navigate from coarse to detailed records' },
  { id: 'slice', label: 'Slice', icon: Filter, desc: 'Filter by a single dimension value' },
  { id: 'dice', label: 'Dice', icon: Hash, desc: 'Filter by multiple dimensions simultaneously' },
];

export default function OLAP() {
  const [activeTab, setActiveTab] = useState('rollup');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">OLAP Operations</h2>
        <p className="text-slate-500 text-sm mt-1">Interactive data cube analysis on the star schema</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all text-center ${
                isActive
                  ? 'border-healthcare-500 bg-healthcare-50 text-healthcare-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className={`h-8 w-8 mb-2 ${isActive ? 'text-healthcare-600' : 'text-slate-400'}`} />
              <span className="font-bold">{tab.label}</span>
              <span className="text-xs mt-1 opacity-80 hidden sm:block">{tab.desc}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {activeTab === 'rollup' && <RollUp />}
        {activeTab === 'drilldown' && <DrillDown />}
        {activeTab === 'slice' && <Slice />}
        {activeTab === 'dice' && <Dice />}
      </div>
    </div>
  );
}
