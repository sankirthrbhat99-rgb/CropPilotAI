import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Wheat, Edit2, Trash2, ArrowRight } from 'lucide-react';

export const FieldCard = ({ field, onEdit, onDelete }) => {
  const cropsCount = field.crops?.length ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <Link
              to={`/fields/${field.id}`}
              className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1"
            >
              {field.name}
            </Link>
            {field.farms?.name && (
              <div className="text-xs font-medium text-slate-600 mt-0.5">
                Farm: <span className="text-slate-700 font-semibold">{field.farms.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
            {onEdit && (
              <button
                onClick={() => onEdit(field)}
                title="Edit Field"
                className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(field.id, field.name)}
                title="Delete Field"
                className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-2.5">
            <span className="text-[11px] font-medium text-slate-600 block">Soil Type</span>
            <span className="text-xs font-bold text-slate-800 truncate block">
              {field.soil_type || 'Unspecified'}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5">
            <span className="text-[11px] font-medium text-slate-600 block">Plot Area</span>
            <span className="text-xs font-bold text-slate-800 block">
              {field.area ? `${field.area} acres` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Crops summary badge */}
        <div className="mt-3 flex items-center justify-between bg-emerald-50/60 rounded-xl px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
            <Wheat className="w-3.5 h-3.5 text-emerald-600" />
            Active Crops:
          </div>
          <span className="text-xs font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
            {cropsCount} {cropsCount === 1 ? 'Crop' : 'Crops'}
          </span>
        </div>
      </div>

      <div className="bg-slate-50/80 px-6 py-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-600">
          Created {new Date(field.created_at).toLocaleDateString()}
        </span>
        <Link
          to={`/fields/${field.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          View Crops
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default FieldCard;
