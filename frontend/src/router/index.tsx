import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import Dashboard from '../pages/Dashboard';
import ETLPipeline from '../pages/ETLPipeline';
import Warehouse from '../pages/Warehouse';
import OLAP from '../pages/OLAP';
import Statistics from '../pages/Statistics';
import AssociationRules from '../pages/AssociationRules';
import ModelComparison from '../pages/ModelComparison';
import Prediction from '../pages/Prediction';
import Explainability from '../pages/Explainability';
import Clustering from '../pages/Clustering';
import Forecasting from '../pages/Forecasting';
import Datasets from '../pages/Datasets';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },

      { path: 'warehouse', element: <Warehouse /> },
      { path: 'etl', element: <ETLPipeline /> },
      { path: 'olap', element: <OLAP /> },
      { path: 'statistics', element: <Statistics /> },
      { path: 'association-rules', element: <AssociationRules /> },
      { path: 'clustering', element: <Clustering /> },
      { path: 'prediction', element: <Prediction /> },
      { path: 'model-comparison', element: <ModelComparison /> },
      { path: 'explainability', element: <Explainability /> },
      { path: 'forecasting', element: <Forecasting /> },
      { path: 'datasets', element: <Datasets /> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ]
  }
]);
