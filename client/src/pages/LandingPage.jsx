import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sprout,
  Sparkles,
  Layers,
  Wheat,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
  Activity,
  Cpu,
  BarChart3
} from 'lucide-react';

export const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-16 sm:space-y-24 pb-12">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 text-center max-w-4xl mx-auto px-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          Powered by Google Gemini 2.5 & Supabase RLS
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
          Intelligent Agronomy &{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
            AI Crop Advisory
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Empowering modern farmers with rapid disease diagnostics, precision crop management, and actionable AI-driven treatments tailored to your fields.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={user ? "/dashboard" : "/register"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            {user ? 'Open Farmer Dashboard' : 'Start Farming Smarter — Free'}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to={user ? "/advisor" : "/login"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm hover:border-slate-300 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            {user ? 'Test AI Diagnostic' : 'Sign In to Account'}
          </Link>
        </div>

        {/* Highlights List */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Instant Symptom Evaluation
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Strict Row Level Data Isolation
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Full Historical Advisory Records
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Complete Farm-to-Crop Intelligence
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Everything an agronomist and grower needs to monitor plots, track plant growth stages, and avert crop failure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Hierarchical Farm Architecture
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Organize land holdings into Farms, delineate specific Fields with soil specifications, and track individual crop plots with precision.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-md shadow-emerald-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-md shadow-emerald-600/30">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Gemini Agronomy Intelligence
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Feed real symptom descriptions and weather contexts to Google Gemini. Receive structured diagnoses, probable pathogens, and immediate action plans.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Persistent Advisory Archive
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every diagnosis is securely stored in Supabase PostgreSQL under strict RLS policies. Easily revisit recommendations weeks later during harvest.
            </p>
          </div>
        </div>
      </section>

      {/* Visual Workflow Steps */}
      <section className="max-w-5xl mx-auto px-4 bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl text-white p-8 sm:p-12 shadow-xl">
        <div className="max-w-xl">
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">
            From First Symptom to Field Recovery in Minutes
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-10">
          <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/10">
            <div className="text-2xl font-black text-emerald-400 mb-2">01</div>
            <h4 className="font-bold text-sm mb-1">Register Farm</h4>
            <p className="text-xs text-slate-300">Add your properties, plots, and acreage specs.</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/10">
            <div className="text-2xl font-black text-emerald-400 mb-2">02</div>
            <h4 className="font-bold text-sm mb-1">Log Active Crops</h4>
            <p className="text-xs text-slate-300">Assign crop types, planting dates, and growth stages.</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/10">
            <div className="text-2xl font-black text-emerald-400 mb-2">03</div>
            <h4 className="font-bold text-sm mb-1">Describe Issues</h4>
            <p className="text-xs text-slate-300">Enter visible symptoms, discoloration, and climate notes.</p>
          </div>

          <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/10">
            <div className="text-2xl font-black text-emerald-400 mb-2">04</div>
            <h4 className="font-bold text-sm mb-1">Execute Advice</h4>
            <p className="text-xs text-slate-300">Apply AI immediate actions, prevention, and follow-ups.</p>
          </div>
        </div>

        <div className="mt-10 text-center sm:text-left">
          <Link
            to={user ? "/advisor" : "/register"}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-lg transition-transform hover:scale-105"
          >
            Start Diagnosing Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
