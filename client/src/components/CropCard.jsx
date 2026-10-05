import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wheat,
  Calendar,
  Sparkles,
  ArrowRight,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon
} from 'lucide-react';

export const CropCard = ({ crop, onEdit, onDelete }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Critical':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          icon: AlertOctagon,
          dot: 'bg-red-500'
        };
      case 'Warning':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: AlertTriangle,
          dot: 'bg-amber-500'
        };
      case 'Healthy':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: CheckCircle2,
          dot: 'bg-emerald-500'
        };
    }
  };

  const statusConfig = getStatusBadge(crop.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                {crop.status || 'Healthy'}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {crop.growth_stage}
              </span>
            </div>

            <Link
              to={`/crops/${crop.id}`}
              className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1"
            >
              {crop.name}
            </Link>

            {crop.fields && (
              <div className="text-xs text-slate-600 mt-0.5">
                Field: <span className="font-semibold text-slate-700">{crop.fields.name}</span>
                {crop.fields.farms?.name && <span> ({crop.fields.farms.name})</span>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
            {onEdit && (
              <button
                onClick={() => onEdit(crop)}
                title="Edit Crop"
                className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(crop.id, crop.name)}
                title="Delete Crop"
                className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Date and Timeline */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <span>Planted:</span>
          </div>
          <span className="font-semibold text-slate-700">
            {crop.planting_date ? new Date(crop.planting_date).toLocaleDateString() : 'Not recorded'}
          </span>
        </div>

        {/* AI Action CTA */}
        <div className="mt-4">
          <Link
            to={`/advisor?crop_id=${crop.id}`}
            className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all hover:shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Request AI Advisory
          </Link>
        </div>
      </div>

      <div className="bg-slate-50/80 px-6 py-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-600">
          Created {new Date(crop.created_at).toLocaleDateString()}
        </span>
        <Link
          to={`/crops/${crop.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          View History
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default CropCard;
