import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    CheckCircle2, 
    Clock, 
    Activity, 
    ShieldCheck, 
    ArrowLeft,
    Loader2,
    AlertCircle,
    Phone,
    MapPin
} from 'lucide-react';

/* ── Design Tokens ── */
const PURPLE_DARK = '#1A0A2E';
const PURPLE_MID = '#3B1F6A';
const PURPLE_LIGHT = '#6B4FA0';
const PURPLE_SOFT = '#A98EDD';
const GOLD = '#F5C842';
const GOLD_DARK = '#D4A017';
const BG = '#F3EFF9';
const WHITE = '#FFFFFF';

const StatusPortal = () => {
    const { token } = useParams();
    const [referral, setReferral] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`/api/public/referral-status/${token}`);
                const data = await res.json();
                if (res.ok) setReferral(data);
                else setError(data.error || 'Link expired or invalid');
            } catch (err) {
                setError('Unable to reach server');
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
        // Poll every 30 seconds for live updates
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, [token]);

    const getStatusStep = (status) => {
        if (status === 'Pending') return 1;
        if (status === 'Processing') return 2;
        if (status === 'Admitted') return 3;
        if (status === 'Rejected') return -1;
        return 1;
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
            <Loader2 size={40} className="animate-spin" color={PURPLE_MID} />
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, padding: 20 }}>
            <div style={{ maxWidth: 400, textAlign: 'center', background: WHITE, padding: 40, borderRadius: 32, boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                <AlertCircle size={60} color="#DC2626" style={{ marginBottom: 20 }} />
                <h2 style={{ color: PURPLE_DARK, marginBottom: 12 }}>Invalid Link</h2>
                <p style={{ color: PURPLE_LIGHT, marginBottom: 24 }}>This tracking link is invalid or has expired. Please contact Olympia Home Health if you believe this is an error.</p>
                <Link to="/" style={{ color: PURPLE_MID, fontWeight: 700, textDecoration: 'none' }}>Return to Homepage</Link>
            </div>
        </div>
    );

    const step = getStatusStep(referral.status);

    return (
        <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Inter, sans-serif', padding: '40px 20px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: PURPLE_MID, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                        <ArrowLeft size={16} /> Dashboard
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src="/log_latest.png" alt="Logo" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                        <span style={{ fontWeight: 900, color: PURPLE_DARK, fontSize: 14 }}>Olympia Referral Pulse</span>
                    </div>
                </div>

                {/* Main Card */}
                <div style={{ background: WHITE, borderRadius: 32, padding: 48, boxShadow: '0 30px 60px rgba(26,10,46,0.08)', border: '1px solid rgba(107,79,160,0.05)' }}>
                    
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: 8, 
                            padding: '8px 16px', background: 'rgba(22,163,74,0.08)', 
                            borderRadius: 100, color: '#16A34A', fontSize: 11, 
                            fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em',
                            marginBottom: 20
                        }}>
                            <Activity size={14} /> Live Tracking Active
                        </div>
                        <h1 style={{ fontSize: 32, fontWeight: 950, color: PURPLE_DARK, margin: '0 0 8px' }}>
                            Referral for {referral.patient}
                        </h1>
                        <p style={{ color: PURPLE_LIGHT, fontSize: 16 }}>
                            Received on {new Date(referral.received_at).toLocaleDateString()} at {new Date(referral.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>

                    {/* Pipeline VIZ */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: 64 }}>
                        {/* Connecting Line */}
                        <div style={{ 
                            position: 'absolute', top: 20, left: 40, right: 40, 
                            height: 4, background: '#E5E7EB', zIndex: 1 
                        }} />
                        <div style={{ 
                            position: 'absolute', top: 20, left: 40, 
                            width: step === 1 ? '0%' : step === 2 ? '50%' : step === 3 ? '100%' : '0%',
                            height: 4, background: step === -1 ? '#DC2626' : '#16A34A', 
                            zIndex: 2, transition: 'width 1s ease-in-out' 
                        }} />

                        {[
                            { label: 'Submitted', sub: 'Awaiting Review', icon: Clock },
                            { label: 'Clinical Review', sub: 'Intake Processing', icon: Activity },
                            { label: 'Accepted', sub: 'Care Ready', icon: ShieldCheck }
                        ].map((s, i) => {
                            const isDone = (i + 1) < step || step === 3;
                            const isCurrent = (i + 1) === step;
                            return (
                                <div key={i} style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', width: 120 }}>
                                    <div style={{ 
                                        width: 44, height: 44, borderRadius: '50%', 
                                        background: isDone ? '#16A34A' : isCurrent ? PURPLE_MID : WHITE,
                                        border: `4px solid ${isDone ? '#DCFCE7' : isCurrent ? '#F3EFF9' : '#F3F4F6'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: isDone || isCurrent ? WHITE : '#9CA3AF',
                                        boxShadow: isCurrent ? '0 0 20px rgba(59,31,106,0.3)' : 'none',
                                        marginBottom: 12
                                    }}>
                                        {isDone ? <CheckCircle2 size={24} /> : <s.icon size={20} />}
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: isCurrent ? PURPLE_DARK : '#6B7280', textAlign: 'center' }}>{s.label}</span>
                                    <span style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textAlign: 'center' }}>{s.sub}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Meta Info */}
                    <div style={{ 
                        background: 'rgba(243,239,249,0.5)', borderRadius: 24, padding: 32,
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24
                    }}>
                        <div>
                            <h4 style={{ fontSize: 10, fontWeight: 900, color: PURPLE_SOFT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Current Status</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: step === -1 ? '#DC2626' : '#16A34A', animate: 'pulse 2s infinite' }} />
                                <span style={{ fontSize: 18, fontWeight: 800, color: PURPLE_DARK }}>
                                    {referral.status === 'Pending' ? 'Triage Reviewing' : 
                                     referral.status === 'Processing' ? 'Coordinator Assigned' : 
                                     referral.status === 'Admitted' ? 'Patient Accepted' : 'Follow-up Needed'}
                                </span>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ fontSize: 10, fontWeight: 900, color: PURPLE_SOFT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Priority Level</h4>
                            <span style={{ 
                                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 900,
                                background: referral.priority === 'Urgent' ? '#FEF2F2' : '#F3EFF9',
                                color: referral.priority === 'Urgent' ? '#DC2626' : PURPLE_MID,
                                border: `1px solid ${referral.priority === 'Urgent' ? '#FCA5A5' : '#EDE9FE'}`
                            }}>
                                {referral.priority || 'Routine'}
                            </span>
                        </div>
                    </div>

                    {/* SLA Message */}
                    <div style={{ marginTop: 40, textAlign: 'center', padding: '24px', border: '1.5px dashed #E5E7EB', borderRadius: 20 }}>
                        <p style={{ color: PURPLE_LIGHT, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                            <strong>SLA Guarantee:</strong> Our intake team aims to process all hospital referrals within <strong>15-30 minutes</strong>. 
                            If you need an immediate bypass, please call our primary clinical line.
                        </p>
                    </div>

                </div>

                {/* Footer Actions */}
                <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 16 }}>
                    <a href="tel:6573770776" style={{ 
                        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', 
                        borderRadius: 14, background: WHITE, color: PURPLE_DARK, 
                        textDecoration: 'none', fontWeight: 800, fontSize: 13, border: '1px solid #E5E7EB'
                    }}>
                        <Phone size={16} color={GOLD_DARK} /> Call Intake
                    </a>
                    <button onClick={() => window.print()} style={{ 
                        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', 
                        borderRadius: 14, background: WHITE, color: PURPLE_DARK, 
                        cursor: 'pointer', fontWeight: 800, fontSize: 13, border: '1px solid #E5E7EB'
                    }}>
                        Print Receipt
                    </button>
                </div>

            </div>
            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.1); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default StatusPortal;
