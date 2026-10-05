import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { farmsApi, fieldsApi } from '../services/api';
import FieldCard from '../components/FieldCard';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import {
  MapPin,
  Layers,
  Plus,
  ArrowLeft,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const FarmDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [farm, setFarm] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Field Modal State
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldFormData, setFieldFormData] = useState({ name: '', soil_type: '', area: '' });
  const [submittingField, setSubmittingField] = useState(false);
  const [fieldFormError, setFieldFormError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [farmRes, fieldsRes] = await Promise.all([
        farmsApi.getById(id),
        fieldsApi.getAll(id)
      ]);
      setFarm(farmRes.data);
      setFields(fieldsRes.data || []);
    } catch (err) {
      console.error('Failed to load farm details:', err);
      setError(err.message || 'Failed to fetch farm details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const openCreateFieldModal = () => {
    setEditingField(null);
    setFieldFormData({ name: '', soil_type: '', area: '' });
    setFieldFormError('');
    setIsFieldModalOpen(true);
  };

  const openEditFieldModal = (field) => {
    setEditingField(field);
    setFieldFormData({
      name: field.name,
      soil_type: field.soil_type || '',
      area: field.area !== null && field.area !== undefined ? field.area : ''
    });
    setFieldFormError('');
    setIsFieldModalOpen(true);
  };

  const handleFieldSubmit = async (e) => {
    e.preventDefault();
    setFieldFormError('');

    if (!fieldFormData.name.trim()) {
      setFieldFormError('Field name is required');
      return;
    }

    try {
      setSubmittingField(true);
      if (editingField) {
        await fieldsApi.update(editingField.id, fieldFormData);
      } else {
        await fieldsApi.create({
          farm_id: id,
          ...fieldFormData
        });
      }
      setIsFieldModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error saving field:', err);
      setFieldFormError(err.message || 'Failed to save field');
    } finally {
      setSubmittingField(false);
    }
  };

  const handleDeleteField = async (fieldId, name) => {
    if (!window.confirm(`Are you sure you want to delete field "${name}"? Associated crops and diagnostics will be removed.`)) {
      return;
    }

    try {
      await fieldsApi.delete(fieldId);
      await loadData();
    } catch (err) {
      console.error('Error deleting field:', err);
      alert(`Error deleting field: ${err.message}`);
    }
  };

  const handleDeleteFarm = async () => {
    if (!window.confirm(`Are you sure you want to delete "${farm.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await farmsApi.delete(farm.id);
      navigate('/farms');
    } catch (err) {
      console.error('Error deleting farm:', err);
      alert(`Error deleting farm: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner text="Loading farm properties and plots..." />
      </div>
    );
  }

  if (error || !farm) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="p-4 rounded-xl bg-red-50 text-red-700 max-w-md mx-auto text-sm">
          {error || 'Farm not found'}
        </div>
        <Link
          to="/farms"
          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Farms List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <div>
        <Link
          to="/farms"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Farms
        </Link>
      </div>

      {/* Farm Overview Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
            <MapPin className="w-3.5 h-3.5" />
            Farm Property
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {farm.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm text-slate-600">
            {farm.location && (
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-600" />
                {farm.location}
              </span>
            )}
            <span>•</span>
            <span className="font-semibold text-slate-800">
              Total Area: {farm.area ? `${farm.area} acres` : 'Unspecified'}
            </span>
            <span>•</span>
            <span>Created {new Date(farm.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateFieldModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
          <button
            onClick={handleDeleteFarm}
            title="Delete Farm"
            className="p-2.5 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fields List Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Fields inside {farm.name} ({fields.length})
            </h2>
          </div>
        </div>

        {fields.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No Fields Created Yet"
            description="Fields represent specific plots of land inside your farm with distinct soil types and crop beds."
            actionLabel="Add First Field"
            onAction={openCreateFieldModal}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => (
              <FieldCard
                key={field.id}
                field={field}
                onEdit={openEditFieldModal}
                onDelete={handleDeleteField}
              />
            ))}
          </div>
        )}
      </section>

      {/* Create / Edit Field Modal */}
      <Modal
        isOpen={isFieldModalOpen}
        onClose={() => setIsFieldModalOpen(false)}
        title={editingField ? 'Edit Field Specifications' : 'Add Field to Farm'}
      >
        {fieldFormError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{fieldFormError}</span>
          </div>
        )}

        <form onSubmit={handleFieldSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Field / Plot Name *
            </label>
            <input
              type="text"
              required
              value={fieldFormData.name}
              onChange={(e) => setFieldFormData({ ...fieldFormData, name: e.target.value })}
              placeholder="e.g. North Ridge Plot, Greenhouse B"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Soil Type (Optional)
            </label>
            <input
              type="text"
              value={fieldFormData.soil_type}
              onChange={(e) => setFieldFormData({ ...fieldFormData, soil_type: e.target.value })}
              placeholder="e.g. Loamy, Sandy Loam, Clay, Peat"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Area (Acres)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={fieldFormData.area}
              onChange={(e) => setFieldFormData({ ...fieldFormData, area: e.target.value })}
              placeholder="e.g. 24.5"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFieldModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingField}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 disabled:opacity-50"
            >
              {submittingField ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                editingField ? 'Save Field' : 'Create Field'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FarmDetailPage;
