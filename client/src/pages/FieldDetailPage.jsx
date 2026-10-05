import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fieldsApi, cropsApi } from '../services/api';
import CropCard from '../components/CropCard';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import {
  Layers,
  Wheat,
  Plus,
  ArrowLeft,
  Trash2,
  Loader2,
  AlertCircle,
  MapPin,
  Calendar
} from 'lucide-react';

const GROWTH_STAGES = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest'];
const CROP_STATUSES = ['Healthy', 'Warning', 'Critical'];

export const FieldDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [field, setField] = useState(null);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Crop Modal State
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [cropFormData, setCropFormData] = useState({
    name: '',
    growth_stage: 'Seedling',
    planting_date: '',
    status: 'Healthy'
  });
  const [submittingCrop, setSubmittingCrop] = useState(false);
  const [cropFormError, setCropFormError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [fieldRes, cropsRes] = await Promise.all([
        fieldsApi.getById(id),
        cropsApi.getAll({ field_id: id })
      ]);
      setField(fieldRes.data);
      setCrops(cropsRes.data || []);
    } catch (err) {
      console.error('Failed to load field details:', err);
      setError(err.message || 'Failed to fetch field details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const openCreateCropModal = () => {
    setEditingCrop(null);
    setCropFormData({
      name: '',
      growth_stage: 'Seedling',
      planting_date: new Date().toISOString().split('T')[0],
      status: 'Healthy'
    });
    setCropFormError('');
    setIsCropModalOpen(true);
  };

  const openEditCropModal = (crop) => {
    setEditingCrop(crop);
    setCropFormData({
      name: crop.name,
      growth_stage: crop.growth_stage || 'Seedling',
      planting_date: crop.planting_date || '',
      status: crop.status || 'Healthy'
    });
    setCropFormError('');
    setIsCropModalOpen(true);
  };

  const handleCropSubmit = async (e) => {
    e.preventDefault();
    setCropFormError('');

    if (!cropFormData.name.trim()) {
      setCropFormError('Crop name is required');
      return;
    }

    try {
      setSubmittingCrop(true);
      if (editingCrop) {
        await cropsApi.update(editingCrop.id, cropFormData);
      } else {
        await cropsApi.create({
          field_id: id,
          ...cropFormData
        });
      }
      setIsCropModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error saving crop:', err);
      setCropFormError(err.message || 'Failed to save crop');
    } finally {
      setSubmittingCrop(false);
    }
  };

  const handleDeleteCrop = async (cropId, name) => {
    if (!window.confirm(`Are you sure you want to remove crop "${name}"? Past advisory logs will be permanently deleted.`)) {
      return;
    }

    try {
      await cropsApi.delete(cropId);
      await loadData();
    } catch (err) {
      console.error('Error deleting crop:', err);
      alert(`Error deleting crop: ${err.message}`);
    }
  };

  const handleDeleteField = async () => {
    if (!window.confirm(`Are you sure you want to delete field "${field.name}"?`)) {
      return;
    }

    try {
      await fieldsApi.delete(field.id);
      navigate(field.farm_id ? `/farms/${field.farm_id}` : '/farms');
    } catch (err) {
      console.error('Error deleting field:', err);
      alert(`Error deleting field: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner text="Loading plot crops and telemetry..." />
      </div>
    );
  }

  if (error || !field) {
    return (
      <div className="py-12 text-center space-y-4">
        <div className="p-4 rounded-xl bg-red-50 text-red-700 max-w-md mx-auto text-sm">
          {error || 'Field not found'}
        </div>
        <Link
          to="/farms"
          className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Farms
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
        <Link to="/farms" className="hover:text-emerald-700">Farms</Link>
        <span>/</span>
        {field.farms && (
          <>
            <Link to={`/farms/${field.farms.id}`} className="hover:text-emerald-700">
              {field.farms.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-900 font-bold">{field.name}</span>
      </div>

      {/* Field Overview Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
            <Layers className="w-3.5 h-3.5" />
            Field Plot
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {field.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm text-slate-600">
            {field.farms?.name && (
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-600" />
                Farm: {field.farms.name}
              </span>
            )}
            <span>•</span>
            <span className="font-semibold text-slate-800">
              Soil: {field.soil_type || 'Unspecified'}
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-800">
              Area: {field.area ? `${field.area} acres` : 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateCropModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Register Crop
          </button>
          <button
            onClick={handleDeleteField}
            title="Delete Field"
            className="p-2.5 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Crops inside this field */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wheat className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Crops in this Field ({crops.length})
            </h2>
          </div>
        </div>

        {crops.length === 0 ? (
          <EmptyState
            icon={Wheat}
            title="No Crops Cultivated in This Field Yet"
            description="Log your planted crops, set growth stages, and run AI disease advisories."
            actionLabel="Register First Crop"
            onAction={openCreateCropModal}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => (
              <CropCard
                key={crop.id}
                crop={{ ...crop, fields: { name: field.name, farms: field.farms } }}
                onEdit={openEditCropModal}
                onDelete={handleDeleteCrop}
              />
            ))}
          </div>
        )}
      </section>

      {/* Create / Edit Crop Modal */}
      <Modal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        title={editingCrop ? 'Edit Crop Details' : 'Register Crop in Field'}
      >
        {cropFormError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{cropFormError}</span>
          </div>
        )}

        <form onSubmit={handleCropSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Crop Name / Variety *
            </label>
            <input
              type="text"
              required
              value={cropFormData.name}
              onChange={(e) => setCropFormData({ ...cropFormData, name: e.target.value })}
              placeholder="e.g. San Marzano Tomatoes, Hard Red Winter Wheat"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Growth Stage *
              </label>
              <select
                value={cropFormData.growth_stage}
                onChange={(e) => setCropFormData({ ...cropFormData, growth_stage: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {GROWTH_STAGES.map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Health Status *
              </label>
              <select
                value={cropFormData.status}
                onChange={(e) => setCropFormData({ ...cropFormData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {CROP_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Planting Date
            </label>
            <input
              type="date"
              value={cropFormData.planting_date}
              onChange={(e) => setCropFormData({ ...cropFormData, planting_date: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCropModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingCrop}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 disabled:opacity-50"
            >
              {submittingCrop ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                editingCrop ? 'Save Changes' : 'Register Crop'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FieldDetailPage;
