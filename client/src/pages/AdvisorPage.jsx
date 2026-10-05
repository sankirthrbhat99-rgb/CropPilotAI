import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { cropsApi, advisoriesApi } from '../services/api';
import AdvisoryResult from '../components/AdvisoryResult';
import Spinner from '../components/Spinner';
import {
  Sparkles,
  Wheat,
  AlertTriangle,
  Send,
  CloudSun,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Layers
} from 'lucide-react';

const SEVERITY_LEVELS = [
  { id: 'Low', label: 'Low', desc: 'Slight spotting or discoloration on isolated leaves', color: 'border-emerald-300 peer-checked:border-emerald-600 peer-checked:bg-emerald-50' },
  { id: 'Medium', label: 'Medium', desc: 'Moderate symptoms spreading across foliage', color: 'border-amber-300 peer-checked:border-amber-600 peer-checked:bg-amber-50' },
  { id: 'High', label: 'High', desc: 'Severe damage, leaf dropping, or stem decay', color: 'border-orange-300 peer-checked:border-orange-600 peer-checked:bg-orange-50' },
  { id: 'Critical', label: 'Critical', desc: 'Widespread rapid necrosis or threat of total crop loss', color: 'border-red-300 peer-checked:border-red-600 peer-checked:bg-red-50' }
];

export const AdvisorPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedCropId = searchParams.get('crop_id') || '';

  const [crops, setCrops] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(true);

  // Form State
  const [selectedCropId, setSelectedCropId] = useState(preselectedCropId);
  const [symptoms, setSymptoms] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [weatherContext, setWeatherContext] = useState('');

  // Diagnostic submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resultAdvisory, setResultAdvisory] = useState(null);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        setLoadingCrops(true);
        const res = await cropsApi.getAll();
        const cropsList = res.data || [];
        setCrops(cropsList);

        if (preselectedCropId && cropsList.some(c => c.id === preselectedCropId)) {
          setSelectedCropId(preselectedCropId);
        } else if (cropsList.length > 0 && !selectedCropId) {
          setSelectedCropId(cropsList[0].id);
        }
      } catch (err) {
        console.error('Failed to load crops list for advisor:', err);
      } finally {
        setLoadingCrops(false);
      }
    };

    fetchCrops();
  }, [preselectedCropId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedCropId) {
      setError('Please select a registered crop to analyze.');
      return;
    }

    if (!symptoms.trim() || symptoms.trim().length < 5) {
      setError('Please describe crop symptoms in detail (at least 5 characters).');
      return;
    }

    try {
      setSubmitting(true);
      setResultAdvisory(null);

      const payload = {
        crop_id: selectedCropId,
        symptoms: symptoms.trim(),
        severity,
        weather_context: weatherContext.trim() || null
      };

      const res = await advisoriesApi.requestAdvisory(payload);
      setResultAdvisory(res.data);
    } catch (err) {
      console.error('Failed to generate advisory:', err);
      setError(err.message || 'Error communicating with Google Gemini Advisory Agent');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setResultAdvisory(null);
    setSymptoms('');
    setWeatherContext('');
    setSeverity('Medium');
  };

  const selectedCrop = crops.find(c => c.id === selectedCropId);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
          Google Gemini AI Diagnostic Engine
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          AI Crop Advisory Diagnostic
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
          Describe visual pathology, discoloration, or pest damage on your crop. Receive an instant agronomist diagnosis with mitigation steps.
        </p>
      </div>

      {/* Advisory Result View (If generated) */}
      {resultAdvisory && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Diagnostic generated & saved to advisory history successfully</span>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-800 font-bold text-xs border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Run Another Diagnostic
            </button>
          </div>

          <AdvisoryResult advisory={resultAdvisory} />

          <div className="flex justify-center gap-4 pt-2">
            <Link
              to="/advisories"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md"
            >
              View All Advisory Records
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Input Form (Hidden or displayed below result) */}
      {!resultAdvisory && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Diagnostic Request Failed</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {crops.length === 0 && !loadingCrops ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Wheat className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Crops Registered</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Before running an AI advisory, please register at least one farm, field, and crop.
              </p>
              <Link
                to="/farms"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700"
              >
                Go to Farm Management
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Crop Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Select Target Crop *
                </label>
                <div className="relative">
                  <select
                    value={selectedCropId}
                    onChange={(e) => setSelectedCropId(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                  >
                    {crops.map((crop) => (
                      <option key={crop.id} value={crop.id}>
                        {crop.name} — Stage: {crop.growth_stage} {crop.fields?.name ? `(${crop.fields.name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCrop && (
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl">
                    <span>Field: <strong>{selectedCrop.fields?.name || 'Unassigned'}</strong></span>
                    <span>•</span>
                    <span>Soil: <strong>{selectedCrop.fields?.soil_type || 'Unspecified'}</strong></span>
                    <span>•</span>
                    <span>Status: <strong>{selectedCrop.status}</strong></span>
                  </div>
                )}
              </div>

              {/* Step 2: Symptoms Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  2. Describe Crop Symptoms & Observations *
                </label>
                <textarea
                  rows={4}
                  required
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Yellowing leaf margins on lower leaves with dark brown concentric rings. Leaves are wilting despite regular irrigation. Small white fungal powder spotted on stems."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm leading-relaxed"
                />
                <span className="text-[11px] text-slate-600 block mt-1">
                  Be as descriptive as possible regarding coloration, location of lesions, leaf curling, or insect presence.
                </span>
              </div>

              {/* Step 3: Assessed Severity Context */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  3. Perceived Severity Level *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {SEVERITY_LEVELS.map((level) => (
                    <label
                      key={level.id}
                      className="cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={level.id}
                        checked={severity === level.id}
                        onChange={() => setSeverity(level.id)}
                        className="peer sr-only"
                      />
                      <div className={`p-3.5 rounded-2xl border-2 transition-all ${level.color} ${severity === level.id ? 'shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold uppercase text-slate-900">
                            {level.label}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${
                            level.id === 'Critical' ? 'bg-red-500' :
                            level.id === 'High' ? 'bg-orange-500' :
                            level.id === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                          {level.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 4: Weather / Environmental Context (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  4. Weather & Environmental Context (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                    <CloudSun className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={weatherContext}
                    onChange={(e) => setWeatherContext(e.target.value)}
                    placeholder="e.g. Unseasonably heavy rainfall for past 4 days, 85°F high humidity, drip irrigated"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 shadow-xl shadow-emerald-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Symptoms with Gemini AI Agronomist...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-emerald-200 animate-pulse" />
                      Generate AI Agricultural Advisory
                      <Send className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvisorPage;
