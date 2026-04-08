import React, { useState, useMemo } from 'react';
import { 
  ChevronRight, 
  Search, 
  Plus, 
  X, 
  ShieldCheck, 
  TrendingUp, 
  Clipboard, 
  Zap, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Info,
  DollarSign,
  Activity,
  FilePlus,
  Loader2
} from 'lucide-react';
import ICD10Search from './ICD10Search';

const DiagnosisAssessment = ({ referralData = null, onSave = null, onUpdateDocs = null }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [primaryDiagnosis, setPrimaryDiagnosis] = useState(null);
    const [secondaryDiagnoses, setSecondaryDiagnoses] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTarget, setSearchTarget] = useState('primary'); // 'primary' or 'secondary'
    const [showSaveMessage, setShowSaveMessage] = useState(false);

    // Context for PDGM logic
    const [admissionSource, setAdmissionSource] = useState('community');
    const [episodeTiming, setEpisodeTiming] = useState('early');
    const [functionalLevel, setFunctionalLevel] = useState('medium');
    const [comorbidityAdjustment, setComorbidityAdjustment] = useState('none');
    const [activeSubTab, setActiveSubTab] = useState('diagnoses'); // 'diagnoses', 'chart', 'assessment'
    const [searchQuery, setSearchQuery] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState(null);

    const handleSelectDiagnosis = (codeData, target) => {
        if (target === 'primary') {
            setPrimaryDiagnosis(codeData);
        } else {
            // Avoid duplicates
            if (!secondaryDiagnoses.find(d => d.code === codeData.code)) {
                setSecondaryDiagnoses([...secondaryDiagnoses, codeData]);
                // Automatically set low comorbidity if this is the first secondary
                if (secondaryDiagnoses.length === 0 && comorbidityAdjustment === 'none') {
                    setComorbidityAdjustment('low');
                }
            }
        }
        setIsSearching(false);
        setSearchQuery('');
    };

    const removeSecondary = (code) => {
        setSecondaryDiagnoses(secondaryDiagnoses.filter(d => d.code !== code));
    };

    const calculatePDGMData = (baseWeight) => {
        if (!baseWeight) return { amount: '0.00', weight: '0.0000' };
        
        const BASE_RATE = 2038.39;
        let multiplier = 1.0;

        // Apply Factors
        if (admissionSource === 'institutional') multiplier *= 1.2;
        if (episodeTiming === 'early') multiplier *= 1.15;
        
        if (functionalLevel === 'high') multiplier *= 1.4;
        else if (functionalLevel === 'medium') multiplier *= 1.25;

        if (comorbidityAdjustment === 'high') multiplier *= 1.2;
        else if (comorbidityAdjustment === 'low') multiplier *= 1.1;

        const finalWeight = (parseFloat(baseWeight) * multiplier).toFixed(4);
        const amount = (parseFloat(finalWeight) * BASE_RATE).toFixed(2);

        return { amount, weight: finalWeight };
    };

    const analytics = useMemo(() => {
        return calculatePDGMData(primaryDiagnosis?.base_weight || 0);
    }, [primaryDiagnosis, admissionSource, episodeTiming, functionalLevel, comorbidityAdjustment]);

    const handleSave = () => {
        if (onSave) {
            onSave({
                primary: primaryDiagnosis?.code,
                secondary: secondaryDiagnoses.map(d => d.code),
                weight: analytics.weight,
                payment: analytics.amount,
                context: { admissionSource, episodeTiming, functionalLevel, comorbidityAdjustment }
            });
            setShowSaveMessage(true);
            setTimeout(() => setShowSaveMessage(false), 3000);
        }
    };

    const handleAdminFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        setIsUploading(true);
        const formDataUpload = new FormData();
        files.forEach(f => formDataUpload.append('files', f));
        
        try {
            const res = await fetch('/api/public/upload', {
                method: 'POST',
                body: formDataUpload
            });
            if (res.ok) {
                const data = await res.json();
                if (onUpdateDocs) {
                    onUpdateDocs(data.files);
                }
            }
        } catch (err) {
            console.error("Admin upload failed", err);
        } finally {
            setIsUploading(false);
        }
    };

    const handlePulseScan = async () => {
        if (!referralData?.document_urls || referralData.document_urls.length === 0) return;
        
        setIsScanning(true);
        setAiSuggestions(null);
        try {
            const rawUrls = referralData.document_urls;
            // FIX: Correctly extract the .url property from the clinical packet object
            const packetObj = typeof rawUrls === 'string' ? JSON.parse(rawUrls)[0] : rawUrls[0];
            const fileUrl = packetObj?.url || packetObj;

            if (!fileUrl || typeof fileUrl !== 'string' || !fileUrl.startsWith('http')) {
                throw new Error("Invalid documentation URL structure.");
            }

            const res = await fetch('/api/admin/extract-clinical-data', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('olympia_admin_token')}`
                },
                body: JSON.stringify({ fileUrl })
            });

            if (res.ok) {
                const data = await res.json();
                setAiSuggestions(data);
            } else {
                const errorData = await res.json();
                const detail = (errorData.details || "").toLowerCase();
                const isQuotaError = detail.includes('quota') || detail.includes('limit') || detail.includes('429');
                console.error(isQuotaError ? "AI Quota Exhausted: Please use manual search." : "AI Scan error detail:", errorData.details);
                alert(isQuotaError ? "AI Service Limit Reached. Please search and select the Primary Diagnosis manually." : "AI Scan failed. Please use manual search.");
            }
        } catch (err) {
            console.error("AI Scan failed", err);
            alert("Scan failed. Please adjust manual diagnosis.");
        } finally {
            setIsScanning(false);
        }
    };


    const applyAiCode = async (codeData, isPrimary = false) => {
        try {
            const res = await fetch(`/api/admin/diagnosis/search?q=${codeData.code}`);
            if (res.ok) {
                const data = await res.json();
                const fullCode = data.find(c => c.code === codeData.code) || { ...codeData, base_weight: '1.0', pdgm_grouping: 'Unknown', tips: [] };
                if (isPrimary) {
                    setPrimaryDiagnosis(fullCode);
                } else {
                    if (!secondaryDiagnoses.find(d => d.code === fullCode.code)) {
                        setSecondaryDiagnoses(prev => [...prev, fullCode]);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to enrich AI code", err);
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto animate-fadeIn grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Main Assessment Area */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* SOC Navigation Breadcrumb + Patient Context */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-1 bg-white/50 w-fit p-1 rounded-full border border-slate-100 shadow-sm">
                        <button 
                            onClick={() => setActiveSubTab('chart')}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'chart' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Patient Chart
                        </button>
                        <ChevronRight size={10} className="text-slate-300 mx-1" />
                        <button 
                            onClick={() => setActiveSubTab('assessment')}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'assessment' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            SOC Assessment
                        </button>
                        <ChevronRight size={10} className="text-slate-300 mx-1" />
                        <button 
                            onClick={() => setActiveSubTab('diagnoses')}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'diagnoses' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Diagnoses
                        </button>
                    </div>
                    {referralData && (
                        <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-2 rounded-2xl shadow-lg border border-slate-800">
                            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-[10px] font-black font-mono">
                                {referralData.patient_name?.charAt(0) || 'P'}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-tighter leading-none text-slate-400">Active Case</p>
                                <p className="text-xs font-bold text-white mt-1">{referralData.patient_name} <span className="text-slate-500 mx-1">|</span> {referralData.patient_dob}</p>
                            </div>
                        </div>
                    )}
                </div>

                {activeSubTab === 'diagnoses' ? (
                    <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="p-8 space-y-8">
                            <div className="flex items-center justify-between gap-6 border-b border-slate-100 pb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">OASIS DIAGNOSIS MANAGEMENT</h3>
                                    <p className="text-slate-400 text-xs font-semibold">Assign primary and secondary ICD-10-CM codes for this episode.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Upload Trigger (Visible if Docs Missing) */}
                                    {(!referralData?.document_urls || referralData.document_urls.length === 0 || referralData.document_urls === '[]') && (
                                        <>
                                            <input 
                                                type="file" 
                                                id="admin-referral-docs" 
                                                multiple 
                                                hidden 
                                                onChange={handleAdminFileUpload} 
                                            />
                                            <label 
                                                htmlFor="admin-referral-docs"
                                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl cursor-pointer bg-slate-100 text-slate-500 hover:bg-slate-200 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                            >
                                                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <FilePlus size={14} />}
                                                {isUploading ? 'Uploading...' : 'Upload Clinical Packet'}
                                            </label>
                                        </>
                                    )}

                                    {(referralData?.document_urls?.length > 0 || (typeof referralData?.document_urls === 'string' && referralData.document_urls !== '[]')) && (
                                        <button 
                                            onClick={handlePulseScan}
                                            disabled={isScanning}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl group ${isScanning ? 'bg-slate-100 text-slate-400' : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/20'}`}
                                        >
                                            <Zap size={14} className={isScanning ? 'animate-pulse' : 'group-hover:scale-125 transition-transform'} />
                                            {isScanning ? 'AI PulseScanning...' : 'AI PulseScan'}
                                        </button>
                                    )}
                                    <button 
                                        onClick={handleSave}
                                        className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                                    >
                                        Save Plan
                                    </button>
                                </div>
                            </div>

                            {/* DOCUMENTATION MISSING ALERT */}
                            {(!referralData?.document_urls || referralData.document_urls.length === 0 || referralData.document_urls === '[]') && (
                                <div className="bg-amber-50 border-2 border-amber-100 rounded-3xl p-6 flex items-center justify-between gap-6 animate-pulse-subtle">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-200 flex items-center justify-center text-amber-700 shadow-inner">
                                            <AlertCircle size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Clinical Documentation Missing</h4>
                                            <p className="text-amber-700 text-[11px] font-bold mt-1">AI PulseScan is disabled. Please upload a Discharge Summary or Referral Packet to enable automated extraction.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-8 space-y-10">
                                {/* AI Suggestions Area */}
                                {aiSuggestions && (
                                    <div className="bg-indigo-50/50 border-2 border-indigo-100 rounded-[32px] p-8 animate-fadeInDown">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                                    <Zap size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-900 leading-none">AI CLINICAL SENTINEL</h4>
                                                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${aiSuggestions.is_recovery_mode ? 'text-amber-500' : 'text-indigo-500'}`}>
                                                        {aiSuggestions.is_recovery_mode ? 'Predictive Heuristics Enabled (Recovery Mode)' : 'Suggested from Document Parsing'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button onClick={() => setAiSuggestions(null)} className="p-2 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                                        </div>

                                        <p className="text-xs font-bold text-slate-600 italic mb-6 border-l-4 border-indigo-200 pl-4 py-1">
                                            "{aiSuggestions.clinical_summary}"
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm">
                                                <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Suggested Primary</div>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <span className="bg-indigo-900 text-white px-2 py-0.5 rounded text-[10px] font-black">{aiSuggestions.primary.code}</span>
                                                        <h5 className="text-sm font-black text-slate-900 mt-2">{aiSuggestions.primary.description}</h5>
                                                    </div>
                                                    <button 
                                                        onClick={() => applyAiCode(aiSuggestions.primary, true)}
                                                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="bg-white/50 p-5 rounded-2xl border border-indigo-100">
                                                <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Comorbidities Detected ({aiSuggestions.secondary?.length || 0})</div>
                                                <div className="space-y-3 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {aiSuggestions.secondary?.map((s, idx) => (
                                                        <div key={idx} className="flex items-center justify-between gap-3 text-xs border-b border-indigo-50/50 pb-2">
                                                            <div className="min-w-0">
                                                                <span className="font-black text-indigo-900 mr-2">{s.code}</span>
                                                                <span className="font-bold text-slate-500 truncate inline-block max-w-[150px] align-bottom">{s.description}</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => applyAiCode(s, false)}
                                                                className="text-[9px] font-black text-indigo-400 hover:text-indigo-600 uppercase"
                                                            >
                                                                Add
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Primary Diagnosis Slot */}
                                <section className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                        <ShieldCheck size={14} className="text-teal-500" /> Primary Diagnosis
                                    </h4>
                                    {primaryDiagnosis ? (
                                        <div className="group relative bg-teal-50/20 border-2 border-teal-500/20 rounded-2xl p-5 transition-all hover:bg-teal-50/40">
                                            <div className="flex items-start justify-between gap-6">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-black">{primaryDiagnosis.code}</span>
                                                        <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Primary Assigned</span>
                                                    </div>
                                                    <h5 className="text-base font-black text-slate-900 leading-tight">{primaryDiagnosis.description}</h5>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Group: {primaryDiagnosis.pdgm_grouping}</span>
                                                        <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-1.5 py-0.5 rounded">Weight: {analytics.weight}</span>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => setPrimaryDiagnosis(null)}
                                                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                    <Search className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <input 
                                                    type="text"
                                                    value={searchTarget === 'primary' ? searchQuery : ''}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Start typing to search Primary ICD-10 codes..."
                                                    onFocus={() => { setIsSearching(true); setSearchTarget('primary'); }}
                                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-teal-500/50 focus:bg-white transition-all shadow-sm"
                                                />
                                            </div>
                                            {isSearching && searchTarget === 'primary' && searchQuery.length > 0 && (
                                                <div className="animate-fadeInDown mt-2">
                                                    <ICD10Search 
                                                        isEmbedded={true} 
                                                        hideSearch={true}
                                                        externalQuery={searchQuery}
                                                        onSelect={(code) => handleSelectDiagnosis(code, 'primary')}
                                                        externalContext={{ admissionSource, episodeTiming, functionalLevel, comorbidityAdjustment }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </section>

                                {/* Secondary Diagnoses List */}
                                <section className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                        <Plus size={14} /> Secondary Diagnoses (Comorbidities)
                                    </h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {secondaryDiagnoses.map((diag, index) => (
                                            <div key={diag.code} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between group animate-fadeInUp">
                                                <div className="flex items-center gap-4">
                                                    <span className="w-5 h-5 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[9px] font-black text-slate-400">
                                                        {index + 1}
                                                    </span>
                                                    <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-black uppercase tracking-tighter">{diag.code}</span>
                                                    <span className="text-xs font-bold text-slate-700">{diag.description}</span>
                                                </div>
                                                <button 
                                                    onClick={() => removeSecondary(diag.code)}
                                                    className="p-1 text-slate-300 hover:text-red-500 transition-all"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="space-y-3">
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                    <Plus size={14} className="text-slate-400" />
                                                </div>
                                                <input 
                                                    type="text"
                                                    value={searchTarget === 'secondary' ? searchQuery : ''}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Add Secondary Diagnosis (Comorbidity)..."
                                                    onFocus={() => { setIsSearching(true); setSearchTarget('secondary'); }}
                                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl py-3 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-indigo-500/30 focus:bg-white transition-all"
                                                />
                                            </div>
                                            {isSearching && searchTarget === 'secondary' && searchQuery.length > 0 && (
                                                <div className="animate-fadeInDown mt-2">
                                                    <ICD10Search 
                                                        isEmbedded={true} 
                                                        hideSearch={true}
                                                        externalQuery={searchQuery}
                                                        onSelect={(code) => handleSelectDiagnosis(code, 'secondary')}
                                                        externalContext={{ admissionSource, episodeTiming, functionalLevel, comorbidityAdjustment }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                ) : activeSubTab === 'chart' ? (
                    <div className="space-y-6">
                        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10">
                            <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">Patient Clinical Chart</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Patient Details</p>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-900 uppercase">General Information</p>
                                        <p className="text-xs font-bold text-slate-500">Name: {referralData?.patient_name}</p>
                                        <p className="text-xs font-bold text-slate-500">DOB: {referralData?.patient_dob}</p>
                                        <p className="text-xs font-bold text-slate-500">Contact: {referralData?.patient_phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Referral Context</p>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-900 uppercase">Provider Information</p>
                                        <p className="text-xs font-bold text-slate-500">Dr. {referralData?.provider_name}</p>
                                        <p className="text-xs font-bold text-slate-500">Facility ID: {referralData?.provider_id}</p>
                                        <p className="text-xs font-bold text-slate-500 text-teal-600">Status: Verified Referral</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Administrative</p>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-900 uppercase">Platform Status</p>
                                        <p className="text-xs font-bold text-slate-500">Episode ID: EP-{referralData?.id || '2849'}</p>
                                        <p className="text-xs font-bold text-slate-500 text-blue-600">State: Intake Queue</p>
                                        <p className="text-xs font-bold text-slate-500">Assigned To: Clinical Staff</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-12 pt-8 border-t border-slate-50">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Original Physician Order</p>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 font-serif italic text-slate-700 leading-relaxed">
                                    "{referralData?.diagnosis}"
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10">
                            <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase tracking-tight">SOC Assessment Progress</h3>
                            <div className="space-y-4 max-w-2xl">
                                <div className="flex items-center justify-between p-6 bg-green-50 rounded-2xl border border-green-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20"><CheckCircle2 size={24} /></div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 uppercase">Patient Intake & Registration</p>
                                            <p className="text-xs font-bold text-green-600">Completed on Intake</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-green-700 uppercase px-3 py-1 bg-white rounded-full">Passed</span>
                                </div>
                                <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><Activity size={24} /></div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 uppercase">Clinical & Functional Assessment</p>
                                            <p className="text-xs font-bold text-slate-400">Scheduled for Field Clinician</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase px-3 py-1 bg-slate-50 rounded-full">Open</span>
                                </div>
                                <div className="flex items-center justify-between p-6 bg-teal-50 border-2 border-teal-500/20 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20"><Clipboard size={24} /></div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 uppercase">Diagnoses & PDGM Coding</p>
                                            <p className="text-xs font-bold text-teal-600">Current active step</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setActiveSubTab('diagnoses')}
                                        className="text-[10px] font-black text-white uppercase px-4 py-2 bg-slate-900 rounded-lg shadow-lg hover:bg-slate-800 transition-all"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Save Feedback */}
                {showSaveMessage && (
                    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-12 py-6 rounded-3xl shadow-2xl flex items-center gap-4 animate-fadeInUp z-[100]">
                        <CheckCircle2 className="text-teal-400" />
                        <div className="text-left">
                            <p className="font-black text-sm uppercase tracking-widest">Assessment Record Updated</p>
                            <p className="text-slate-400 text-xs">Diagnoses successfully saved to Patient Episode.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar: Diagnosis Insights */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
                
                {/* Real-time PDGM Context Selectors */}
                <div className="bg-white rounded-[32px] p-6 shadow-xl border border-slate-100 space-y-6">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                        <TrendingUp size={14} className="text-teal-500" /> Episode Context
                    </h5>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Admission Source</label>
                            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                                <button onClick={() => setAdmissionSource('community')} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${admissionSource === 'community' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>COMMUNITY</button>
                                <button onClick={() => setAdmissionSource('institutional')} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${admissionSource === 'institutional' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>INSTITUTIONAL</button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Episode Timing</label>
                            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                                <button onClick={() => setEpisodeTiming('early')} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${episodeTiming === 'early' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>EARLY</button>
                                <button onClick={() => setEpisodeTiming('late')} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all ${episodeTiming === 'late' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>LATE</button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Functional Level</label>
                            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                                {['low', 'medium', 'high'].map(level => (
                                    <button key={level} onClick={() => setFunctionalLevel(level)} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all uppercase ${functionalLevel === level ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{level}</button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Comorbidity Adjustment</label>
                            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                                {['none', 'low', 'high'].map(level => (
                                    <button key={level} onClick={() => setComorbidityAdjustment(level)} className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all uppercase ${comorbidityAdjustment === level ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{level}</button>
                                ))}
                            </div>
                            <p className="text-[8px] text-slate-400 italic ml-1 mt-1">
                                {secondaryDiagnoses.length > 0 ? 'Secondary codes detected (Assigned: Lower/Higher).' : 'No secondary codes selected.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Performance Analytics Panel */}
                <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400 mb-8">Diagnosis Insights</h5>
                    
                    <div className="space-y-8 relative z-10">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Estimated Episode Payment</p>
                            <h2 className="text-4xl font-black text-white flex items-start gap-1 tabular-nums transition-all">
                                <span className="text-xl mt-1 text-teal-500 font-bold">$</span>
                                <span key={analytics.amount} className="animate-pulse-subtle">{parseFloat(analytics.amount).toLocaleString()}</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                <p className="text-[8px] font-black uppercase text-teal-400 mb-1">Clinical Group</p>
                                <p className="font-bold text-xs truncate">{primaryDiagnosis?.pdgm_grouping || 'Unassigned'}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                <p className="text-[8px] font-black uppercase text-teal-400 mb-1">Combined Weight</p>
                                <p className="font-bold text-xs">{analytics.weight}</p>
                            </div>
                        </div>

                        {comorbidityAdjustment !== 'none' && (
                            <div className="flex items-center gap-3 p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
                                <Zap size={16} className="text-teal-400 flex-shrink-0" />
                                <p className="text-[10px] font-bold text-teal-100 leading-tight uppercase tracking-widest">
                                    {comorbidityAdjustment} Comorbidity adjustment applied
                                </p>
                            </div>
                        )}

                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <h6 className="text-[9px] font-black uppercase text-slate-500 flex items-center gap-2">
                                <Clipboard size={12} /> Clinical Documentation Tips
                            </h6>
                            <div className="space-y-3">
                                {primaryDiagnosis?.tips?.map((tip, i) => (
                                    <div key={i} className="flex gap-2">
                                        <div className="w-1 h-1 bg-teal-500 rounded-full mt-1.5 flex-shrink-0" />
                                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                                            {tip}
                                        </p>
                                    </div>
                                )) || (
                                    <p className="text-[10px] text-slate-600 italic">Select a code to see clinical support notes.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic text-center">
                    <Info className="mx-auto text-slate-300 mb-3" size={24} />
                    <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-wider">
                        CMS PDGM Regulatory Engine v2.5 Active
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DiagnosisAssessment;
