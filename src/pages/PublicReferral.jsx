import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Stethoscope,
    User,
    Phone,
    FileText,
    CheckCircle,
    Check,
    Clock,
    PhoneCall,
    Printer,
    Activity,
    Shield,
    FileUp,
    Info,
    TrendingUp,
    Plus,
    X as XIcon,
    Zap,
    HeartPulse,
    ShieldCheck,
    AlertCircle,
    MapPin,
    Heart,
    Globe,
    Search,
    ArrowRight
} from 'lucide-react';
import ICD10Search from '../components/ICD10Search';

/* ── Design Tokens ── */
const PURPLE_DARK = '#1A0A2E';
const PURPLE_MID = '#3B1F6A';
const PURPLE_LIGHT = '#6B4FA0';
const PURPLE_SOFT = '#8E70C2';
const GOLD = '#F5C842';
const WHITE = '#FFFFFF';
const SUCCESS = '#10B981';

const PublicReferral = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [providerInfo, setProviderInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [statusToken, setStatusToken] = useState(null);
    const [primaryDiagnosis, setPrimaryDiagnosis] = useState(null);
    const [secondaryDiagnoses, setSecondaryDiagnoses] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    const [formData, setFormData] = useState({
        patient_name: '',
        patient_dob: '',
        patient_phone: '',
        patient_address: '',
        emergency_contact: '',
        preferred_language: 'English',
        insurance_provider: '',
        insurance_policy: '',
        referral_priority: 'Routine',
        soc_request: 'Routine', // Within 24h, 48h, Routine
        physician_name: '',
        physician_npi: '',
        diagnosis: '',
        services_needed: '',
        documents_provided: false
    });

    useEffect(() => {
        if (token) fetchProvider();
    }, [token]);

    const fetchProvider = async () => {
        try {
            const res = await fetch(`/api/public/provider-info/${token}`);
            if (!res.ok) throw new Error('Invalid or expired referral link.');
            const data = await res.json();
            setProviderInfo(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSumbit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/public/referrals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    token,
                    primary_diagnosis: primaryDiagnosis,
                    secondary_diagnoses: secondaryDiagnoses
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Submission failed.');
            setStatusToken(data.status_token);
            setSubmitted(true);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectDiagnosis = (item, type) => {
        if (type === 'primary') {
            setPrimaryDiagnosis(item);
        } else {
            if (!secondaryDiagnoses.find(d => d.code === item.code)) {
                setSecondaryDiagnoses([...secondaryDiagnoses, item]);
            }
        }
        setIsSearching(false);
    };

    const removeSecondary = (code) => {
        setSecondaryDiagnoses(secondaryDiagnoses.filter(d => d.code !== code));
    };

    if (loading && !providerInfo) return <div style={styles.loader}>Secure Connection Initializing...</div>;

    if (error) return (
        <div style={styles.errorContainer}>
            <AlertCircle size={48} color="#EF4444" />
            <h2 style={styles.errorTitle}>Link Inactive</h2>
            <p style={styles.errorText}>{error}</p>
            <button onClick={() => navigate('/')} style={styles.backHomeBtn}>Back to Home</button>
        </div>
    );

    if (submitted) return (
        <div style={styles.successContainer}>
            <div style={styles.successIcon}><CheckCircle2 size={64} color={SUCCESS} /></div>
            <h2 style={styles.successTitle}>Referral Confirmed</h2>
            <p style={styles.successText}>
                The transition of care for <strong>{formData.patient_name}</strong> is now in process.
                Our team is reviewing the clinical data.
            </p>

            {/* Pipeline Visualization */}
            <div style={styles.pipeline}>
                {[
                    { label: 'Submitted', icon: <Check size={14} />, active: true, current: false },
                    { label: 'Intake Review', icon: <Clock size={14} />, active: true, current: true },
                    { label: 'Accepted', icon: <Zap size={14} />, active: false, current: false },
                    { label: 'Start Care', icon: <HeartPulse size={14} />, active: false, current: false }
                ].map((s, i, arr) => (
                    <React.Fragment key={i}>
                        <div style={styles.pipelineStep(s.active, s.current)}>
                            <div style={styles.pipelineIcon(s.active, s.current)}>{s.icon}</div>
                            <div style={styles.pipelineLabel}>{s.label}</div>
                        </div>
                        {i < arr.length - 1 && <div style={styles.pipelineLine(arr[i + 1].active)} />}
                    </React.Fragment>
                ))}
            </div>

            {/* Status Link Card */}
            <div style={{
                background: '#F8FAFC', padding: '24px 32px', borderRadius: 24,
                border: '1.5px solid #F1F5F9', marginBottom: 40, position: 'relative',
                maxWidth: 500, width: '100%', textAlign: 'left'
            }}>
                <div style={{ position: 'absolute', top: -12, left: 24, background: WHITE, padding: '2px 12px', borderRadius: 8, fontSize: 10, fontWeight: 900, color: PURPLE_MID, border: '1.5px solid #F1F5F9' }}>
                    SECURE TRACKING
                </div>
                <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 16px', lineHeight: 1.5 }}>
                    Copy this unique secure link to monitor your patient's real-time discharge status.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input
                        readOnly
                        value={`${window.location.origin}/referral-status/${statusToken}`}
                        style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1.5px solid #E2E8F0', fontSize: 12, color: PURPLE_DARK, fontWeight: 600, background: WHITE }}
                    />
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/referral-status/${statusToken}`);
                            alert('Link copied to clipboard');
                        }}
                        style={{ padding: '0 16px', borderRadius: 12, background: PURPLE_MID, color: WHITE, fontSize: 11, fontWeight: 900, cursor: 'pointer', border: 'none' }}
                    >
                        COPY
                    </button>
                    <Link
                        to={`/referral-status/${statusToken}`}
                        style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: 12, border: `1.5px solid ${PURPLE_MID}`, color: PURPLE_MID, fontSize: 11, fontWeight: 900, cursor: 'pointer', textDecoration: 'none' }}
                    >
                        VIEW
                    </Link>
                </div>
            </div>

            <div style={styles.statusCallout}>
                <Clock size={16} color={PURPLE_LIGHT} />
                <span>Estimated clinical response: <strong>15 - 30 Minutes</strong></span>
            </div>

            <button onClick={() => window.location.reload()} style={styles.newRefBtn}>Submit Another Patient</button>
        </div>
    );

    return (
        <div style={styles.container}>
            {/* Value Header */}
            <header style={styles.promoHeader}>
                <div style={styles.brandingSmall}>
                    <ShieldCheck size={20} color={GOLD} />
                    <span>Olympia Homehealth</span>
                </div>
                <h1 style={styles.promoTitle}>Secure Home Health Referral</h1>
                <p style={styles.promoSub}>
                    Fast-Track Intake: Submit in under 60 seconds. <br />
                    <strong>No Faxing Required.</strong>
                </p>
                <div style={styles.hospitalPill}>
                    Partnered Hospital: <strong>{providerInfo?.name}</strong>
                </div>
            </header>

            {/* Wizard Container */}
            <div style={styles.wizardBox}>
                <div style={styles.wizardSidebar}>
                    {[
                        { n: 1, l: 'Patient Info', i: <User size={16} /> },
                        { n: 2, l: 'Insurance & Contact', i: <Shield size={16} /> },
                        { n: 3, l: 'Clinical Orders', i: <Stethoscope size={16} /> },
                        { n: 4, l: 'Documents & Send', i: <FileUp size={16} /> }
                    ].map(s => (
                        <div key={s.n} style={styles.sideStep(s.n === step, s.n < step)}>
                            <div style={styles.sideIcon(s.n === step, s.n < step)}>{s.n < step ? <Check size={14} /> : s.i}</div>
                            <div style={styles.sideLabel}>{s.l}</div>
                        </div>
                    ))}
                </div>

                <div style={styles.wizardContent}>
                    {step === 1 && (
                        <div className="animate-fadeIn">
                            <div style={styles.stepHeader}>
                                <h3 style={styles.stepTitle}>Patient Identity</h3>
                                <div style={styles.stepCounter}>Step 1 of 4</div>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Legal Full Name</label>
                                <input style={styles.input} placeholder="Last, First Middle" value={formData.patient_name} onChange={e => setFormData({ ...formData, patient_name: e.target.value })} />
                            </div>
                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Date of Birth</label>
                                    <input style={styles.input} placeholder="MM/DD/YYYY" value={formData.patient_dob} onChange={e => setFormData({ ...formData, patient_dob: e.target.value })} />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Phone Number</label>
                                    <input style={styles.input} placeholder="(555) 000-0000" value={formData.patient_phone} onChange={e => setFormData({ ...formData, patient_phone: e.target.value })} />
                                </div>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Home Address</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={16} style={{ position: 'absolute', left: 16, top: 18, color: PURPLE_MID, opacity: 0.5 }} />
                                    <input
                                        style={{ ...styles.input, paddingLeft: 44 }}
                                        placeholder="Full service address for home visits"
                                        value={formData.patient_address}
                                        onChange={e => setFormData({ ...formData, patient_address: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Emergency Contact</label>
                                    <div style={{ position: 'relative' }}>
                                        <Heart size={16} style={{ position: 'absolute', left: 16, top: 18, color: PURPLE_MID, opacity: 0.5 }} />
                                        <input
                                            style={{ ...styles.input, paddingLeft: 44 }}
                                            placeholder="Name & Relationship"
                                            value={formData.emergency_contact}
                                            onChange={e => setFormData({ ...formData, emergency_contact: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Preferred Language</label>
                                    <div style={{ position: 'relative' }}>
                                        <Globe size={16} style={{ position: 'absolute', left: 16, top: 18, color: PURPLE_MID, opacity: 0.5 }} />
                                        <input
                                            style={{ ...styles.input, paddingLeft: 44 }}
                                            placeholder="e.g. English, Spanish"
                                            value={formData.preferred_language}
                                            onChange={e => setFormData({ ...formData, preferred_language: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fadeIn">
                            <div style={styles.stepHeader}>
                                <h3 style={styles.stepTitle}>Insurance & Contact</h3>
                                <div style={styles.stepCounter}>Step 2 of 4</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32 }}>
                                <div>
                                    <label style={styles.label}>Referral Urgency</label>
                                    <div style={{ ...styles.priorityGrid, marginBottom: 24 }}>
                                        {['Routine', 'Urgent', 'Same-Day'].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setFormData({ ...formData, referral_priority: p })}
                                                style={styles.priorityBtn(formData.referral_priority === p)}
                                            >
                                                {p === 'Urgent' && <Zap size={14} />}
                                                {p === 'Same-Day' && <Clock size={14} />}
                                                {p}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={styles.row}>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Primary Insurance</label>
                                            <input style={styles.input} placeholder="e.g. Medicare" value={formData.insurance_provider} onChange={e => setFormData({ ...formData, insurance_provider: e.target.value })} />
                                        </div>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Policy / ID #</label>
                                            <input style={styles.input} placeholder="Required for verification" value={formData.insurance_policy} onChange={e => setFormData({ ...formData, insurance_policy: e.target.value })} />
                                        </div>
                                    </div>
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Secondary Insurance (Optional)</label>
                                        <input style={styles.input} placeholder="e.g. Aetna Secondary" />
                                    </div>
                                </div>
                                <div style={{ background: 'rgba(243,239,249,0.5)', padding: 32, borderRadius: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: PURPLE_MID }}>
                                        <ShieldCheck size={20} />
                                        <span style={{ fontWeight: 900, fontSize: 13 }}>Insurance Verified</span>
                                    </div>
                                    <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                                        Our intake team performs real-time eligibility checks once the referral is received.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-fadeIn">
                            <div style={styles.stepHeader}>
                                <h3 style={styles.stepTitle}>Clinical Orders</h3>
                                <div style={styles.stepCounter}>Step 3 of 4</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 32 }}>
                                <div>
                                    <label style={styles.label}>Requested Start of Care</label>
                                    <div style={{ ...styles.priorityGrid, marginBottom: 24 }}>
                                        {[
                                            { label: 'Within 24h', val: '24h' },
                                            { label: 'Within 48h', val: '48h' },
                                            { label: 'Routine', val: 'Routine' }
                                        ].map(s => (
                                            <button
                                                key={s.val}
                                                onClick={() => setFormData({ ...formData, soc_request: s.val })}
                                                style={styles.priorityBtn(formData.soc_request === s.val)}
                                            >
                                                {s.val === '24h' && <Zap size={14} />}
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={styles.row}>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Referring Physician</label>
                                            <input style={styles.input} placeholder="Dr. Name" value={formData.physician_name} onChange={e => setFormData({ ...formData, physician_name: e.target.value })} />
                                        </div>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Physician NPI #</label>
                                            <input style={styles.input} placeholder="10 Digits" value={formData.physician_npi} onChange={e => setFormData({ ...formData, physician_npi: e.target.value })} />
                                        </div>
                                    </div>

                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Diagnosis & Comorbidities (Structured)</label>
                                        <p style={{ fontSize: 13, color: PURPLE_LIGHT, marginBottom: 16 }}>Search ICD-10 codes for real-time validation.</p>

                                        {!primaryDiagnosis && !isSearching ? (
                                            <button
                                                onClick={() => setIsSearching(true)}
                                                style={{
                                                    width: '100%', padding: '24px', border: '2px dashed #E2E8F0',
                                                    borderRadius: 16, background: 'rgba(243,239,249,0.3)', color: PURPLE_MID,
                                                    fontWeight: 800, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10
                                                }}
                                            >
                                                <Search size={24} />
                                                SEARCH ICD-10 OR CONDITION
                                            </button>
                                        ) : isSearching ? (
                                            <div style={{ background: WHITE, borderRadius: 16, border: '1px solid #E2E8F0', padding: 20 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                                    <span style={{ fontSize: 10, fontWeight: 900, color: PURPLE_SOFT, textTransform: 'uppercase' }}>Clinical Search Engine</span>
                                                    <button onClick={() => setIsSearching(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><XIcon size={16} /></button>
                                                </div>
                                                <ICD10Search isEmbedded onSelect={handleSelectDiagnosis} />
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                {/* Primary Code */}
                                                <div style={{ padding: '20px', borderRadius: 20, background: 'rgba(59,31,106,0.03)', border: `1.5px solid ${PURPLE_MID}`, position: 'relative' }}>
                                                    <div style={{ position: 'absolute', top: -10, left: 20, background: PURPLE_MID, color: WHITE, padding: '2px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900 }}>PRIMARY</div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <div>
                                                            <div style={{ fontSize: 12, fontWeight: 900, color: PURPLE_MID, marginBottom: 4 }}>{primaryDiagnosis.code}</div>
                                                            <div style={{ fontSize: 15, fontWeight: 800, color: PURPLE_DARK }}>{primaryDiagnosis.description}</div>
                                                        </div>
                                                        <button onClick={() => setPrimaryDiagnosis(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}><XIcon size={16} /></button>
                                                    </div>
                                                </div>

                                                {/* Secondary Codes */}
                                                {secondaryDiagnoses.map(d => (
                                                    <div key={d.code} style={{ padding: '16px 20px', borderRadius: 16, background: WHITE, border: '1.5px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <div style={{ fontSize: 11, fontWeight: 900, color: PURPLE_SOFT }}>{d.code}</div>
                                                            <div style={{ fontSize: 13, fontWeight: 700, color: PURPLE_DARK }}>{d.description}</div>
                                                        </div>
                                                        <button onClick={() => removeSecondary(d.code)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.3 }}><XIcon size={14} /></button>
                                                    </div>
                                                ))}

                                                <button
                                                    onClick={() => setIsSearching(true)}
                                                    style={{ alignSelf: 'flex-start', padding: '8px 16px', background: 'none', border: `1.5px dashed ${PURPLE_SOFT}`, borderRadius: 10, color: PURPLE_MID, fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                                                >
                                                    <Plus size={14} /> ADD COMORBIDITY
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div style={{
                                        padding: 32, borderRadius: 28, background: WHITE, border: '1.5px solid #F1F5F9',
                                        textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
                                    }}>
                                        <div style={{
                                            width: 54, height: 54, borderRadius: '50%',
                                            background: primaryDiagnosis ? 'rgba(16,185,129,0.1)' : 'rgba(243,239,249,0.5)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: primaryDiagnosis ? '#10B981' : '#DADCE0'
                                        }}>
                                            {primaryDiagnosis ? <CheckCircle size={24} /> : <Info size={20} />}
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: 11, fontWeight: 900, color: PURPLE_DARK, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                                                Triage Score
                                            </h4>
                                            <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                                                {primaryDiagnosis
                                                    ? `${primaryDiagnosis.pdgm_grouping} group detected. Estimated case-mix weight optimized.`
                                                    : 'Automated grouping disabled. Select a code to unlock clinical scoring.'
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: 32, borderRadius: 28, background: 'linear-gradient(135deg, #1A0A2E 0%, #3B1F6A 100%)',
                                        color: WHITE, position: 'relative', overflow: 'hidden'
                                    }}>
                                        <div style={{ position: 'absolute', top: 20, right: 20, opacity: 0.1 }}><Zap size={40} /></div>
                                        <div style={{ position: 'relative', zIndex: 2 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: GOLD, fontWeight: 950, fontSize: 10, marginBottom: 12, textTransform: 'uppercase' }}>
                                                <Zap size={14} /> SOC Intelligence
                                            </div>
                                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0 }}>
                                                Requested start: <strong>{formData.soc_request}</strong>.
                                                System is prioritizing immediate clinician matching based on urgency.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="animate-fadeIn">
                            <div style={styles.stepHeader}>
                                <h3 style={styles.stepTitle}>Documents & Send</h3>
                                <div style={styles.stepCounter}>Step 4 of 4</div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Clinical Hospital Course / Summary</label>
                                <textarea
                                    style={styles.textarea}
                                    placeholder="Enter reasoning for home health services, surgical history, or physical therapy needs..."
                                    value={formData.diagnosis}
                                    onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                                />
                            </div>

                            <div 
                                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={e => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    const files = Array.from(e.dataTransfer.files);
                                    setUploadedFiles(prev => [...prev, ...files]);
                                }}
                                onClick={() => document.getElementById('doc-upload-input').click()}
                                style={{
                                    ...styles.uploadZone,
                                    borderColor: isDragging ? PURPLE_MID : '#F1F0FF',
                                    background: isDragging ? 'rgba(59,31,106,0.04)' : '#FAF9FF',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <input
                                    id="doc-upload-input"
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    style={{ display: 'none' }}
                                    onChange={e => {
                                        const files = Array.from(e.target.files);
                                        setUploadedFiles(prev => [...prev, ...files]);
                                    }}
                                />
                                <FileUp size={32} color={isDragging ? PURPLE_MID : PURPLE_LIGHT} style={{ marginBottom: 12 }} />
                                <div style={styles.uploadText}>
                                    {uploadedFiles.length > 0 ? `${uploadedFiles.length} file(s) selected` : 'Upload Hospital Referral Packet'}
                                </div>
                                <div style={styles.uploadSub}>Face Sheet, D/C Summary, Medication List, Physician Orders</div>
                                <div style={styles.uploadHint}>Click to browse or drag & drop PDF / Images</div>
                            </div>

                            {uploadedFiles.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                                    {uploadedFiles.map((file, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'rgba(59,31,106,0.03)', borderRadius: 12, border: '1.5px solid #F1F0FF' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <FileText size={16} color={PURPLE_MID} />
                                                <span style={{ fontSize: 13, fontWeight: 700, color: PURPLE_DARK }}>{file.name}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>{(file.size / 1024).toFixed(0)} KB</span>
                                                <button onClick={e => { e.stopPropagation(); setUploadedFiles(prev => prev.filter((_, idx) => idx !== i)); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center' }}><XIcon size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={styles.reviewSummary}>
                                <Check size={16} color={SUCCESS} />
                                <span>Generating referral for <strong>{formData.patient_name}</strong> from <strong>{providerInfo?.provider_name || providerInfo?.name}</strong></span>
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div style={styles.controls}>
                        {step > 1 && (
                            <button onClick={() => setStep(step - 1)} style={styles.backBtn}>
                                <ChevronLeft size={18} /> Back
                            </button>
                        )}
                        <div style={{ flex: 1 }} />
                        {step < 4 ? (
                            <button
                                disabled={!formData.patient_name && step === 1}
                                onClick={() => setStep(step + 1)}
                                style={styles.nextBtn}
                            >
                                Next Step <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button onClick={handleSumbit} style={styles.submitBtn}>
                                Finalize & Submit <ArrowRight size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Trust Section */}
            <footer style={styles.trustFooter}>
                <div style={styles.footerGrid}>
                    <div style={styles.footerItem}>
                        <PhoneCall size={18} color={GOLD} />
                        <div>
                            <div style={styles.footerLabel}>Intake Hotline</div>
                            <div style={styles.footerValue}>(555) 123-4567</div>
                        </div>
                    </div>
                    <div style={styles.footerItem}>
                        <Printer size={18} color={GOLD} />
                        <div>
                            <div style={styles.footerLabel}>Secure Fax</div>
                            <div style={styles.footerValue}>(714) 465-2233</div>
                        </div>
                    </div>
                </div>
                <div style={styles.compliance}>
                    <Shield size={12} /> HIPAA COMPLIANT SECURE REFERRAL PORTAL
                </div>
            </footer>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', background: '#F4F7FB', color: PURPLE_DARK, fontFamily: 'inter, system-ui, sans-serif' },

    /* Header Branding */
    promoHeader: {
        textAlign: 'center', padding: '60px 24px 100px',
        background: 'linear-gradient(135deg, #1A0A2E 0%, #3B1F6A 100%)',
        color: WHITE
    },
    brandingSmall: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginBottom: 16 },
    promoTitle: { fontSize: 36, fontWeight: 950, letterSpacing: '-0.02em', margin: '0 0 12px' },
    promoSub: { fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontWeight: 500 },
    hospitalPill: { display: 'inline-block', marginTop: 24, padding: '8px 20px', borderRadius: 40, border: '1px solid rgba(245,200,66,0.3)', background: 'rgba(245,200,66,0.1)', fontSize: 13, color: GOLD },

    /* Wizard Box */
    wizardBox: {
        maxWidth: 1100, margin: '-60px auto 48px', background: WHITE, borderRadius: 32,
        boxShadow: '0 20px 40px -10px rgba(26,10,46,0.15)', overflow: 'hidden', display: 'flex'
    },
    wizardSidebar: { width: 260, background: '#FAF9FF', padding: '56px 32px', borderRight: '1px solid #F1F0FF', display: 'flex', flexDirection: 'column', gap: 28 },
    sideStep: (active, done) => ({ display: 'flex', alignItems: 'center', gap: 16, opacity: active || done ? 1 : 0.4 }),
    sideIcon: (active, done) => ({
        width: 36, height: 36, borderRadius: 12, border: '2.5px solid',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: done ? SUCCESS : active ? WHITE : 'transparent',
        borderColor: done ? SUCCESS : active ? GOLD : '#DDD',
        color: done ? WHITE : active ? PURPLE_MID : '#DDD'
    }),
    sideLabel: { fontSize: 14, fontWeight: 800, color: PURPLE_MID },

    /* Wizard Content */
    wizardContent: { flex: 1, padding: '56px 72px', display: 'flex', flexDirection: 'column' },
    stepHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, borderBottom: '1px solid #F8FAFC', paddingBottom: 20 },
    stepTitle: { fontSize: 24, fontWeight: 950, color: PURPLE_DARK, margin: 0, letterSpacing: '-0.01em' },
    stepCounter: { fontSize: 12, fontWeight: 900, color: PURPLE_LIGHT, textTransform: 'uppercase', letterSpacing: '0.08em' },

    /* Priority Switcher */
    priorityGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
    priorityBtn: (active) => ({
        padding: '16px', borderRadius: 14, border: '2px solid', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontSize: 13, fontWeight: 900, transition: 'all 0.2s',
        background: active ? '#F3EFF9' : WHITE,
        borderColor: active ? PURPLE_MID : '#F1F5F9',
        color: active ? PURPLE_MID : '#94A3B8'
    }),

    /* Form Elements */
    inputGroup: { marginBottom: 20 },
    label: { display: 'block', fontSize: 11, fontWeight: 900, color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' },
    input: { width: '100%', padding: '16px 20px', borderRadius: 14, border: '2.5px solid #F1F5F9', fontSize: 15, fontWeight: 700, color: PURPLE_DARK, outline: 'none', transition: 'border-color 0.2s', ':focus': { borderColor: GOLD } },
    textarea: { width: '100%', padding: '16px 20px', borderRadius: 14, border: '2.5px solid #F1F5F9', fontSize: 15, fontWeight: 700, color: PURPLE_DARK, minHeight: 140, outline: 'none', resize: 'vertical' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
    uploadZone: { padding: '40px', border: '3px dashed #F1F0FF', borderRadius: 24, background: '#FAF9FF', textAlign: 'center', marginBottom: 24 },
    uploadText: { fontSize: 15, fontWeight: 800, color: PURPLE_DARK, marginBottom: 4 },
    uploadSub: { fontSize: 12, color: '#94A3B8', fontWeight: 500, marginBottom: 8 },
    uploadHint: { fontSize: 10, color: PURPLE_LIGHT, fontWeight: 700, fontStyle: 'italic' },
    reviewSummary: { display: 'flex', alignItems: 'center', gap: 10, padding: '16px 24px', background: 'rgba(16,185,129,0.06)', borderRadius: 14, fontSize: 14, color: '#065F46', border: '1px solid rgba(16,185,129,0.1)' },

    /* Controls */
    controls: { marginTop: 'auto', paddingTop: 40, display: 'flex', alignItems: 'center' },
    nextBtn: { padding: '16px 32px', background: PURPLE_MID, color: WHITE, borderRadius: 16, border: 'none', fontWeight: 900, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: `0 8px 24px rgba(59,31,106,0.3)` },
    submitBtn: { padding: '16px 32px', background: GOLD, color: PURPLE_DARK, borderRadius: 16, border: 'none', fontWeight: 950, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: `0 8px 24px rgba(245,200,66,0.4)` },
    backBtn: { background: 'none', border: 'none', color: '#94A3B8', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },

    /* Success & Pipeline Viz */
    successContainer: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 48, background: WHITE },
    successIcon: { marginBottom: 28, animation: 'fadeInUp 0.6s ease-out' },
    successTitle: { fontSize: 32, fontWeight: 950, color: PURPLE_DARK, marginBottom: 16 },
    successText: { fontSize: 16, color: '#64748B', maxWidth: 500, lineHeight: 1.7, marginBottom: 48 },
    pipeline: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48, flexWrap: 'wrap', justifyContent: 'center' },
    pipelineStep: (active, current) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: active ? 1 : 0.3 }),
    pipelineIcon: (active, current) => ({
        width: 44, height: 44, borderRadius: '50%', background: active && !current ? SUCCESS : current ? WHITE : '#DDD',
        color: active && !current ? WHITE : current ? PURPLE_MID : '#FFF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: current ? `3px solid ${GOLD}` : 'none',
        boxShadow: current ? `0 0 20px ${GOLD}66` : 'none'
    }),
    pipelineLabel: { fontSize: 11, fontWeight: 900, color: PURPLE_DARK, textTransform: 'uppercase', letterSpacing: '0.04em' },
    pipelineLine: (active) => ({ width: 40, height: 3, background: active ? SUCCESS : '#EEE', borderRadius: 2 }),
    statusCallout: { display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px', background: '#F8F6FF', borderRadius: 14, fontSize: 14, color: PURPLE_MID, marginBottom: 40 },
    newRefBtn: { padding: '16px 40px', background: PURPLE_MID, color: WHITE, borderRadius: 18, border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer' },

    /* Trust Footer */
    trustFooter: { maxWidth: 1100, margin: '48px auto', textAlign: 'center', borderTop: '1px solid #E2E8F0', paddingTop: 48, paddingBottom: 60 },
    footerGrid: { display: 'flex', justifyContent: 'center', gap: 60, marginBottom: 40 },
    footerItem: { display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' },
    footerLabel: { fontSize: 10, fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 },
    footerValue: { fontSize: 16, fontWeight: 800, color: PURPLE_DARK },
    compliance: { fontSize: 11, fontWeight: 900, color: '#CBD5E1', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },

    /* Error & Loader */
    errorContainer: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 32 },
    errorTitle: { fontSize: 24, fontWeight: 900, color: PURPLE_DARK, margin: '16px 0 8px' },
    errorText: { fontSize: 16, color: '#64748B', marginBottom: 32 },
    backHomeBtn: { padding: '12px 24px', background: PURPLE_MID, color: WHITE, borderRadius: 12, border: 'none', fontWeight: 800 },
    loader: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: PURPLE_LIGHT, letterSpacing: '0.05em', textTransform: 'uppercase' }
};

export default PublicReferral;
