import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-sm">
        <Sprout className="w-8 h-8" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
        404 - Page Not Found
      </h1>
      <p className="mt-3 text-slate-600 max-w-md text-sm sm:text-base">
        The field, crop, or agronomic record you are looking for does not exist or has been relocated.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
        >
          <Home className="w-4 h-4" />
          Home
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
