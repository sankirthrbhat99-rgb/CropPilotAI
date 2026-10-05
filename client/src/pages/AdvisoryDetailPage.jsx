import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { advisoriesApi } from '../services/api';
import AdvisoryResult from '../components/AdvisoryResult';
import Spinner from '../components/Spinner';
import {
  ArrowLeft,
  Sparkles,
  Printer,
  History,
  Wheat,
  Share2
} from 'lucide-react';

export const AdvisoryDetailPage = () => {
  const { id } = useParams();

  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdvisory = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await advisoriesApi.getById(id);
        setAdvisory(res.data);
      } catch (err) {
        console.error('Failed to load advisory:', err);
        setError(err.message || 'Failed to fetch advisory diagnosis');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisory();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner text="Loading advisory diagnosis dossier..." />
      </div>
    );
  }

  if (error || !advisory) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="p-4 rounded-xl bg-red-50 text-red-700 max-w-md mx-auto text-sm">
          {error || 'Advisory report not found'}
        </div>
        <Link
          to="/advisories"
          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Advisories Archive
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Link to="/advisories" className="hover:text-emerald-700 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Advisories
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-[200px]">
            {advisory.condition_name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
          <Link
            to="/advisor"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            New Advisory
          </Link>
        </div>
      </div>

      {/* Main Advisory Result Component */}
      <AdvisoryResult advisory={advisory} />
    </div>
  );
};

export default AdvisoryDetailPage;
