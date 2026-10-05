import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Info,
  ShieldAlert,
  Zap,
  CalendarCheck,
  ShieldCheck,
  UserCheck,
  FileCode,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AdvisoryResult = ({ advisory }) => {
  const [showRawJson, setShowRawJson] = useState(false);

  if (!advisory) return null;

  // Severity styles mapping
  const severityMap = {
    Critical: {
      badge: 'bg-red-100 text-red-800 border-red-300',
      border: 'border-red-200',
      headerBg: 'bg-red-50/70',
      icon: AlertOctagon,
      pulse: 'bg-red-500'
    },
    High: {
      badge: 'bg-orange-100 text-orange-800 border-orange-300',
      border: 'border-orange-200',
      headerBg: 'bg-orange-50/70',
      icon: AlertTriangle,
      pulse: 'bg-orange-500'
    },
    Medium: {
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      border: 'border-amber-200',
      headerBg: 'bg-amber-50/70',
      icon: Info,
      pulse: 'bg-amber-500'
    },
    Low: {
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      border: 'border-emerald-200',
      headerBg: 'bg-emerald-50/70',
      icon: CheckCircle2,
      pulse: 'bg-emerald-500'
    }
  };

  const severityConfig = severityMap[advisory.severity] || severityMap.Medium;
  const SeverityIcon = severityConfig.icon;

  // Normalize array fields (in case they come from raw_json or parsed columns)
  const causes = Array.isArray(advisory.causes) ? advisory.causes : (advisory.raw_json?.possible_causes || []);
  const immediateActions = Array.isArray(advisory.immediate_actions)
    ? advisory.immediate_actions
    : (advisory.raw_json?.immediate_actions || []);
  const longTermActions = Array.isArray(advisory.long_term_actions)
    ? advisory.long_term_actions
    : (advisory.raw_json?.long_term_recommendations || []);
  const prevention = Array.isArray(advisory.prevention)
    ? advisory.prevention
    : (advisory.raw_json?.prevention || []);

  return (
    <div className={`bg-white rounded-3xl border ${severityConfig.border} shadow-lg overflow-hidden transition-all duration-300`}>
      {/* Header Diagnostic Card */}
      <div className={`p-6 sm:p-8 ${severityConfig.headerBg} border-b ${severityConfig.border}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border shadow-sm ${severityConfig.badge}`}>
              <span className={`w-2 h-2 rounded-full ${severityConfig.pulse} animate-ping`} />
              {advisory.severity} Severity
            </span>
            {advisory.crops?.name && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/80 text-slate-700 border border-slate-200 shadow-sm">
                Crop: {advisory.crops.name} ({advisory.crops.growth_stage})
              </span>
            )}
          </div>

          <span className="text-xs font-medium text-slate-600">
            Diagnosis ID: {advisory.id?.slice(0, 8)} • {new Date(advisory.created_at || Date.now()).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
            <SeverityIcon className="w-6 h-6 text-slate-800" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {advisory.condition_name || advisory.raw_json?.likely_condition || 'Condition Detected'}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              {advisory.reasoning || advisory.raw_json?.reasoning_summary}
            </p>
          </div>
        </div>

        {/* Farmer reported symptoms reminder */}
        {advisory.symptoms && (
          <div className="mt-5 p-3.5 rounded-xl bg-white/80 border border-slate-200/80 text-xs text-slate-700">
            <span className="font-bold text-slate-900">Reported Symptoms:</span> {advisory.symptoms}
            {advisory.weather_context && (
              <span className="ml-2 pl-2 border-l border-slate-300 text-slate-600">
                <span className="font-semibold text-slate-800">Context:</span> {advisory.weather_context}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Advisory Content Body */}
      <div className="p-6 sm:p-8 space-y-8">
        {/* Probable Causes */}
        {causes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5 text-slate-700" />
              <h3 className="text-base font-bold text-slate-900">
                Identified Potential Causes
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {causes.map((cause, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                >
                  • {cause}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Immediate Mitigation Actions */}
        {immediateActions.length > 0 && (
          <div className="rounded-2xl bg-amber-50/50 border border-amber-200/70 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Immediate Emergency Actions
                </h3>
                <p className="text-xs text-slate-600">Execute these measures immediately to halt crop degradation</p>
              </div>
            </div>
            <ul className="space-y-2.5">
              {immediateActions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-800">
                  <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="leading-snug">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dual Column: Long-Term Management & Prevention */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Long-Term Actions */}
          {longTermActions.length > 0 && (
            <div className="rounded-2xl bg-emerald-50/40 border border-emerald-200/70 p-5">
              <div className="flex items-center gap-2 mb-3">
                <CalendarCheck className="w-5 h-5 text-emerald-700" />
                <h4 className="text-sm font-bold text-slate-900">
                  Long-Term Agronomic Strategy
                </h4>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {longTermActions.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prevention Protocols */}
          {prevention.length > 0 && (
            <div className="rounded-2xl bg-blue-50/40 border border-blue-200/70 p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-blue-700" />
                <h4 className="text-sm font-bold text-slate-900">
                  Future Outbreak Prevention
                </h4>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {prevention.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Agronomist Consultation Callout */}
        {(advisory.expert_consult_recommended ?? advisory.raw_json?.expert_consult_recommended) && (
          <div className="rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 p-5 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-950">
                Certified Agronomist Consultation Strongly Advised
              </h4>
              <p className="mt-1 text-xs text-red-800 leading-relaxed">
                The symptoms indicate severe or fast-spreading pathology. Please contact your local agricultural extension service, agronomist, or seed representative for an on-site sample evaluation before applying high-dosage chemical treatments.
              </p>
            </div>
          </div>
        )}

        {/* Legal Disclaimer */}
        <div className="rounded-xl bg-slate-100/80 p-4 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-700 uppercase tracking-wide">Agronomic Disclaimer: </span>
          {advisory.disclaimer || advisory.raw_json?.disclaimer || 'This advisory is generated by Google Gemini artificial intelligence models based on symptoms reported by the user. Environmental variations, soil chemistries, and regional microclimates affect crop health. Always consult licensed agricultural professionals for critical crop interventions.'}
        </div>

        {/* Raw JSON Debug Toggler */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowRawJson(!showRawJson)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-700 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5" />
            {showRawJson ? 'Hide Diagnostic JSON Payload' : 'View Diagnostic JSON Payload'}
            {showRawJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showRawJson && (
            <div className="mt-3 p-4 bg-slate-900 rounded-2xl overflow-x-auto text-emerald-400 font-mono text-xs">
              <pre>{JSON.stringify(advisory.raw_json || advisory, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisoryResult;
