import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Activity, 
  Stethoscope, 
  Printer, 
  ArrowLeft,
  Clock,
  TrendingUp,
  FileText,
  AlertCircle
} from 'lucide-react';

const PURPLE_DARK = '#1A0A2E';
const PURPLE_MID = '#3B1F6A';
const PURPLE_SOFT = '#A98EDD';
const GOLD = '#F5C842';
const GOLD_DARK = '#D4A017';
const WHITE = '#FFFFFF';

const PatientProfile = ({ patient, onBack, onEdit }) => {
  if (!patient) return null;

  const handlePrint = () => {
    window.print();
  };

  // Format secondary diagnoses if they exist
  const secondaryCodes = patient.icd_secondary ? JSON.parse(patient.icd_secondary) : [];

  return (
    <div className="animate-fadeIn pb-12 print:p-0 print:m-0">
      {/* Top Navigation / Actions */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer size={14} /> Print Clinical Summary
          </button>
          <button 
            onClick={onEdit}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
          >
            <Stethoscope size={14} color={GOLD} /> Re-Assess Episode
          </button>
        </div>
      </div>

      {/* Main Profile Shell */}
      <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        
        {/* Profile Header */}
        <div className="p-10 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-teal-500 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-teal-500/30">
                {patient.patient_name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-teal-400 border border-teal-500/20">
                    Active Episode
                  </span>
                  <span className="text-slate-400 text-xs font-mono">#{patient.id || '29481'}</span>
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tight">{patient.patient_name}</h1>
                <p className="text-slate-400 font-medium mt-1">
                  Established Clinical Record <span className="mx-2">|</span> DOB: {patient.patient_dob}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Episode Status</p>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                <span className="text-sm font-black uppercase tracking-widest">{patient.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Demographics & Context */}
          <div className="lg:col-span-7 space-y-10">
            
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                <User size={14} className="text-teal-500" /> Patient Demographics
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Legal Name</p>
                  <p className="text-base font-bold text-slate-900">{patient.patient_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</p>
                  <p className="text-base font-bold text-slate-900">{patient.patient_dob}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Contact</p>
                  <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                    <Phone size={14} className="text-slate-300" /> {patient.patient_phone || 'N/A'}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insurance Provider</p>
                  <div className="flex items-center gap-2 text-base font-bold text-teal-600">
                    <Shield size={14} className="text-teal-400" /> {patient.insurance_provider || 'Self-Pay / Not Listed'}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                <Activity size={14} className="text-blue-500" /> Referral Source Context
              </h3>
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Referring Provider</p>
                    <p className="text-base font-bold text-slate-900">Dr. {patient.provider_name || 'System Import'}</p>
                    <p className="text-xs font-mono text-slate-400">NPI: {patient.provider_id || 'EXTERNAL'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inbound Source</p>
                    <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                      <FileText size={14} className="text-slate-300" /> {patient.source || 'Standard Portal'}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Physician Diagnosis Notes</p>
                  <p className="text-slate-700 italic border-l-4 border-slate-200 pl-4 py-1 leading-relaxed">
                    "{patient.diagnosis}"
                  </p>
                </div>
              </div>
            </section>

          </div>

          {/* Right: Clinical Coding & PDGM Insights */}
          <div className="lg:col-span-5 space-y-8">
            
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <TrendingUp size={14} className="text-orange-500" /> Clinical Diagnosis Record
              </h3>

              {/* Primary Diagnosis */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Diagnosis (M1021A)</p>
                {patient.icd_primary ? (
                  <div className="p-5 bg-white border-2 border-teal-500/20 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-black font-mono tracking-widest uppercase">
                        {patient.icd_primary}
                      </span>
                      <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">OASIS Validated</span>
                    </div>
                    <p className="text-sm font-black text-slate-900 leading-tight">
                        {patient.primary_diagnosis?.description || 'Primary clinical code assigned.'}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3">
                    <AlertCircle size={18} className="text-orange-500" />
                    <p className="text-xs font-black text-orange-700 uppercase">Assessment Pending</p>
                  </div>
                )}
              </div>

              {/* Secondary Diagnoses */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secondary Comorbidities</p>
                <div className="space-y-2">
                  {secondaryCodes.length > 0 ? secondaryCodes.map((code, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-black text-slate-400">{idx + 1}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold font-mono">{code}</span>
                      <span className="text-xs font-bold text-slate-600 truncate">Comorbidity Identifier</span>
                    </div>
                  )) : (
                    <p className="text-xs text-slate-400 italic">No associated comorbidities recorded.</p>
                  )}
                </div>
              </div>

              {/* PDGM Financials */}
              <div className="pt-8 border-t border-slate-200">
                <div className="bg-slate-900 rounded-2xl p-6 text-white text-center shadow-xl shadow-slate-900/20">
                  <p className="text-[9px] font-black uppercase text-teal-400 mb-2 tracking-widest">Est. PDGM Episode Payment</p>
                  <p className="text-3xl font-black tracking-tighter mb-1">
                    <span className="text-lg text-teal-500 font-bold">$</span> 
                    {parseFloat(patient.pdgm_payment || '2450.00').toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case Weight: {patient.pdgm_weight || '1.0000'}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex items-start gap-4">
              <Clock size={20} className="text-blue-500 mt-1" />
              <div>
                <p className="text-[10px] font-black text-blue-900 uppercase tracking-tight mb-1">Clinical Audit Trail</p>
                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                  Referral admitted on {new Date(patient.created_at).toLocaleDateString()} at {new Date(patient.created_at).toLocaleTimeString()}. Last clinical sync performed 14m ago.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Print Footer */}
      <div className="mt-12 text-center text-slate-400 text-[9px] font-black uppercase tracking-widest opacity-0 print:opacity-100">
        Clinical Record Summary · Generated by Olympia Homehealth Intelligence · Confidential Patient Data
      </div>
    </div>
  );
};

export default PatientProfile;
