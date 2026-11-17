import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

export default function ErrorBoundary() {
  const error = useRouteError();

  let title = 'Something went wrong';
  let message = 'An unexpected error occurred. Please try returning to the dashboard.';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = '404 - Page Not Found';
      message = "The page you are looking for doesn't exist or has been removed.";
    } else {
      title = `${error.status} - ${error.statusText}`;
      message = error.data?.message || message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
        <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">{message}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm"
          >
            <Home className="h-4 w-4" /> Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

