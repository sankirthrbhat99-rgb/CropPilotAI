import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cropsApi } from '../services/api';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import {
  Wheat,
  Calendar,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Layers,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock
} from 'lucide-react';

export const CropDetailPage = () => {
  const { id } = useParams();

  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCrop = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await cropsApi.getById(id);
      setCrop(res.data);
    } catch (err) {
      console.error('Failed to load crop details:', err);
      setError(err.message || 'Failed to fetch crop data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrop();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner text="Loading crop diagnostics & advisory history..." />
      </div>
    );
  }

  if (error || !crop) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="p-4 rounded-xl bg-red-50 text-red-700 max-w-md mx-auto text-sm">
          {error || 'Crop not found'}
        </div>
        <Link
          to="/crops"
          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Crops
        </Link>
      </div>
    );
  }

  const advisories = crop.advisories || [];

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
        <Link to="/crops" className="hover:text-emerald-700">Crops</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{crop.name}</span>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              crop.status === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' :
              crop.status === 'Warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                crop.status === 'Critical' ? 'bg-red-500' :
                crop.status === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              {crop.status}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              Stage: {crop.growth_stage}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {crop.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm text-slate-600">
            {crop.fields && (
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                Plot: {crop.fields.name}
                {crop.fields.farms?.name && ` (${crop.fields.farms.name})`}
              </span>
            )}
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              Planted: {crop.planting_date ? new Date(crop.planting_date).toLocaleDateString() : 'Unspecified'}
            </span>
          </div>
        </div>

        <div>
          <Link
            to={`/advisor?crop_id=${crop.id}`}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Request AI Advisory
          </Link>
        </div>
      </div>

      {/* Advisory History Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Diagnostic & Advisory History ({advisories.length})
            </h2>
          </div>
        </div>

        {advisories.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No Past Advisories for this Crop"
            description="If you notice yellow spots, wilt, powdery mildew, or pest activity, submit a consultation to Google Gemini."
            actionLabel="Run First Advisory for this Crop"
            onAction={() => window.location.href = `/advisor?crop_id=${crop.id}`}
          />
        ) : (
          <div className="space-y-3">
            {advisories.map((adv) => (
              <Link
                key={adv.id}
                to={`/advisories/${adv.id}`}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                      adv.severity === 'Critical' ? 'bg-red-50 text-red-700 border border-red-200' :
                      adv.severity === 'High' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      adv.severity === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {adv.severity}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {adv.condition_name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">
                    <strong className="text-slate-700">Symptoms:</strong> {adv.symptoms}
                  </p>

                  <div className="text-[11px] text-slate-600">
                    Consultation recorded {new Date(adv.created_at).toLocaleDateString()} at {new Date(adv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 group-hover:text-emerald-700 shrink-0">
                  Review Diagnostic Report
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CropDetailPage;
