import React, { useState, useEffect } from 'react';
import {
    History,
    User,
    ChevronRight,
    FilePlus,
    Activity,
    CheckCircle2,
    Clock,
    LogOut,
    Stethoscope,
    Phone,
    Calendar,
    ClipboardList,
    AlertCircle,
    Search,
    Plus,
    ShieldCheck,
    Zap,
    DollarSign,
    TrendingUp,
    Info,
    ChevronLeft,
    X,
    Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ICD10Search from '../components/ICD10Search';

const ProviderDashboard = () => {
    const [provider, setProvider] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [activeView, setActiveView] = useState('new');
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState({ type: '', message: '' });
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        patient_first_name: '',
        patient_middle_name: '',
        patient_last_name: '',
        patient_dob: '',
        patient_phone: '',
        diagnosis_text: '',
        services_needed: ''
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [primaryDiagnosis, setPrimaryDiagnosis] = useState(null);
    const [secondaryDiagnoses, setSecondaryDiagnoses] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTarget, setSearchTarget] = useState('primary');
    const [searchQuery, setSearchQuery] = useState('');
    const [clinicalDocs, setClinicalDocs] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState(null);
    const [showQuotaAlert, setShowQuotaAlert] = useState(false);
    
    // PDGM Context State
    const [admissionSource, setAdmissionSource] = useState('community');
    const [episodeTiming, setEpisodeTiming] = useState('early');
    const [functionalLevel, setFunctionalLevel] = useState('medium');
    const [comorbidityAdjustment, setComorbidityAdjustment] = useState('none');

    const AVAILABLE_SERVICES = [
        "Skilled Nursing", "Physical Therapy", "Occupational Therapy",
        "Speech Therapy", "Wound Care", "Medication Management"
    ];

    const getFullName = () => {
        const parts = [formData.patient_first_name, formData.patient_middle_name, formData.patient_last_name].filter(Boolean);
        return parts.join(' ');
    };

    const toggleService = (service) => {
        setSelectedServices(prev =>
            prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
        );
    };

    useEffect(() => {
        const token = localStorage.getItem('olympia_token');
        const storedProvider = localStorage.getItem('olympia_provider');
        if (!token) { navigate('/provider-login'); return; }
        if (storedProvider) setProvider(JSON.parse(storedProvider));
        fetchReferrals(token);
    }, []);

    const fetchReferrals = async (token) => {
        try {
            const res = await fetch('/api/referrals/my', { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setReferrals(await res.json());
        } catch (err) { console.error("Fetch referrals error:", err); }
        finally { setIsLoading(false); }
    };

    const handleLogout = () => {
        localStorage.removeItem('olympia_token');
        localStorage.removeItem('olympia_provider');
        navigate('/provider-login');
    };

    const calculatePDGMData = (baseWeight) => {
        if (!baseWeight) return { amount: '0.00', weight: '0.0000' };
        const BASE_RATE = 2038.39;
        let multiplier = 1.0;
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

    const analytics = React.useMemo(() => {
        return calculatePDGMData(primaryDiagnosis?.base_weight || 0);
    }, [primaryDiagnosis, admissionSource, episodeTiming, functionalLevel, comorbidityAdjustment]);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const fullName = getFullName();
        if (!fullName || !formData.patient_dob || !primaryDiagnosis) {
            setStatus({ type: 'error', message: 'Incomplete Audit: Please ensure Patient Name, DOB, and Primary Diagnosis are set.' });
            return;
        }
        setStatus({ type: 'loading', message: 'Generating Referral Audit...' });
        const token = localStorage.getItem('olympia_token');
        const payload = {
            ...formData,
            patient_name: fullName,
            diagnosis: primaryDiagnosis.code + ' - ' + primaryDiagnosis.description,
            primary_diagnosis: primaryDiagnosis,
            secondary_diagnoses: secondaryDiagnoses,
            services_needed: selectedServices.join(', '),
            document_urls: clinicalDocs.map(d => d.url),
            pdgm_metadata: { group: primaryDiagnosis.pdgm_grouping, weight: analytics.weight, payment: analytics.amount },
            payment: analytics.amount,
            weight: analytics.weight,
            pdgm_weight: analytics.weight,
            admission_source: admissionSource,
            episode_timing: episodeTiming,
            functional_level: functionalLevel,
            comorbidity_adjustment: comorbidityAdjustment
        };
        try {
            const res = await fetch('/api/referrals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                setStatus({ type: 'success', message: 'Referral submitted and clinical audit generated successfully.' });
                setFormData({ patient_first_name: '', patient_middle_name: '', patient_last_name: '', patient_dob: '', patient_phone: '', diagnosis_text: '', services_needed: '' });
                setPrimaryDiagnosis(null);
                setSecondaryDiagnoses([]);
                setSelectedServices([]);
                setSearchQuery('');
                setCurrentStep(1);
                fetchReferrals(token);
                setTimeout(() => setActiveView('history'), 2000);
            } else {
                setStatus({ type: 'error', message: data.error || 'Submission failed' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Network synchronization failed.' });
        }
    };
    const handlePulseScan = async () => {
        if (!clinicalDocs || clinicalDocs.length === 0) return;
        
        setIsScanning(true);
        setAiSuggestions(null);
        try {
            // Get the first uploaded file URL
            const fileUrl = clinicalDocs[0]?.url;
            if (!fileUrl) throw new Error("No document URL found.");

            const res = await fetch('/api/admin/extract-clinical-data', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('olympia_token')}`
                },
                body: JSON.stringify({ fileUrl })
            });

            if (res.ok) {
                const data = await res.json();
                setAiSuggestions(data);
                // Move to Clinical step after scan success
                setTimeout(() => setCurrentStep(3), 1500);
            } else {
                const errorData = await res.json();
                const detail = (errorData.details || "").toLowerCase();
                const isQuotaError = detail.includes('quota') || detail.includes('limit') || detail.includes('429');
                
                if (isQuotaError) {
                    setShowQuotaAlert(true);
                } else {
                    setStatus({ 
                        type: 'error', 
                        message: `AI Scan Failed: ${errorData.details || "Service currently unavailable"}`
                    });
                }
            }
        } catch (err) {
            console.error("AI Scan failed", err);
            setStatus({ type: 'error', message: "Scan failed. Please adjust manual diagnosis." });
        } finally {
            setIsScanning(false);
        }
    };

    const applyAiCode = async (codeData, isPrimary = false) => {
        try {
            const res = await fetch(`/api/admin/diagnosis/search?q=${codeData.code}`);
            if (res.ok) {
                const data = await res.json();
                const fullCode = data.find(c => c.code === codeData.code) || { ...codeData, base_weight: '1.0', pdgm_grouping: 'Unknown' };
                if (isPrimary) {
                    setPrimaryDiagnosis(fullCode);
                } else {
                    if (!secondaryDiagnoses.find(d => d.code === fullCode.code)) {
                        setSecondaryDiagnoses(prev => [...prev, fullCode]);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to apply AI code", err);
        }
    };

    const RenderQuotaModal = () => {
        if (!showQuotaAlert) return null;

        return (
            <div style={styles.modalOverlay}>
                <div style={styles.modalContent}>
                    <button 
                        onClick={() => setShowQuotaAlert(false)}
                        style={styles.modalClose}
                    >
                        <X size={20} />
                    </button>

                    <div style={styles.modalIcon}>
                        <Zap size={32} color={GOLD} />
                    </div>

                    <h3 style={styles.modalTitle}>Intelligence Capacity Reached</h3>
                    <p style={styles.modalDesc}>
                        The AI Sentinel has reached its documentation processing limit. 
                        To maintain clinical continuity, please use the high-fidelity search tool 
                        to manually assign your Primary Diagnosis in the next step.
                    </p>

                    <div style={styles.modalActionGrid}>
                        <button 
                            onClick={() => setShowQuotaAlert(false)}
                            style={styles.modalSecondaryBtn}
                        >
                            Review Docs
                        </button>
                        <button 
                            onClick={() => {
                                setShowQuotaAlert(false);
                                setCurrentStep(3);
                            }}
                            style={styles.modalPrimaryBtn}
                        >
                            Continue Manually <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div style={styles.loadingScreen}>
                <div style={styles.loadingInner}>
                    <div style={styles.loadingLogo}>
                        <Stethoscope size={28} color="#F5C842" />
                    </div>
                    <p style={styles.loadingText}>Initializing Portal...</p>
                </div>
            </div>
        );
    }

    const steps = [
        { step: 1, label: 'Patient Info' },
        { step: 2, label: 'Documents' },
        { step: 3, label: 'Clinical' },
        { step: 4, label: 'Services' },
        { step: 5, label: 'Review' }
    ];

    return (
        <div style={styles.shell}>
            <RenderQuotaModal />
            {/* ── Sidebar ── */}
            <aside style={styles.sidebar}>
                {/* Brand */}
                <div style={styles.sidebarBrand}>
                    <div style={styles.brandIcon}>
                        <Stethoscope size={22} color="#F5C842" />
                    </div>
                    <div>
                        <div style={styles.brandTitle}>Olympia</div>
                        <div style={styles.brandSub}>Provider Portal</div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={styles.nav}>
                    <button
                        onClick={() => setActiveView('new')}
                        style={{ ...styles.navBtn, ...(activeView === 'new' ? styles.navBtnActive : {}) }}
                    >
                        <FilePlus size={16} style={{ flexShrink: 0 }} />
                        New Referral
                    </button>
                    <button
                        onClick={() => setActiveView('history')}
                        style={{ ...styles.navBtn, ...(activeView === 'history' ? styles.navBtnActive : {}) }}
                    >
                        <History size={16} style={{ flexShrink: 0 }} />
                        Submission History
                    </button>
                </nav>

                {/* Provider card */}
                <div style={styles.providerCard}>
                    <div style={styles.providerAvatar}>
                        <User size={20} color="#F5C842" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={styles.providerSignedIn}>Signed In</div>
                        <div style={styles.providerName}>{provider?.name}</div>
                        <div style={styles.providerIdLabel}>Provider ID</div>
                        <code style={styles.providerIdCode}>{provider?.provider_id}</code>
                    </div>
                </div>

                <button onClick={handleLogout} style={styles.logoutBtn}>
                    <LogOut size={15} />
                    Secure Sign Out
                </button>
            </aside>

            {/* ── Main ── */}
            <main style={styles.main}>
                {/* Header */}
                <header style={styles.header}>
                    <div>
                        <h2 style={styles.pageTitle}>
                            {activeView === 'new' ? 'Patient Referral Audit' : 'Historical Submissions'}
                        </h2>
                        <p style={styles.pageSubtitle}>
                            {activeView === 'new'
                                ? 'Deploy a new home health care plan for your patient.'
                                : 'Track the status of your previous care transitions.'}
                        </p>
                    </div>
                    <div style={styles.statusBadge}>
                        <Activity size={16} color="#F5C842" />
                        <div>
                            <div style={styles.statusLabel}>Portal Status</div>
                            <div style={styles.statusValue}>Operational</div>
                        </div>
                    </div>
                </header>

                {/* ── NEW REFERRAL VIEW ── */}
                {activeView === 'new' ? (
                    <div style={styles.grid}>
                        {/* Left: stepped form */}
                        <div style={styles.formCol}>

                            {/* Stepper */}
                            <div style={styles.stepper}>
                                {steps.map((s, idx) => (
                                    <React.Fragment key={s.step}>
                                        <div style={{
                                            ...styles.stepItem,
                                            ...(currentStep === s.step ? styles.stepItemActive : {}),
                                            ...(currentStep > s.step ? styles.stepItemDone : {})
                                        }}>
                                            <span style={{
                                                ...styles.stepNum,
                                                ...(currentStep === s.step ? styles.stepNumActive : {}),
                                                ...(currentStep > s.step ? styles.stepNumDone : {})
                                            }}>
                                                {currentStep > s.step ? '✓' : s.step}
                                            </span>
                                            <span style={styles.stepLabel}>{s.label}</span>
                                        </div>
                                        {idx < 4 && <ChevronRight size={12} color={currentStep > s.step ? '#F5C842' : '#6B4FA0'} />}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Card */}
                            <div style={styles.card}>
                                <div style={styles.cardBody}>

                                    {/* STEP 1 */}
                                    {currentStep === 1 && (
                                        <div>
                                            <div style={styles.stepHeader}>
                                                <h3 style={styles.stepTitle}>Patient Information</h3>
                                                <p style={styles.stepDesc}>Capture essential demographics for the referral intake.</p>
                                            </div>
                                            <div style={styles.fieldGrid}>
                                                <FieldBlock icon={<User size={13} color="#F5C842" />} label="First Name *">
                                                    <input
                                                        type="text"
                                                        value={formData.patient_first_name}
                                                        onChange={e => setFormData({ ...formData, patient_first_name: e.target.value })}
                                                        style={styles.input}
                                                        placeholder="e.g. Jean"
                                                    />
                                                </FieldBlock>
                                                <FieldBlock icon={<User size={13} color="#F5C842" />} label="Middle Name">
                                                    <input
                                                        type="text"
                                                        value={formData.patient_middle_name}
                                                        onChange={e => setFormData({ ...formData, patient_middle_name: e.target.value })}
                                                        style={styles.input}
                                                        placeholder="e.g. Marie (optional)"
                                                    />
                                                </FieldBlock>
                                                <FieldBlock icon={<User size={13} color="#F5C842" />} label="Last Name *">
                                                    <input
                                                        type="text"
                                                        value={formData.patient_last_name}
                                                        onChange={e => setFormData({ ...formData, patient_last_name: e.target.value })}
                                                        style={styles.input}
                                                        placeholder="e.g. Doe"
                                                    />
                                                </FieldBlock>
                                                <FieldBlock icon={<Calendar size={13} color="#F5C842" />} label="Date of Birth *">
                                                    <input
                                                        type="date"
                                                        value={formData.patient_dob}
                                                        onChange={e => setFormData({ ...formData, patient_dob: e.target.value })}
                                                        style={styles.input}
                                                    />
                                                </FieldBlock>
                                                <FieldBlock icon={<Phone size={13} color="#F5C842" />} label="Contact Phone">
                                                    <input
                                                        type="tel"
                                                        value={formData.patient_phone}
                                                        onChange={e => setFormData({ ...formData, patient_phone: e.target.value })}
                                                        style={styles.input}
                                                        placeholder="(555) 000-0000"
                                                    />
                                                </FieldBlock>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 2: Documents */}
                                    {currentStep === 2 && (
                                        <div>
                                            <div style={styles.stepHeader}>
                                                <h3 style={styles.stepTitle}>Clinical Documentation</h3>
                                                <p style={styles.stepDesc}>Upload the Discharge Summary or Hospital Referral Packet (PDF/JPG).</p>
                                            </div>
                                            
                                            <div style={{ padding: '30px', border: '2px dashed #DCCCEF', borderRadius: 20, textAlign: 'center', background: '#F8F6FE' }}>
                                                <FilePlus size={32} color="#9B72CF" style={{ marginBottom: 16 }} />
                                                <h4 style={{ margin: '0 0 8px', color: '#1A0A2E', fontWeight: 800 }}>Upload Referral Packet</h4>
                                                <p style={{ margin: '0 0 20px', color: '#7B6B99', fontSize: 13 }}>Format: PDF, JPG, or PNG. Max size 10MB.</p>
                                                
                                                <input 
                                                    type="file" 
                                                    id="referral-docs" 
                                                    multiple 
                                                    hidden 
                                                    onChange={async (e) => {
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
                                                                setClinicalDocs(prev => [...prev, ...data.files]);
                                                            }
                                                        } catch (err) {
                                                            console.error("Upload failed", err);
                                                        } finally {
                                                            setIsUploading(false);
                                                        }
                                                    }}
                                                />
                                                <label htmlFor="referral-docs" style={{ ...styles.continueBtn, display: 'inline-flex', cursor: 'pointer', opacity: isUploading ? 0.6 : 1 }}>
                                                    {isUploading ? 'Uploading Packages...' : 'Select Files to Upload'}
                                                </label>
                                            </div>

                                            {clinicalDocs.length > 0 && (
                                                <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                                                    {/* AI SCAN TRIGGER */}
                                                    <div style={{ background: 'linear-gradient(135deg, #1A0A2E 0%, #2D1452 100%)', padding: '24px', borderRadius: 24, border: '1px solid rgba(245,200,66,0.3)', position: 'relative', overflow: 'hidden' }}>
                                                        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(245,200,66,0.1)', filter: 'blur(20px)' }}></div>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', gap: 20 }}>
                                                            <div style={{ flex: 1 }}>
                                                                <h4 style={{ margin: '0 0 6px', color: '#F5C842', fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Clinical Sentinel</h4>
                                                                <p style={{ margin: 0, color: '#D3BEFF', fontSize: 11, fontWeight: 500 }}>Ready to parse documentation for clinical ICD-10 suggestions.</p>
                                                            </div>
                                                            <button 
                                                                onClick={handlePulseScan}
                                                                disabled={isScanning}
                                                                style={{ ...styles.submitBtn, padding: '10px 20px', borderRadius: 12, border: 'none', background: isScanning ? '#2D1452' : '#F5C842', color: isScanning ? '#F5C842' : '#1A0A2E', cursor: 'pointer' }}
                                                            >
                                                                {isScanning ? <Activity size={14} className="animate-spin" /> : <Zap size={14} />}
                                                                <span style={{ fontWeight: 900 }}>{isScanning ? 'PulseScanning...' : 'Scan Packet'}</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 style={{ fontSize: 13, fontWeight: 900, color: '#6B4FA0', textTransform: 'uppercase', marginBottom: 12 }}>Attached Documents ({clinicalDocs.length})</h4>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                            {clinicalDocs.map((doc, i) => (
                                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#FFF', borderRadius: 12, border: '1px solid #EDE9FE' }}>
                                                                    <CheckCircle2 size={16} color="#10B981" />
                                                                    <div style={{ flex: 1 }}>
                                                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A0A2E' }}>{doc.name}</div>
                                                                        <div style={{ fontSize: 11, color: '#7B6B99' }}>Link attached successfully</div>
                                                                    </div>
                                                                    <button onClick={() => setClinicalDocs(prev => prev.filter((_, idx) => idx !== i))} style={styles.removeBtnSm}><X size={14} /></button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* STEP 3: Clinical Information */}
                                    {currentStep === 3 && (
                                        <div>
                                            <div style={styles.stepHeader}>
                                                <h3 style={styles.stepTitle}>Clinical Information</h3>
                                                <p style={styles.stepDesc}>Identify primary diagnosis and required comorbidities.</p>
                                            </div>
                                            
                                            {/* AI SUGGESTIONS DISPLAY */}
                                            {aiSuggestions && (
                                                <div style={{ background: '#F5FCFA', border: '1px solid #D1FAE5', borderRadius: 24, padding: '24px', marginBottom: 24, position: 'relative' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Zap size={16} color="#fff" />
                                                        </div>
                                                        <div>
                                                            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: '#065F46' }}>AI SUGGESTED CARE PLAN</h4>
                                                            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: aiSuggestions.is_recovery_mode ? '#B45309' : '#059669', textTransform: 'uppercase' }}>
                                                                {aiSuggestions.is_recovery_mode ? 'Heuristic Analysis (Recovery Mode)' : 'Extracted from Clinical Packet'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 20 }}>
                                                        <div style={{ flex: 1, padding: '16px', background: '#fff', borderRadius: 16, border: '1px solid #D1FAE5' }}>
                                                            <div style={{ fontSize: 9, fontWeight: 900, color: '#059669', marginBottom: 8, textTransform: 'uppercase' }}>Primary Suggestion</div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                                <span style={{ padding: '3px 8px', background: '#ECFDF5', color: '#059669', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>{aiSuggestions.primary.code}</span>
                                                                <span style={{ fontSize: 13, fontWeight: 700, color: '#064E3B' }}>{aiSuggestions.primary.description}</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => applyAiCode(aiSuggestions.primary, true)}
                                                                style={{ marginTop: 12, width: '100%', padding: '10px', background: '#10B981', color: '#fff', border: 'none', borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                                                            >
                                                                Apply Primary Diagnosis
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                                {/* Primary */}
                                                <div>
                                                    <label style={styles.fieldLabel}>
                                                        <ShieldCheck size={13} color="#F5C842" /> Primary Diagnosis *
                                                    </label>
                                                    {primaryDiagnosis ? (
                                                        <div style={styles.diagnosisSelected}>
                                                            <div style={{ flex: 1 }}>
                                                                 <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                                                    <span style={styles.icdBadge}>{primaryDiagnosis.code}</span>
                                                                    <span style={styles.confirmedTag}>✓ Confirmed</span>
                                                                </div>
                                                                <div style={styles.diagnosisDesc}>{primaryDiagnosis.description}</div>
                                                            </div>
                                                            <button onClick={() => { setPrimaryDiagnosis(null); setSearchQuery(''); }} style={styles.removeBtn}><X size={16} /></button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ position: 'relative' }}>
                                                            <div style={styles.searchContainer}>
                                                                <Search size={18} color="#9B72CF" style={{ position: 'absolute', left: 16 }} />
                                                                <input 
                                                                    type="text"
                                                                    value={searchTarget === 'primary' ? searchQuery : ''}
                                                                    onChange={(e) => {
                                                                        setSearchQuery(e.target.value);
                                                                        setSearchTarget('primary');
                                                                        setIsSearching(true);
                                                                    }}
                                                                    placeholder="Search ICD-10 code or condition..."
                                                                    style={styles.inputSearch}
                                                                />
                                                            </div>
                                                            {isSearching && searchTarget === 'primary' && searchQuery.length > 0 && (
                                                                <div style={styles.integratedResults}>
                                                                    <ICD10Search 
                                                                        isEmbedded={true}
                                                                        hideSearch={true}
                                                                        externalQuery={searchQuery}
                                                                        onSelect={(codeData) => {
                                                                            setPrimaryDiagnosis(codeData);
                                                                            setIsSearching(false);
                                                                            setSearchQuery('');
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Secondary */}
                                                <div>
                                                    <label style={styles.fieldLabel}>
                                                        <Plus size={13} color="#9B72CF" /> Secondary Diagnoses (Optional)
                                                    </label>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                        {secondaryDiagnoses.map((d, i) => (
                                                            <div key={i} style={styles.secondaryRow}>
                                                                <span style={styles.secondaryNum}>{i + 1}</span>
                                                                <span style={styles.secondaryCode}>{d.code}</span>
                                                                <span style={styles.secondaryDesc}>{d.description}</span>
                                                                <button onClick={() => setSecondaryDiagnoses(prev => prev.filter(x => x.code !== d.code))} style={styles.removeBtnSm}><X size={12} /></button>
                                                        </div>
                                                        ))}
                                                        
                                                        {secondaryDiagnoses.length < 5 && (
                                                            <div style={{ position: 'relative', marginTop: 8 }}>
                                                                <div style={styles.searchContainerSmall}>
                                                                    <Plus size={14} color="#9B72CF" style={{ position: 'absolute', left: 16 }} />
                                                                    <input 
                                                                        type="text"
                                                                        value={searchTarget === 'secondary' ? searchQuery : ''}
                                                                        onChange={(e) => {
                                                                            setSearchQuery(e.target.value);
                                                                            setSearchTarget('secondary');
                                                                            setIsSearching(true);
                                                                        }}
                                                                        placeholder="Add secondary diagnosis (comorbidity)..."
                                                                        style={styles.inputSearchSmall}
                                                                    />
                                                                </div>
                                                                {isSearching && searchTarget === 'secondary' && searchQuery.length > 0 && (
                                                                    <div style={styles.integratedResults}>
                                                                        <ICD10Search 
                                                                            isEmbedded={true}
                                                                            hideSearch={true}
                                                                            externalQuery={searchQuery}
                                                                            onSelect={(codeData) => {
                                                                                setSecondaryDiagnoses(prev => [...prev, codeData]);
                                                                                setIsSearching(false);
                                                                                setSearchQuery('');
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* PDGM Modifiers (Admission Source, timing etc) */}
                                                <div style={{ borderTop: '1px solid #F3EFF9', paddingTop: 24, marginTop: 12 }}>
                                                    <h4 style={{ ...styles.fieldLabel, marginBottom: 16 }}>
                                                        <Activity size={13} color={GOLD} /> PDGM Clinical Modifiers
                                                    </h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                                        <div>
                                                            <label style={{ ...styles.fieldLabel, fontSize: 9 }}>Admission Source</label>
                                                            <div style={{ display: 'flex', background: '#F8F6FE', padding: '4px', borderRadius: 12, marginTop: 4 }}>
                                                                <button onClick={() => setAdmissionSource('community')} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 800, background: admissionSource === 'community' ? WHITE : 'transparent', color: admissionSource === 'community' ? PURPLE_DARK : PURPLE_SOFT, boxShadow: admissionSource === 'community' ? SHADOW_SM : 'none' }}>COMMUNITY</button>
                                                                <button onClick={() => setAdmissionSource('institutional')} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 800, background: admissionSource === 'institutional' ? WHITE : 'transparent', color: admissionSource === 'institutional' ? PURPLE_DARK : PURPLE_SOFT, boxShadow: admissionSource === 'institutional' ? SHADOW_SM : 'none' }}>INSTITUTIONAL</button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label style={{ ...styles.fieldLabel, fontSize: 9 }}>Episode Timing</label>
                                                            <div style={{ display: 'flex', background: '#F8F6FE', padding: '4px', borderRadius: 12, marginTop: 4 }}>
                                                                <button onClick={() => setEpisodeTiming('early')} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 800, background: episodeTiming === 'early' ? WHITE : 'transparent', color: episodeTiming === 'early' ? PURPLE_DARK : PURPLE_SOFT, boxShadow: episodeTiming === 'early' ? SHADOW_SM : 'none' }}>EARLY</button>
                                                                <button onClick={() => setEpisodeTiming('late')} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 800, background: episodeTiming === 'late' ? WHITE : 'transparent', color: episodeTiming === 'late' ? PURPLE_DARK : PURPLE_SOFT, boxShadow: episodeTiming === 'late' ? SHADOW_SM : 'none' }}>LATE</button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label style={{ ...styles.fieldLabel, fontSize: 9 }}>Functional Level</label>
                                                            <div style={{ display: 'flex', background: '#F8F6FE', padding: '2px', borderRadius: 10, marginTop: 4 }}>
                                                                {['low', 'medium', 'high'].map(l => (
                                                                    <button key={l} onClick={() => setFunctionalLevel(l)} style={{ flex: 1, padding: '6px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', background: functionalLevel === l ? WHITE : 'transparent', color: functionalLevel === l ? PURPLE_DARK : PURPLE_SOFT, boxShadow: functionalLevel === l ? SHADOW_SM : 'none' }}>{l}</button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label style={{ ...styles.fieldLabel, fontSize: 9 }}>Comorbidity Adjustment</label>
                                                            <div style={{ display: 'flex', background: '#F8F6FE', padding: '2px', borderRadius: 10, marginTop: 4 }}>
                                                                {['none', 'low', 'high'].map(l => (
                                                                    <button key={l} onClick={() => setComorbidityAdjustment(l)} style={{ flex: 1, padding: '6px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', background: comorbidityAdjustment === l ? WHITE : 'transparent', color: comorbidityAdjustment === l ? PURPLE_DARK : PURPLE_SOFT, boxShadow: comorbidityAdjustment === l ? SHADOW_SM : 'none' }}>{l}</button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 4: Requested Services */}
                                    {currentStep === 4 && (
                                        <div>
                                            <div style={styles.stepHeader}>
                                                <h3 style={styles.stepTitle}>Requested Services</h3>
                                                <p style={styles.stepDesc}>Select the home health disciplines required for this patient.</p>
                                            </div>
                                            <div style={styles.servicesGrid}>
                                                {AVAILABLE_SERVICES.map(service => {
                                                    const active = selectedServices.includes(service);
                                                    return (
                                                        <button
                                                            key={service}
                                                            type="button"
                                                            onClick={() => toggleService(service)}
                                                            style={{ ...styles.serviceBtn, ...(active ? styles.serviceBtnActive : {}) }}
                                                        >
                                                            <span style={{ fontWeight: 700, fontSize: 13 }}>{service}</span>
                                                            <div style={{ ...styles.serviceCheck, ...(active ? styles.serviceCheckActive : {}) }}>
                                                                {active && <CheckCircle2 size={13} color="#fff" />}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 5 */}
                                    {currentStep === 5 && (
                                        <div>
                                            <div style={styles.stepHeader}>
                                                <h3 style={styles.stepTitle}>Referral Audit Summary</h3>
                                                <p style={styles.stepDesc}>Verify all clinical and administrative details before submission.</p>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                                    <div>
                                                        <div style={styles.reviewLabel}>Patient</div>
                                                        <div style={styles.reviewPatientCard}>
                                                            <div style={styles.reviewAvatar}>{formData.patient_first_name?.charAt(0) || '?'}</div>
                                                            <div>
                                                                <div style={{ fontWeight: 800, color: '#1A0A2E', fontSize: 15 }}>{getFullName()}</div>
                                                                <div style={{ fontSize: 11, color: '#7B6B99', marginTop: 2 }}>Born: {formData.patient_dob}</div>
                                                                {formData.patient_phone && <div style={{ fontSize: 11, color: '#7B6B99' }}>{formData.patient_phone}</div>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={styles.reviewLabel}>Selected Services</div>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                            {selectedServices.map(s => (
                                                                <span key={s} style={styles.serviceTag}>{s}</span>
                                                            ))}
                                                            {selectedServices.length === 0 && <span style={{ fontSize: 12, color: '#9B72CF', fontStyle: 'italic' }}>No services selected.</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={styles.reviewLabel}>Audit Pre-Check</div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                        <CheckRow ok={!!getFullName()} label="Patient Details Captured" />
                                                        <CheckRow ok={!!primaryDiagnosis} label="Primary Diagnosis Validated" />
                                                        <CheckRow ok={selectedServices.length > 0} label="Service Disciplines Selected" optional />
                                                        <CheckRow ok={!!aiSuggestions} label="AI Sentinel Audit Performed" optional />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* AI CLINICAL SENTINEL STATUS IN SUMMARY */}
                                            {aiSuggestions && (
                                                <div style={{ ...styles.cmsCard, marginTop: 28 }}>
                                                    <div style={styles.cmsGlow}></div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(245,200,66,0.2)', border: '1px solid #F5C842', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <ShieldCheck size={24} color="#F5C842" />
                                                        </div>
                                                        <div>
                                                            <div style={styles.cmsTitle}>Audit Intelligence: Online</div>
                                                            <p style={styles.cmsDesc}>This referral has been cross-referenced with documentation using {aiSuggestions.is_recovery_mode ? 'Predictive Heuristics' : 'AI Sentinel Document Extractions'}.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {status.message && (
                                                <div style={{
                                                    ...styles.statusAlert,
                                                    ...(status.type === 'success' ? styles.alertSuccess : status.type === 'error' ? styles.alertError : styles.alertInfo)
                                                }}>
                                                    {status.type === 'success' ? <CheckCircle2 size={20} /> : status.type === 'error' ? <AlertCircle size={20} /> : <Activity size={20} />}
                                                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{status.message}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div style={styles.cardFooter}>
                                    <button
                                        disabled={currentStep === 1}
                                        onClick={() => setCurrentStep(p => p - 1)}
                                        style={{ ...styles.backBtn, opacity: currentStep === 1 ? 0 : 1 }}
                                    >
                                        <ChevronLeft size={14} /> Back
                                    </button>
                                    {currentStep < 5 ? (
                                        <button
                                            onClick={() => setCurrentStep(p => p + 1)}
                                            style={styles.continueBtn}
                                        >
                                            Continue to Step {currentStep + 1} <ChevronRight size={14} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={status.type === 'loading' || !primaryDiagnosis || !getFullName()}
                                            style={{ ...styles.submitBtn, opacity: (status.type === 'loading' || !primaryDiagnosis || !getFullName()) ? 0.5 : 1 }}
                                        >
                                            {status.type === 'loading' ? 'Transmitting...' : <>Submit Referral &amp; Log Audit <CheckCircle2 size={14} /></>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Intelligence panel */}
                        <div style={styles.intelCol}>
                            {primaryDiagnosis ? (
                                <div style={styles.intelCard}>
                                    <div style={styles.intelHeader}>Diagnosis Intelligence</div>
                                    <div>
                                        <div style={styles.intelSectionLabel}>PDGM Clinical Group</div>
                                        <div style={styles.pdgmBadge}>{primaryDiagnosis.pdgm_grouping}</div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div style={styles.intelMetric}>
                                            <div style={styles.intelMetricLabel}>Adjusted Weight</div>
                                            <div style={styles.intelMetricValue}>
                                                <TrendingUp size={12} color="#F5C842" /> {analytics.weight}
                                            </div>
                                        </div>
                                        <div style={styles.intelMetric}>
                                            <div style={styles.intelMetricLabel}>Est. Reimb.</div>
                                            <div style={{ ...styles.intelMetricValue, color: GOLD }}>
                                                <DollarSign size={12} color={GOLD} /> {analytics.amount}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={styles.intelSectionLabel}>Clinical Documentation Tips</div>
                                        {primaryDiagnosis.tips?.map((tip, idx) => (
                                            <div key={idx} style={styles.tipRow}>
                                                <div style={styles.tipDot} />
                                                <p style={styles.tipText}>{tip}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div style={styles.intelEmpty}>
                                    <div style={styles.intelEmptyIcon}><Info size={22} color="#6B4FA0" /></div>
                                    <div style={styles.intelEmptyTitle}>Intelligence Offline</div>
                                    <p style={styles.intelEmptyDesc}>Select a primary diagnosis to unlock PDGM clinical insights and financial projections.</p>
                                </div>
                            )}

                            <div style={styles.cmsCard}>
                                <div style={styles.cmsGlow} />
                                <Zap size={20} color="#F5C842" style={{ marginBottom: 12 }} />
                                <div style={styles.cmsTitle}>CMS-Ready Referral</div>
                                <p style={styles.cmsDesc}>Your referral data is structured using the PDGM 2024 regulatory model for immediate SOC intake.</p>
                            </div>
                        </div>
                    </div>

                ) : (
                    /* ── HISTORY VIEW ── */
                    <div>
                        {referrals.length === 0 ? (
                            <div style={styles.emptyHistory}>
                                <History size={44} color="#6B4FA0" style={{ marginBottom: 16 }} />
                                <h3 style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 20, color: '#1A0A2E' }}>No Referral History Found</h3>
                                <p style={{ margin: '0 0 24px', color: '#7B6B99', fontSize: 14 }}>Your medical center hasn't submitted any referrals via this portal yet.</p>
                                <button onClick={() => setActiveView('new')} style={styles.continueBtn}>
                                    Send First Referral
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {referrals.map((ref, i) => (
                                    <div key={i} style={styles.referralRow}>
                                        <div style={styles.referralAvatar}>
                                            <User size={20} color="#F5C842" />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 800, fontSize: 16, color: '#1A0A2E' }}>{ref.patient_name}</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
                                                <span style={styles.refMeta}><Calendar size={11} /> {new Date(ref.patient_dob).toLocaleDateString()}</span>
                                                <span style={styles.refMeta}><ClipboardList size={11} /> {ref.diagnosis}</span>
                                            </div>
                                        </div>
                                        <div style={styles.refRight}>
                                            <div style={styles.refDateLabel}>Submitted On</div>
                                            <div style={styles.refDate}>{new Date(ref.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ ...styles.statusPill, ...(ref.status === 'Pending' ? styles.statusPending : styles.statusDone) }}>
                                            {ref.status === 'Pending' ? <Clock size={13} /> : <CheckCircle2 size={13} />}
                                            {ref.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

/* ── Helper sub-components ── */
const FieldBlock = ({ icon, label, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={styles.fieldLabel}>{icon} {label}</label>
        {children}
    </div>
);

const CheckRow = ({ ok, label, optional }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        borderRadius: 12, border: '1px solid',
        background: ok ? '#F0FDF4' : optional ? '#FAF5FF' : '#FFF5F5',
        borderColor: ok ? '#BBF7D0' : optional ? '#E9D5FF' : '#FECACA',
        color: ok ? '#15803D' : optional ? '#7E3AF2' : '#DC2626'
    }}>
        {ok ? <CheckCircle2 size={15} /> : optional ? <Info size={15} /> : <AlertCircle size={15} />}
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
    </div>
);

/* ── Styles ── */
const PURPLE_DARK = '#1A0A2E';
const PURPLE_MID = '#3B1F6A';
const PURPLE_LIGHT = '#6B4FA0';
const PURPLE_SOFT = '#9B72CF';
const GOLD = '#F5C842';
const GOLD_DARK = '#D4A017';
const BG = '#F3EFF9';
const WHITE = '#FFFFFF';
const SHADOW_SM = '0 2px 8px rgba(26,10,46,0.06)';
const SHADOW_MD = '0 8px 32px rgba(26,10,46,0.12)';

const styles = {
    shell: { display: 'flex', minHeight: '100vh', background: BG, fontFamily: "'Segoe UI', system-ui, sans-serif" },

    /* Sidebar */
    sidebar: {
        width: 272, flexShrink: 0, background: PURPLE_DARK,
        display: 'flex', flexDirection: 'column', padding: '32px 24px',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
        boxShadow: '4px 0 24px rgba(26,10,46,0.3)'
    },
    sidebarBrand: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 },
    brandIcon: {
        width: 44, height: 44, borderRadius: 12, background: PURPLE_MID,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `2px solid ${GOLD}`, boxShadow: `0 0 20px rgba(245,200,66,0.25)`
    },
    brandTitle: { fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.1 },
    brandSub: { fontSize: 10, fontWeight: 600, color: PURPLE_SOFT, letterSpacing: '0.12em', textTransform: 'uppercase' },

    nav: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 'auto' },
    navBtn: {
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
        borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer',
        color: PURPLE_SOFT, fontWeight: 700, fontSize: 12, letterSpacing: '0.06em',
        textTransform: 'uppercase', textAlign: 'left', transition: 'all 0.15s'
    },
    navBtnActive: {
        background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_DARK} 100%)`,
        color: PURPLE_DARK, boxShadow: `0 4px 16px rgba(245,200,66,0.35)`
    },

    providerCard: {
        display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16,
        background: PURPLE_MID, borderRadius: 16, marginTop: 28, marginBottom: 16,
        border: `1px solid rgba(245,200,66,0.15)`
    },
    providerAvatar: {
        width: 40, height: 40, borderRadius: 10, background: `rgba(245,200,66,0.1)`,
        border: `1px solid rgba(245,200,66,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    },
    providerSignedIn: { fontSize: 9, fontWeight: 800, color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 },
    providerName: { fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    providerIdLabel: { fontSize: 9, fontWeight: 700, color: PURPLE_SOFT, letterSpacing: '0.1em', textTransform: 'uppercase' },
    providerIdCode: { fontSize: 9, background: 'rgba(255,255,255,0.07)', color: PURPLE_SOFT, padding: '2px 6px', borderRadius: 4, display: 'block', marginTop: 2 },

    logoutBtn: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '11px 16px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.25)',
        background: 'rgba(239,68,68,0.08)', color: '#F87171', cursor: 'pointer',
        fontWeight: 700, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase'
    },

    /* Main */
    main: { flex: 1, padding: '40px 48px', overflowY: 'auto', maxWidth: 1200 },

    header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 },
    pageTitle: { fontSize: 32, fontWeight: 900, color: PURPLE_DARK, margin: 0, letterSpacing: '-0.02em' },
    pageSubtitle: { fontSize: 14, color: PURPLE_LIGHT, marginTop: 6, fontWeight: 500 },
    statusBadge: {
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
        background: '#fff', borderRadius: 16, border: '1px solid #E9D5FF',
        boxShadow: '0 2px 12px rgba(107,79,160,0.08)'
    },
    statusLabel: { fontSize: 9, fontWeight: 800, color: PURPLE_SOFT, letterSpacing: '0.12em', textTransform: 'uppercase' },
    statusValue: { fontSize: 13, fontWeight: 700, color: PURPLE_DARK },

    /* Grid */
    grid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'start' },
    formCol: { display: 'flex', flexDirection: 'column', gap: 20 },
    intelCol: { display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 20 },

    /* Stepper */
    stepper: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#fff', borderRadius: 20, padding: '8px 16px',
        border: '1px solid #E9D5FF', boxShadow: '0 2px 8px rgba(107,79,160,0.06)'
    },
    stepItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 12, color: PURPLE_SOFT },
    stepItemActive: { background: PURPLE_DARK, color: '#fff' },
    stepItemDone: { color: GOLD_DARK },
    stepNum: {
        width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 10, fontWeight: 800, background: '#EDE9FE', color: PURPLE_LIGHT
    },
    stepNumActive: { background: GOLD, color: PURPLE_DARK },
    stepNumDone: { background: GOLD_DARK, color: '#fff' },
    stepLabel: { fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' },

    /* Card */
    card: {
        background: '#fff', borderRadius: 28, border: '1px solid #E9D5FF',
        boxShadow: '0 8px 40px rgba(107,79,160,0.12)', display: 'flex', flexDirection: 'column'
    },
    cardBody: { padding: '36px 40px', flex: 1 },
    cardFooter: {
        padding: '20px 40px', background: '#FAF5FF', borderTop: '1px solid #EDE9FE',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    },

    stepHeader: { paddingBottom: 24, borderBottom: '1px solid #F3EFF9', marginBottom: 28 },
    stepTitle: { fontSize: 20, fontWeight: 900, color: PURPLE_DARK, margin: '0 0 6px', letterSpacing: '-0.01em' },
    stepDesc: { fontSize: 13, color: PURPLE_LIGHT, margin: 0 },

    fieldGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
    fieldLabel: {
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 10, fontWeight: 800, color: PURPLE_SOFT,
        letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2
    },
    input: {
        width: '100%', padding: '13px 16px', borderRadius: 12,
        border: '2px solid #EDE9FE', background: '#FAF5FF',
        fontSize: 13, fontWeight: 600, color: PURPLE_DARK,
        transition: 'border-color 0.15s',
    },

    /* Search Integrated */
    searchContainer: {
        display: 'flex', alignItems: 'center', position: 'relative', width: '100%'
    },
    inputSearch: {
        width: '100%', padding: '14px 16px 14px 48px', borderRadius: 16,
        border: '2px solid #EDE9FE', background: '#FAF5FF',
        fontSize: 14, fontWeight: 600, color: PURPLE_DARK,
        outline: 'none', transition: 'all 0.2s',
        boxShadow: '0 2px 8px rgba(107,79,160,0.04)',
        ':focus': { borderColor: PURPLE_SOFT, background: '#fff', boxShadow: '0 4px 12px rgba(107,79,160,0.1)' }
    },
    searchContainerSmall: {
        display: 'flex', alignItems: 'center', position: 'relative', width: '100%'
    },
    inputSearchSmall: {
        width: '100%', padding: '10px 16px 10px 44px', borderRadius: 12,
        border: '1px solid #EDE9FE', background: '#FAF5FF',
        fontSize: 12, fontWeight: 600, color: PURPLE_DARK,
        outline: 'none', transition: 'all 0.2s',
        ':focus': { borderColor: PURPLE_SOFT, background: '#fff' }
    },
    integratedResults: {
        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
        marginTop: 8, boxShadow: '0 20px 50px rgba(26,10,46,0.15)',
        borderRadius: 16, overflow: 'hidden', background: WHITE, border: '1px solid #EDE9FE'
    },

    /* Diagnosis */
    diagnosisSelected: {
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        padding: '18px 20px', background: '#FAF5FF', border: '2px solid #C4B5FD',
        borderRadius: 18
    },
    icdBadge: { padding: '3px 10px', background: PURPLE_DARK, color: GOLD, borderRadius: 6, fontSize: 11, fontWeight: 800 },
    confirmedTag: { fontSize: 10, fontWeight: 800, color: '#16A34A', letterSpacing: '0.08em', textTransform: 'uppercase' },
    diagnosisDesc: { fontWeight: 700, fontSize: 14, color: PURPLE_DARK },
    removeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: PURPLE_SOFT, padding: 4, borderRadius: 8 },
    removeBtnSm: { background: 'none', border: 'none', cursor: 'pointer', color: PURPLE_SOFT, padding: 2 },
    secondaryRow: {
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        background: '#FAF5FF', border: '1px solid #EDE9FE', borderRadius: 12
    },
    secondaryNum: { fontSize: 10, fontWeight: 800, color: PURPLE_SOFT, width: 16 },
    secondaryCode: { padding: '2px 8px', background: '#EDE9FE', color: PURPLE_MID, borderRadius: 4, fontSize: 10, fontWeight: 800 },
    secondaryDesc: { fontSize: 12, fontWeight: 600, color: PURPLE_DARK, flex: 1 },

    /* Services */
    servicesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    serviceBtn: {
        padding: '18px 20px', borderRadius: 16, border: '2px solid #EDE9FE',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: 'pointer', background: '#FAF5FF', color: PURPLE_DARK, transition: 'all 0.15s'
    },
    serviceBtnActive: {
        border: `2px solid ${GOLD}`, background: `rgba(245,200,66,0.08)`,
        boxShadow: `0 4px 16px rgba(245,200,66,0.2)`
    },
    serviceCheck: {
        width: 22, height: 22, borderRadius: '50%', border: '2px solid #D8B4FE',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    serviceCheckActive: { background: GOLD, border: `2px solid ${GOLD}` },

    /* Review */
    reviewLabel: { fontSize: 10, fontWeight: 800, color: PURPLE_SOFT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 },
    reviewPatientCard: {
        display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
        background: '#FAF5FF', border: '1px solid #EDE9FE', borderRadius: 16
    },
    reviewAvatar: {
        width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${PURPLE_MID}, ${PURPLE_LIGHT})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: GOLD, fontWeight: 900, fontSize: 18, flexShrink: 0
    },
    serviceTag: {
        padding: '5px 12px', background: PURPLE_DARK, color: GOLD,
        borderRadius: 20, fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase'
    },

    /* Status alert */
    statusAlert: {
        display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
        borderRadius: 16, border: '1px solid', marginTop: 20
    },
    alertSuccess: { background: '#F0FDF4', borderColor: '#BBF7D0', color: '#15803D' },
    alertError: { background: '#FFF5F5', borderColor: '#FECACA', color: '#DC2626' },
    alertInfo: { background: '#EFF6FF', borderColor: '#BFDBFE', color: '#1D4ED8' },

    /* Buttons */
    backBtn: {
        display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        cursor: 'pointer', color: PURPLE_SOFT, fontWeight: 800, fontSize: 10,
        letterSpacing: '0.08em', textTransform: 'uppercase'
    },
    continueBtn: {
        display: 'flex', alignItems: 'center', gap: 8, padding: '13px 26px',
        background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_DARK} 100%)`,
        color: PURPLE_DARK, border: 'none', borderRadius: 14, cursor: 'pointer',
        fontWeight: 800, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
        boxShadow: `0 4px 20px rgba(245,200,66,0.4)`
    },
    submitBtn: {
        display: 'flex', alignItems: 'center', gap: 8, padding: '13px 28px',
        background: `linear-gradient(135deg, ${PURPLE_MID} 0%, ${PURPLE_DARK} 100%)`,
        color: GOLD, border: `1px solid ${GOLD}`, borderRadius: 14, cursor: 'pointer',
        fontWeight: 800, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
        boxShadow: `0 4px 20px rgba(245,200,66,0.25)`
    },

    /* Intelligence Panel */
    intelCard: {
        background: PURPLE_DARK, borderRadius: 24, padding: '28px 24px',
        border: `1px solid rgba(245,200,66,0.2)`, display: 'flex', flexDirection: 'column', gap: 20,
        boxShadow: `0 8px 32px rgba(26,10,46,0.4)`
    },
    intelHeader: { fontSize: 10, fontWeight: 800, color: GOLD, letterSpacing: '0.15em', textTransform: 'uppercase' },
    intelSectionLabel: { fontSize: 9, fontWeight: 800, color: PURPLE_SOFT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 },
    pdgmBadge: {
        padding: '10px 16px', background: PURPLE_MID, borderRadius: 10,
        fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.04em'
    },
    intelMetric: { padding: '12px 14px', background: PURPLE_MID, borderRadius: 12, border: `1px solid rgba(245,200,66,0.1)` },
    intelMetricLabel: { fontSize: 8, fontWeight: 800, color: PURPLE_SOFT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 },
    intelMetricValue: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 900, color: '#fff' },
    tipRow: { display: 'flex', gap: 10, marginBottom: 8 },
    tipDot: { width: 5, height: 5, borderRadius: '50%', background: GOLD, marginTop: 5, flexShrink: 0 },
    tipText: { fontSize: 10, color: PURPLE_SOFT, margin: 0, lineHeight: 1.6, fontStyle: 'italic' },

    intelEmpty: {
        background: '#fff', borderRadius: 24, padding: '36px 24px',
        border: '2px dashed #D8B4FE', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12
    },
    intelEmptyIcon: {
        width: 48, height: 48, borderRadius: '50%', background: '#EDE9FE',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    intelEmptyTitle: { fontSize: 11, fontWeight: 800, color: PURPLE_LIGHT, letterSpacing: '0.1em', textTransform: 'uppercase' },
    intelEmptyDesc: { fontSize: 12, color: PURPLE_SOFT, margin: 0, lineHeight: 1.6 },

    cmsCard: {
        background: `linear-gradient(135deg, ${PURPLE_MID} 0%, ${PURPLE_DARK} 100%)`,
        borderRadius: 24, padding: '24px 22px', border: `1px solid rgba(245,200,66,0.25)`,
        position: 'relative', overflow: 'hidden', boxShadow: `0 8px 32px rgba(26,10,46,0.3)`
    },
    cmsGlow: {
        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        borderRadius: '50%', background: 'rgba(245,200,66,0.15)', filter: 'blur(24px)'
    },
    cmsTitle: { fontSize: 12, fontWeight: 900, color: GOLD, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 },
    cmsDesc: { fontSize: 11, color: 'rgba(211,190,255,0.85)', margin: 0, lineHeight: 1.6, fontWeight: 500 },

    /* History */
    emptyHistory: {
        background: '#fff', padding: '80px 40px', borderRadius: 28,
        border: '1px solid #E9D5FF', textAlign: 'center', display: 'flex',
        flexDirection: 'column', alignItems: 'center'
    },
    referralRow: {
        display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px',
        background: '#fff', borderRadius: 20, border: '1px solid #E9D5FF',
        boxShadow: '0 2px 8px rgba(107,79,160,0.06)', flexWrap: 'wrap'
    },
    referralAvatar: {
        width: 48, height: 48, borderRadius: 14, background: PURPLE_DARK,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        border: `2px solid rgba(245,200,66,0.3)`
    },
    refMeta: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: PURPLE_SOFT, fontWeight: 600 },
    refRight: { textAlign: 'right', marginLeft: 'auto' },
    refDateLabel: { fontSize: 9, fontWeight: 800, color: PURPLE_SOFT, letterSpacing: '0.1em', textTransform: 'uppercase' },
    refDate: { fontSize: 13, fontWeight: 700, color: PURPLE_DARK },
    statusPill: {
        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
        borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
        textTransform: 'uppercase', border: '1px solid', whiteSpace: 'nowrap'
    },
    statusPending: { background: '#EFF6FF', borderColor: '#BFDBFE', color: '#1D4ED8' },
    statusDone: { background: '#F0FDF4', borderColor: '#BBF7D0', color: '#15803D' },

    /* Loading */
    loadingScreen: { minHeight: '100vh', background: PURPLE_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    loadingInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
    loadingLogo: {
        width: 64, height: 64, borderRadius: 20, background: PURPLE_MID,
        border: `2px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 40px rgba(245,200,66,0.3)`
    },
    loadingText: { fontSize: 11, fontWeight: 800, color: PURPLE_SOFT, letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 },

    /* Premium Modal */
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(26,10,46,0.65)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, animation: 'fadeIn 0.3s ease-out'
    },
    modalContent: {
        width: '100%', maxWidth: 460, background: '#fff', 
        borderRadius: 32, padding: '40px 32px 32px',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
        textAlign: 'center', border: `1px solid rgba(245,200,66,0.3)`
    },
    modalClose: {
        position: 'absolute', top: 20, right: 20,
        background: '#FAF5FF', border: 'none', borderRadius: '50%',
        width: 36, height: 36, display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', color: PURPLE_SOFT
    },
    modalIcon: {
        width: 72, height: 72, borderRadius: 24, background: PURPLE_DARK,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px', border: `2px solid ${GOLD}`,
        boxShadow: `0 8px 24px rgba(245,200,66,0.2)`
    },
    modalTitle: { fontSize: 22, fontWeight: 900, color: PURPLE_DARK, margin: '0 0 12px', letterSpacing: '-0.02em' },
    modalDesc: { fontSize: 14, color: PURPLE_SOFT, margin: '0 0 32px', lineHeight: 1.6, fontWeight: 500 },
    modalActionGrid: { display: 'flex', gap: 12 },
    modalSecondaryBtn: {
        flex: 1, padding: '14px', borderRadius: 16, border: '1px solid #EDE9FE',
        background: '#FAF5FF', color: PURPLE_SOFT, fontWeight: 800, fontSize: 11,
        letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer'
    },
    modalPrimaryBtn: {
        flex: 1.5, padding: '14px', borderRadius: 16, border: 'none',
        background: `linear-gradient(135deg, ${PURPLE_MID} 0%, ${PURPLE_DARK} 100%)`,
        color: GOLD, fontWeight: 800, fontSize: 11, letterSpacing: '0.05em',
        textTransform: 'uppercase', cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center', gap: 6,
        boxShadow: `0 10px 20px rgba(107,79,160,0.2)`
    }
};

export default ProviderDashboard;