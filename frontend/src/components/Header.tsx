import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Moon, Sun, Database, Server, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import axios from 'axios';

export default function Header() {
  const location = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {

    const checkStatus = async () => {
      try {
        await axios.get('http://localhost:8000/api/health', { timeout: 2000 });
        setApiStatus('online');
      } catch (e) {
        setApiStatus('offline');
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');

    if (theme === 'light') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentPath = pathParts.length > 0 ? pathParts[0] : 'dashboard';

  const titleMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'warehouse': 'Data Warehouse',
    'etl': 'ETL & Data Quality',
    'olap': 'OLAP Cube',
    'statistics': 'Statistics',
    'association-rules': 'Association Rules',
    'clustering': 'Patient Segmentation',
    'prediction': 'Readmission Prediction',
    'model-comparison': 'Model Comparison',
    'explainability': 'Explainable AI',
    'forecasting': 'Time-Series Forecasting',
    'datasets': 'Dataset Explorer'
  };

  const pageTitle = titleMap[currentPath] || 'HealthVault DW';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">

      <div className="flex flex-col justify-center">
        <nav className="flex text-xs text-gray-500 mb-0.5" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1">
            <li className="inline-flex items-center">
              <span className="text-gray-400">HealthVault</span>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="h-3 w-3 text-gray-400 mx-1" />
                <span className="font-medium text-gray-600 capitalize">{currentPath.replace('-', ' ')}</span>
              </div>
            </li>
          </ol>
        </nav>
        <h1 className="text-lg font-bold text-gray-900 leading-tight">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4">

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50">
          <Database className="h-4 w-4 text-indigo-500" />
          <span className="text-xs font-medium text-gray-700">Active: <span className="font-bold">Synthetic Core</span></span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50" title="Backend API Status">
          <Server className="h-4 w-4 text-gray-500" />
          {apiStatus === 'online' ? (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> Online
            </span>
          ) : apiStatus === 'offline' ? (
            <span className="flex items-center gap-1 text-xs font-bold text-red-600">
              <XCircle className="h-3.5 w-3.5" /> Offline
            </span>
          ) : (
            <span className="text-xs font-bold text-amber-500">Checking...</span>
          )}
        </div>

        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

      </div>
    </header>
  );
}
