import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { advisoriesApi } from '../services/api';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import {
  Sparkles,
  History,
  Search,
  Filter,
  ArrowRight,
  Wheat,
  Calendar,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';

const SEVERITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];

export const AdvisoriesPage = () => {
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('All');

  const fetchAdvisories = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await advisoriesApi.getAll();
      setAdvisories(res.data || []);
    } catch (err) {
      console.error('Failed to load advisories:', err);
      setError(err.message || 'Failed to fetch advisory records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisories();
  }, []);

  const filteredAdvisories = advisories.filter((adv) => {
    const matchesSearch =
      adv.condition_name?.toLowerCase().includes(search.toLowerCase()) ||
      adv.symptoms?.toLowerCase().includes(search.toLowerCase()) ||
      (adv.crops?.name && adv.crops.name.toLowerCase().includes(search.toLowerCase()));

    const matchesSeverity = selectedSeverity === 'All' || adv.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return { bg: 'bg-red-50 text-red-700 border-red-200', icon: AlertOctagon };
      case 'High':
        return { bg: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertTriangle };
      case 'Medium':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Info };
      case 'Low':
      default:
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
            <History className="w-3.5 h-3.5" />
            Agronomic Archive
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Advisory History & Diagnoses
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
            Review past artificial intelligence assessments, recommendations, and mitigation outcomes.
          </p>
        </div>

        <Link
          to="/advisor"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          Request New Advisory
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by diagnosed condition, crop name, or symptoms..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Severity:
          </span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {SEVERITIES.map((sev) => (
              <option key={sev} value={sev}>{sev}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner text="Loading advisory history records..." />
        </div>
      ) : filteredAdvisories.length === 0 ? (
        <EmptyState
          icon={History}
          title={search || selectedSeverity !== 'All' ? "No matching advisories found" : "No advisories recorded yet"}
          description={search ? "Adjust your search terms or severity filter." : "Request your first AI diagnostic to begin building your farm's advisory archive."}
          actionLabel={search ? "Clear Filter" : "Consult AI Advisor"}
          onAction={search ? () => { setSearch(''); setSelectedSeverity('All'); } : () => window.location.href = '/advisor'}
        />
      ) : (
        <div className="space-y-4">
          {filteredAdvisories.map((adv) => {
            const badge = getSeverityBadge(adv.severity);
            const BadgeIcon = badge.icon;

            return (
              <Link
                key={adv.id}
                to={`/advisories/${adv.id}`}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border ${badge.bg}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      {adv.severity}
                    </span>

                    {adv.crops?.name && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center gap-1">
                        <Wheat className="w-3 h-3 text-emerald-600" />
                        {adv.crops.name} ({adv.crops.growth_stage})
                      </span>
                    )}

                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(adv.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {adv.condition_name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                    <strong className="text-slate-800">Reported Symptoms:</strong> {adv.symptoms}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 group-hover:text-emerald-700 shrink-0 self-end md:self-center">
                  View Full Advisory Report
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdvisoriesPage;
