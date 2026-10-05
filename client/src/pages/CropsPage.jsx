import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cropsApi } from '../services/api';
import CropCard from '../components/CropCard';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import {
  Wheat,
  Search,
  Filter,
  Sparkles,
  Layers,
  MapPin,
  AlertCircle,
  Loader2
} from 'lucide-react';

const GROWTH_STAGES = ['All', 'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest'];
const CROP_STATUSES = ['All', 'Healthy', 'Warning', 'Critical'];

export const CropsPage = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Edit Modal
  const [editingCrop, setEditingCrop] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    growth_stage: 'Seedling',
    planting_date: '',
    status: 'Healthy'
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchCrops = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await cropsApi.getAll();
      setCrops(res.data || []);
    } catch (err) {
      console.error('Failed to fetch crops:', err);
      setError(err.message || 'Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const openEditModal = (crop) => {
    setEditingCrop(crop);
    setEditFormData({
      name: crop.name,
      growth_stage: crop.growth_stage || 'Seedling',
      planting_date: crop.planting_date || '',
      status: crop.status || 'Healthy'
    });
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    try {
      setSubmittingEdit(true);
      await cropsApi.update(editingCrop.id, editFormData);
      setIsEditModalOpen(false);
      await fetchCrops();
    } catch (err) {
      console.error('Error updating crop:', err);
      setEditError(err.message || 'Failed to update crop');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteCrop = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove crop "${name}"?`)) {
      return;
    }

    try {
      await cropsApi.delete(id);
      await fetchCrops();
    } catch (err) {
      console.error('Error deleting crop:', err);
      alert(`Error deleting crop: ${err.message}`);
    }
  };

  const filteredCrops = crops.filter((crop) => {
    const matchesSearch = crop.name.toLowerCase().includes(search.toLowerCase()) ||
      (crop.fields?.name && crop.fields.name.toLowerCase().includes(search.toLowerCase()));
    const matchesStage = selectedStage === 'All' || crop.growth_stage === selectedStage;
    const matchesStatus = selectedStatus === 'All' || crop.status === selectedStatus;
    return matchesSearch && matchesStage && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
            <Wheat className="w-3.5 h-3.5" />
            Active Plantings
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Crops Directory
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
            Monitor crop health statuses, track vegetative stages, and launch diagnostic advisories.
          </p>
        </div>

        <Link
          to="/advisor"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          Diagnose with AI
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crops by variety or field name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Filter className="w-3.5 h-3.5" />
            Stage:
          </div>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {GROWTH_STAGES.map((stage) => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 ml-2">
            Status:
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {CROP_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
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
          <Spinner text="Loading registered crops..." />
        </div>
      ) : filteredCrops.length === 0 ? (
        <EmptyState
          icon={Wheat}
          title={search || selectedStage !== 'All' || selectedStatus !== 'All' ? "No crops match filters" : "No crops registered"}
          description={search ? "Adjust your search filters above." : "Navigate to your fields to register crops."}
          actionLabel={search ? "Reset Filters" : "Go to Farms"}
          onAction={search ? () => { setSearch(''); setSelectedStage('All'); setSelectedStatus('All'); } : () => window.location.href = '/farms'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onEdit={openEditModal}
              onDelete={handleDeleteCrop}
            />
          ))}
        </div>
      )}

      {/* Edit Crop Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Crop Record"
      >
        {editError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{editError}</span>
          </div>
        )}

        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Crop Name *
            </label>
            <input
              type="text"
              required
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Growth Stage
              </label>
              <select
                value={editFormData.growth_stage}
                onChange={(e) => setEditFormData({ ...editFormData, growth_stage: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {GROWTH_STAGES.filter(s => s !== 'All').map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {CROP_STATUSES.filter(s => s !== 'All').map((status) => (
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
              value={editFormData.planting_date}
              onChange={(e) => setEditFormData({ ...editFormData, planting_date: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingEdit}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/30 disabled:opacity-50"
            >
              {submittingEdit ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CropsPage;
