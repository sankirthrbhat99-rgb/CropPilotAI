import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Layers, Edit2, Trash2, ArrowRight } from 'lucide-react';

export const FarmCard = ({ farm, onEdit, onDelete }) => {
  const fieldsCount = farm.fields?.length ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <Link
              to={`/farms/${farm.id}`}
              className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1"
            >
              {farm.name}
            </Link>
            {farm.location ? (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="truncate">{farm.location}</span>
              </div>
            ) : (
              <div className="text-xs text-slate-600 mt-1 italic">
                Location unassigned
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
            {onEdit && (
              <button
                onClick={() => onEdit(farm)}
                title="Edit Farm"
                className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(farm.id, farm.name)}
                title="Delete Farm"
                className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Badges / Metrics */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-2.5">
            <span className="text-[11px] font-medium text-slate-600 block">Total Area</span>
            <span className="text-sm font-bold text-slate-800">
              {farm.area ? `${farm.area} acres` : 'Not specified'}
            </span>
          </div>

          <div className="bg-emerald-50/70 rounded-xl p-2.5">
            <span className="text-[11px] font-medium text-emerald-700 block">Managed Fields</span>
            <div className="flex items-center gap-1 text-sm font-bold text-emerald-900">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              {fieldsCount} {fieldsCount === 1 ? 'Field' : 'Fields'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50/80 px-6 py-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-600">
          Created {new Date(farm.created_at).toLocaleDateString()}
        </span>
        <Link
          to={`/farms/${farm.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          View Fields
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default FarmCard;
