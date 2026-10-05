import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  farmsApi,
  fieldsApi,
  cropsApi,
  advisoriesApi
} from '../services/api';
import Spinner from '../components/Spinner';
import FarmCard from '../components/FarmCard';
import CropCard from '../components/CropCard';
import EmptyState from '../components/EmptyState';
import {
  Sprout,
  MapPin,
  Layers,
  Wheat,
  Sparkles,
  History,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Activity
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();

  const [farms, setFarms] = useState([]);
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [farmsRes, fieldsRes, cropsRes, advisoriesRes] = await Promise.all([
        farmsApi.getAll(),
        fieldsApi.getAll(),
        cropsApi.getAll(),
        advisoriesApi.getAll()
      ]);

      setFarms(farmsRes.data || []);
      setFields(fieldsRes.data || []);
      setCrops(cropsRes.data || []);
      setAdvisories(advisoriesRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const criticalOrWarningCrops = crops.filter(
    (c) => c.status === 'Critical' || c.status === 'Warning'
  );

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" text="Loading farm telemetry and agronomy data..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-sm mb-3">
            <Sprout className="w-3.5 h-3.5" />
            Farmer Telemetry Hub
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Farmer'}!
          </h1>
          <p className="mt-1 text-emerald-100 text-sm max-w-xl">
            Monitor farm hierarchy, oversee crop growth cycles, and run real-time Google Gemini diagnostic advisories.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Link
            to="/advisor"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-900 font-extrabold text-sm shadow-md hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Run AI Advisory
          </Link>
          <Link
            to="/farms"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-900/60 text-white font-semibold text-sm border border-emerald-400/30 hover:bg-emerald-900 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Manage Farms
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchDashboardData}
            className="text-xs font-bold underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Farms</span>
            <span className="text-2xl font-black text-slate-900">{farms.length}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Fields</span>
            <span className="text-2xl font-black text-slate-900">{fields.length}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Wheat className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Registered Crops</span>
            <span className="text-2xl font-black text-slate-900">{crops.length}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">AI Advisories</span>
            <span className="text-2xl font-black text-slate-900">{advisories.length}</span>
          </div>
        </div>
      </div>

      {/* Critical Crops Alert Callout (if any) */}
      {criticalOrWarningCrops.length > 0 && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                {criticalOrWarningCrops.length} {criticalOrWarningCrops.length === 1 ? 'Crop' : 'Crops'} require agronomic attention
              </h4>
              <p className="text-xs text-amber-800">
                You have crops flagged as Warning or Critical. Review their advisory diagnosis or request a new AI evaluation.
              </p>
            </div>
          </div>
          <Link
            to="/crops"
            className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-900 bg-amber-200/80 hover:bg-amber-200 px-4 py-2 rounded-xl transition-colors shrink-0"
          >
            Review Affected Crops
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Farms Overview Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Your Farms</h2>
          </div>
          <Link
            to="/farms"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View All Farms ({farms.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {farms.length === 0 ? (
          <EmptyState
            title="No Farms Created Yet"
            description="Start by creating your first farm property to establish your field and crop hierarchy."
            actionLabel="Add First Farm"
            onAction={() => window.location.href = '/farms'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.slice(0, 3).map((farm) => (
              <FarmCard key={farm.id} farm={farm} />
            ))}
          </div>
        )}
      </section>

      {/* Active Crops Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wheat className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Registered Crops</h2>
          </div>
          <Link
            to="/crops"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View All Crops ({crops.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {crops.length === 0 ? (
          <EmptyState
            icon={Wheat}
            title="No Crops Registered Yet"
            description="Create fields within your farms to start tracking and diagnosing crops."
            actionLabel="Go to Farms"
            onAction={() => window.location.href = '/farms'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.slice(0, 3).map((crop) => (
              <CropCard key={crop.id} crop={crop} />
            ))}
          </div>
        )}
      </section>

      {/* Recent AI Advisories Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Recent AI Crop Advisories</h2>
          </div>
          <Link
            to="/advisories"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            All Advisories ({advisories.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {advisories.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No AI Advisories Generated Yet"
            description="When crop symptoms arise, select a crop and ask Gemini Agronomist for immediate diagnosis and treatment."
            actionLabel="Request First AI Advisory"
            onAction={() => window.location.href = '/advisor'}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-sm">
            {advisories.slice(0, 5).map((adv) => (
              <Link
                key={adv.id}
                to={`/advisories/${adv.id}`}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${
                    adv.severity === 'Critical' ? 'bg-red-500' :
                    adv.severity === 'High' ? 'bg-orange-500' :
                    adv.severity === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {adv.condition_name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                      <span>Crop: <strong>{adv.crops?.name || 'Unknown'}</strong></span>
                      <span>•</span>
                      <span>{new Date(adv.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                    adv.severity === 'Critical' ? 'bg-red-50 text-red-700 border border-red-200' :
                    adv.severity === 'High' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                    adv.severity === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {adv.severity}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
