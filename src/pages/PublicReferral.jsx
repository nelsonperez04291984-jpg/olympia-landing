import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronRight, 
    ChevronLeft, 
    CheckCircle2, 
    Stethoscope, 
    User, 
    Calendar, 
    Phone, 
    FileText, 
    ShieldCheck,
    AlertCircle,
    ArrowRight
} from 'lucide-react';

/* ── Design Tokens ── */
const PURPLE_DARK = '#1A0A2E';
const PURPLE_MID = '#3B1F6A';
const GOLD = '#F5C842';
const WHITE = '#FFFFFF';

const PublicReferral = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [providerInfo, setProviderInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        patient_name: '',
        patient_dob: '',
        patient_phone: '',
        diagnosis: '',
        services_needed: ''
    });

    useEffect(() => {
        fetchProvider();
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
                body: JSON.stringify({ ...formData, token })
            });
            if (!res.ok) throw new Error('Submission failed.');
            setSubmitted(true);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !providerInfo) return <div style={styles.loader}>Initializing Secure Referral Link...</div>;
    
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
            <div style={styles.successIcon}><CheckCircle2 size={64} color={GOLD} /></div>
            <h2 style={styles.successTitle}>Referral Captured</h2>
            <p style={styles.successText}>
                We have received the referral for <strong>{formData.patient_name}</strong>. 
                Our intake team is reviewing it now.
            </p>
            <div style={styles.refInfo}>
                Referring from: <strong>{providerInfo?.name}</strong>
            </div>
            <button onClick={() => window.location.reload()} style={styles.newRefBtn}>Submit Another Referral</button>
        </div>
    );

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.branding}>
                    <ShieldCheck size={24} color={GOLD} />
                    <span style={styles.brandText}>Olympia Homehealth</span>
                </div>
                <div style={styles.hospitalAffiliation}>
                    Referring from: <span style={styles.hospitalName}>{providerInfo?.name}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={styles.progressBar}>
                {[1, 2, 3].map(s => (
                    <div key={s} style={styles.progressStep(s <= step)} />
                ))}
            </div>

            {/* Form Content */}
            <div style={styles.formCard}>
                {step === 1 && (
                    <div className="animate-fadeIn">
                        <div style={styles.stepTitle}>
                            <User size={20} color={PURPLE_MID} />
                            Patient Demographics
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Full Name</label>
                            <input 
                                style={styles.input} 
                                placeholder="Patient's legal name"
                                value={formData.patient_name}
                                onChange={e => setFormData({...formData, patient_name: e.target.value})}
                            />
                        </div>
                        <div style={styles.row}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Date of Birth</label>
                                <input 
                                    style={styles.input} 
                                    placeholder="MM/DD/YYYY"
                                    value={formData.patient_dob}
                                    onChange={e => setFormData({...formData, patient_dob: e.target.value})}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Contact Phone</label>
                                <input 
                                    style={styles.input} 
                                    placeholder="(555) 000-0000"
                                    value={formData.patient_phone}
                                    onChange={e => setFormData({...formData, patient_phone: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fadeIn">
                        <div style={styles.stepTitle}>
                            <Stethoscope size={20} color={PURPLE_MID} />
                            Clinical Details
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Primary Diagnosis/Reason for Referral</label>
                            <textarea 
                                style={styles.textarea} 
                                placeholder="Describe the reason for home health care..."
                                value={formData.diagnosis}
                                onChange={e => setFormData({...formData, diagnosis: e.target.value})}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Services Required (SN, PT, OT, etc.)</label>
                            <input 
                                style={styles.input} 
                                placeholder="e.g. Skilled Nursing and Physical Therapy"
                                value={formData.services_needed}
                                onChange={e => setFormData({...formData, services_needed: e.target.value})}
                            />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fadeIn">
                        <div style={styles.stepTitle}>
                            <FileText size={20} color={PURPLE_MID} />
                            Review & Submit
                        </div>
                        <div style={styles.reviewGrid}>
                            <div style={styles.reviewItem}><strong>Patient:</strong> {formData.patient_name}</div>
                            <div style={styles.reviewItem}><strong>DOB:</strong> {formData.patient_dob}</div>
                            <div style={styles.reviewItem}><strong>Diagnosis:</strong> {formData.diagnosis}</div>
                        </div>
                        <p style={styles.disclaimer}>
                            By clicking submit, you are initiating a transition of care for this patient 
                            to Olympia Homehealth Inc. Our clinical team will respond within 15 minutes.
                        </p>
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
                    {step < 3 ? (
                        <button 
                            disabled={!formData.patient_name && step === 1}
                            onClick={() => setStep(step + 1)} 
                            style={styles.nextBtn}
                        >
                            Next <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button onClick={handleSumbit} style={styles.submitBtn}>
                            Submit Referral <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: '#F8F9FC',
        padding: '24px 16px'
    },
    header: {
        maxWidth: 600,
        margin: '0 auto 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
    },
    branding: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12
    },
    brandText: {
        fontSize: 18,
        fontWeight: 900,
        color: PURPLE_DARK,
        letterSpacing: '-0.02em',
        textTransform: 'uppercase'
    },
    hospitalAffiliation: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: 600
    },
    hospitalName: {
        color: PURPLE_MID,
        fontWeight: 800
    },
    progressBar: {
        maxWidth: 600,
        margin: '0 auto 24px',
        display: 'flex',
        gap: 8
    },
    progressStep: (active) => ({
        flex: 1,
        height: 6,
        borderRadius: 3,
        background: active ? GOLD : '#E2E8F0',
        transition: 'all 0.3s ease'
    }),
    formCard: {
        maxWidth: 600,
        margin: '0 auto',
        background: WHITE,
        borderRadius: 24,
        padding: '32px',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)',
        border: '1px solid #F1F5F9'
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: 900,
        color: PURPLE_DARK,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
    },
    inputGroup: {
        marginBottom: 20
    },
    label: {
        display: 'block',
        fontSize: 12,
        fontWeight: 800,
        color: '#64748B',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: '0.025em'
    },
    input: {
        width: '100%',
        padding: '14px 18px',
        borderRadius: 14,
        border: '2px solid #F1F5F9',
        fontSize: 15,
        color: PURPLE_DARK,
        fontWeight: 600,
        outline: 'none',
        transition: 'border-color 0.2s',
        ':focus': { borderColor: GOLD }
    },
    textarea: {
        width: '100%',
        padding: '14px 18px',
        borderRadius: 14,
        border: '2px solid #F1F5F9',
        fontSize: 15,
        color: PURPLE_DARK,
        fontWeight: 600,
        minHeight: 120,
        resize: 'none',
        outline: 'none'
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16
    },
    controls: {
        marginTop: 32,
        display: 'flex',
        alignItems: 'center'
    },
    nextBtn: {
        padding: '14px 28px',
        background: PURPLE_MID,
        color: WHITE,
        borderRadius: 14,
        border: 'none',
        fontWeight: 800,
        fontSize: 14,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: `0 4px 14px 0 rgba(59,31,106,0.25)`
    },
    submitBtn: {
        padding: '14px 28px',
        background: GOLD,
        color: PURPLE_DARK,
        borderRadius: 14,
        border: 'none',
        fontWeight: 900,
        fontSize: 14,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: `0 4px 14px 0 rgba(245,200,66,0.4)`
    },
    backBtn: {
        background: 'none',
        border: 'none',
        color: '#64748B',
        fontWeight: 800,
        fontSize: 14,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4
    },
    successContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 32,
        background: '#fff'
    },
    successIcon: {
        marginBottom: 24,
        animation: 'fadeInUp 0.6s ease-out'
    },
    successTitle: {
        fontSize: 28,
        fontWeight: 950,
        color: PURPLE_DARK,
        marginBottom: 16
    },
    successText: {
        fontSize: 16,
        color: '#64748B',
        maxWidth: 400,
        lineHeight: 1.6,
        marginBottom: 32
    },
    refInfo: {
        padding: '12px 24px',
        background: '#F8FAFC',
        borderRadius: 12,
        fontSize: 14,
        color: PURPLE_LIGHT,
        marginBottom: 32
    },
    newRefBtn: {
        padding: '14px 32px',
        background: PURPLE_MID,
        color: WHITE,
        borderRadius: 14,
        border: 'none',
        fontWeight: 800,
        fontSize: 14,
        cursor: 'pointer'
    },
    errorContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 32
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 900,
        color: PURPLE_DARK,
        margin: '16px 0 8px'
    },
    errorText: {
        fontSize: 16,
        color: '#64748B',
        marginBottom: 32
    },
    backHomeBtn: {
        padding: '12px 24px',
        background: PURPLE_MID,
        color: WHITE,
        borderRadius: 12,
        border: 'none',
        fontWeight: 800
    },
    loader: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 15,
        fontWeight: 700,
        color: PURPLE_LIGHT,
        letterSpacing: '0.05em',
        textTransform: 'uppercase'
    }
};

export default PublicReferral;
