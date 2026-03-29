import React, { useState, useEffect } from 'react';
import {
    Users,
    FileText,
    MessageSquare,
    ShieldCheck,
    LogOut,
    TrendingUp,
    Clock,
    Activity,
    ArrowRight,
    Search,
    UserPlus,
    Lock,
    Mail,
    UserCircle,
    Trash2,
    AlertTriangle,
    X,
    ClipboardCheck,
    Package,
    CheckCircle,
    AlertCircle,
    Stethoscope
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DiagnosisAssessment from '../components/DiagnosisAssessment';

/* ── Design Tokens (mirrored from ProviderDashboard) ── */
const PURPLE_DARK = '#1A0A2E';
const PURPLE_MID = '#3B1F6A';
const PURPLE_LIGHT = '#6B4FA0';
const PURPLE_SOFT = '#9B72CF';
const GOLD = '#F5C842';
const GOLD_DARK = '#D4A017';
const BG = '#F3EFF9';

const styles = {
    /* Shell */
    shell: { display: 'flex', minHeight: '100vh', background: BG, fontFamily: "'Segoe UI', system-ui, sans-serif" },

    /* ── Sidebar ── */
    sidebar: {
        width: 264, flexShrink: 0, background: PURPLE_DARK,
        display: 'flex', flexDirection: 'column', padding: '32px 20px',
        position: 'fixed', height: '100vh', overflowY: 'auto',
        boxShadow: '4px 0 24px rgba(26,10,46,0.35)', zIndex: 20
    },
    sidebarBrand: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 },
    brandIcon: {
        width: 44, height: 44, borderRadius: 12, background: PURPLE_MID,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `2px solid ${GOLD}`, boxShadow: `0 0 20px rgba(245,200,66,0.25)`, flexShrink: 0
    },
    brandTitle: { fontSize: 17, fontWeight: 900, color: '#fff', lineHeight: 1.1 },
    brandSub: { fontSize: 9, fontWeight: 700, color: PURPLE_SOFT, letterSpacing: '0.14em', textTransform: 'uppercase' },

    nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
    navBtn: {
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
        borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer',
        color: PURPLE_SOFT, fontWeight: 700, fontSize: 11, letterSpacing: '0.06em',
        textTransform: 'uppercase', textAlign: 'left', transition: 'all 0.15s', width: '100%'
    },
    navBtnActive: {
        background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_DARK} 100%)`,
        color: PURPLE_DARK, boxShadow: `0 4px 16px rgba(245,200,66,0.35)`
    },
    navBtnPlain: {
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
        borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer',
        color: PURPLE_SOFT, fontWeight: 700, fontSize: 11, letterSpacing: '0.06em',
        textTransform: 'uppercase', textAlign: 'left', width: '100%'
    },

    staffCard: {
        background: PURPLE_MID, borderRadius: 16, padding: '14px 16px', marginBottom: 12,
        border: `1px solid rgba(245,200,66,0.15)`
    },
    staffSignedInLabel: { fontSize: 9, fontWeight: 800, color: GOLD, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 3 },
    staffName: { fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 4 },
    staffRoleRow: { display: 'flex', alignItems: 'center', gap: 6 },
    staffRoleDot: { width: 6, height: 6, borderRadius: '50%', background: GOLD },
    staffRoleText: { fontSize: 9, fontWeight: 800, color: GOLD, letterSpacing: '0.14em', textTransform: 'uppercase' },

    logoutBtn: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '11px 16px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.25)',
        background: 'rgba(239,68,68,0.08)', color: '#F87171', cursor: 'pointer',
        fontWeight: 700, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', width: '100%'
    },

    /* ── Main ── */
    main: { flex: 1, marginLeft: 264, padding: '40px 48px', overflowY: 'auto' },

    header: {
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 40, flexWrap: 'wrap', gap: 16
    },
    pageTitle: { fontSize: 32, fontWeight: 900, color: PURPLE_DARK, margin: 0, letterSpacing: '-0.02em' },
    pageSubtitle: { fontSize: 14, color: PURPLE_LIGHT, marginTop: 6, fontWeight: 500, margin: '6px 0 0' },
    statusBadge: {
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
        background: '#fff', borderRadius: 16, border: '1px solid #E9D5FF',
        boxShadow: '0 2px 12px rgba(107,79,160,0.08)', height: 'fit-content'
    },
    statusLabel: { fontSize: 9, fontWeight: 800, color: PURPLE_SOFT, letterSpacing: '0.12em', textTransform: 'uppercase' },
    statusValue: { fontSize: 13, fontWeight: 700, color: PURPLE_DARK },

    /* ── Stats Grid ── */
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 40 },
    statCard: {
        background: '#fff', padding: '28px 24px', borderRadius: 24,
        border: '1px solid #E9D5FF', boxShadow: '0 4px 20px rgba(107,79,160,0.08)',
        display: 'flex', alignItems: 'center', gap: 18, cursor: 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s'
    },
    statIconWrap: (bg, border) => ({
        width: 56, height: 56, borderRadius: 16, background: bg, border: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }),
    statLabel: { fontSize: 9, fontWeight: 800, color: PURPLE_SOFT, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 4 },
    statValue: { fontSize: 36, fontWeight: 900, color: PURPLE_DARK, lineHeight: 1 },

    /* ── Two-col grid ── */
    twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },

    /* ── Panel card ── */
    panelCard: {
        background: '#fff', borderRadius: 28, border: '1px solid #E9D5FF',
        boxShadow: '0 4px 24px rgba(107,79,160,0.08)', overflow: 'hidden'
    },
    panelHeader: {
        padding: '24px 32px', borderBottom: '1px solid #F3EFF9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(243,239,249,0.4)'
    },
    panelTitle: { fontSize: 16, fontWeight: 900, color: PURPLE_DARK, margin: 0 },
    panelLink: { fontSize: 11, fontWeight: 800, color: PURPLE_LIGHT, background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase' },

    /* ── Table ── */
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { background: 'rgba(243,239,249,0.6)' },
    th: { padding: '12px 28px', textAlign: 'left', fontSize: 9, fontWeight: 900, color: PURPLE_SOFT, letterSpacing: '0.14em', textTransform: 'uppercase' },
    td: { padding: '18px 28px', borderBottom: '1px solid #F3EFF9', verticalAlign: 'middle' },
    tdName: { fontWeight: 800, color: PURPLE_DARK, fontSize: 14, marginBottom: 3 },
    tdSub: { fontSize: 11, color: PURPLE_SOFT, fontWeight: 500 },

    providerIdBadge: {
        padding: '3px 10px', background: PURPLE_DARK, color: GOLD,
        borderRadius: 6, fontSize: 10, fontWeight: 800, fontFamily: 'monospace'
    },

    deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', color: PURPLE_SOFT, padding: '6px', borderRadius: 8, display: 'flex', alignItems: 'center' },

    /* ── AI Logs ── */
    logsList: { padding: '24px 28px', overflowY: 'auto', maxHeight: 480, display: 'flex', flexDirection: 'column', gap: 16 },
    logItem: { background: 'rgba(243,239,249,0.6)', borderRadius: 18, padding: '20px', border: '1px solid #EDE9FE' },
    logRow: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
    logAvatarUser: {
        width: 30, height: 30, borderRadius: '50%', background: '#EDE9FE',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    },
    logAvatarAI: {
        width: 30, height: 30, borderRadius: '50%', background: PURPLE_MID,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: `0 2px 8px rgba(245,200,66,0.2)`
    },
    logTypeLabel: (color) => ({ fontSize: 9, fontWeight: 900, color, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }),
    logText: { fontSize: 12, color: PURPLE_DARK, fontWeight: 600, lineHeight: 1.5, fontStyle: 'italic', margin: 0 },

    /* ── Modal ── */
    modalOverlay: {
        position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 24, background: 'rgba(26,10,46,0.65)', backdropFilter: 'blur(4px)'
    },
    modal: {
        background: '#fff', borderRadius: 28, maxWidth: 440, width: '100%',
        padding: '40px 36px', boxShadow: '0 24px 80px rgba(26,10,46,0.3)', border: '1px solid #E9D5FF'
    },
    modalIconWrap: {
        width: 60, height: 60, borderRadius: 18, background: '#FFF5F5',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20
    },
    modalTitle: { fontSize: 22, fontWeight: 900, color: PURPLE_DARK, margin: '0 0 10px' },
    modalDesc: { fontSize: 13, color: PURPLE_LIGHT, lineHeight: 1.7, margin: '0 0 28px' },
    modalBtns: { display: 'flex', gap: 12 },
    modalCancelBtn: {
        flex: 1, padding: '14px', background: '#F3EFF9', border: '1px solid #EDE9FE',
        borderRadius: 16, color: PURPLE_LIGHT, fontWeight: 900, fontSize: 10,
        letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer'
    },
    modalDeleteBtn: {
        flex: 1, padding: '14px', background: '#DC2626', border: 'none',
        borderRadius: 16, color: '#fff', fontWeight: 900, fontSize: 10,
        letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(220,38,38,0.3)'
    },

    /* ── Referrals ── */
    referralsBigCard: {
        background: '#fff', borderRadius: 28, border: '1px solid #E9D5FF',
        boxShadow: '0 4px 24px rgba(107,79,160,0.08)', overflow: 'hidden'
    },
    referralsHeader: {
        padding: '24px 32px', borderBottom: '1px solid #F3EFF9',
        background: 'rgba(243,239,249,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    },
    pendingBadge: {
        padding: '6px 14px', background: '#fff', borderRadius: 10, border: '1px solid #EDE9FE',
        fontSize: 10, fontWeight: 800, color: PURPLE_LIGHT, display: 'flex', alignItems: 'center', gap: 6
    },
    pendingDot: { width: 7, height: 7, borderRadius: '50%', background: '#FBBF24' },

    statusPill: (status) => {
        const map = {
            Pending: { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E' },
            Processing: { bg: '#EFF6FF', border: '#BFDBFE', color: '#1D4ED8' },
            Admitted: { bg: '#F0FDF4', border: '#BBF7D0', color: '#15803D' },
            Rejected: { bg: '#FFF5F5', border: '#FECACA', color: '#DC2626' },
        };
        const s = map[status] || { bg: '#F3EFF9', border: '#EDE9FE', color: PURPLE_LIGHT };
        return {
            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px',
            borderRadius: 20, fontSize: 9, fontWeight: 900, letterSpacing: '0.1em',
            textTransform: 'uppercase', border: `1px solid ${s.border}`,
            background: s.bg, color: s.color, whiteSpace: 'nowrap'
        };
    },

    actionIconBtn: (bg, color) => ({
        padding: 7, background: bg, borderRadius: 10, border: 'none',
        cursor: 'pointer', color, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }),

    icdsAssigned: {
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px',
        background: `rgba(245,200,66,0.08)`, border: `1px solid rgba(245,200,66,0.3)`,
        borderRadius: 6, fontSize: 8, fontWeight: 900, color: GOLD_DARK,
        letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 6
    },

    /* ── User Maintenance ── */
    tabBar: {
        display: 'flex', gap: 4, background: 'rgba(243,239,249,0.6)',
        padding: 6, borderRadius: 20, marginBottom: 28
    },
    tabBtn: (active, accent) => ({
        flex: 1, padding: '12px 20px', borderRadius: 16,
        border: active ? '1px solid #E9D5FF' : 'none',
        background: active ? '#fff' : 'transparent',
        color: active ? accent : PURPLE_SOFT,
        fontWeight: 900, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
        cursor: 'pointer', boxShadow: active ? '0 2px 8px rgba(107,79,160,0.1)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
    }),

    createBtn: (accent) => ({
        display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px',
        background: accent === GOLD ? `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})` : `linear-gradient(135deg, ${PURPLE_MID}, ${PURPLE_DARK})`,
        color: accent === GOLD ? PURPLE_DARK : GOLD,
        border: accent === GOLD ? 'none' : `1px solid ${GOLD}`,
        borderRadius: 14, cursor: 'pointer', fontWeight: 900, fontSize: 10,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        boxShadow: accent === GOLD ? `0 4px 20px rgba(245,200,66,0.35)` : `0 4px 20px rgba(245,200,66,0.2)`
    }),

    /* Form */
    formGrid: {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
        background: 'rgba(243,239,249,0.5)', padding: '36px', borderRadius: 24, border: '1px solid #EDE9FE'
    },
    fieldLabel: {
        display: 'block', fontSize: 9, fontWeight: 800, color: PURPLE_SOFT,
        letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8
    },
    inputWrap: { position: 'relative' },
    inputIcon: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' },
    input: {
        width: '100%', padding: '13px 16px 13px 44px', borderRadius: 12,
        border: '2px solid #EDE9FE', background: '#fff',
        fontSize: 13, fontWeight: 600, color: PURPLE_DARK,
        outline: 'none', boxSizing: 'border-box'
    },
    inputPlain: {
        width: '100%', padding: '13px 16px', borderRadius: 12,
        border: '2px solid #EDE9FE', background: '#fff',
        fontSize: 13, fontWeight: 600, color: PURPLE_DARK,
        outline: 'none', boxSizing: 'border-box'
    },
    select: {
        width: '100%', padding: '13px 16px', borderRadius: 12,
        border: '2px solid #EDE9FE', background: '#fff',
        fontSize: 13, fontWeight: 700, color: PURPLE_DARK,
        outline: 'none', boxSizing: 'border-box', appearance: 'none'
    },
    submitBtn: (accent) => ({
        width: '100%', padding: '16px', borderRadius: 16, border: 'none', cursor: 'pointer',
        background: accent === 'teal'
            ? `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`
            : `linear-gradient(135deg, ${PURPLE_MID}, ${PURPLE_DARK})`,
        color: accent === 'teal' ? PURPLE_DARK : GOLD,
        fontWeight: 900, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
        boxShadow: accent === 'teal' ? `0 6px 24px rgba(245,200,66,0.4)` : `0 6px 24px rgba(245,200,66,0.2)`
    }),

    /* Status messages */
    statusMsg: (type) => ({
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
        borderRadius: 14, marginBottom: 16, fontSize: 12, fontWeight: 700,
        border: '1px solid',
        ...(type === 'success' ? { background: '#F0FDF4', borderColor: '#BBF7D0', color: '#15803D' } :
            type === 'error' ? { background: '#FFF5F5', borderColor: '#FECACA', color: '#DC2626' } :
                { background: '#EFF6FF', borderColor: '#BFDBFE', color: '#1D4ED8' })
    }),

    /* Clinical empty state */
    clinicalEmpty: {
        background: '#fff', borderRadius: 28, border: '1px solid #E9D5FF',
        boxShadow: '0 4px 24px rgba(107,79,160,0.08)', padding: '80px 40px',
        textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'
    },
    clinicalEmptyIcon: {
        width: 80, height: 80, borderRadius: '50%', background: `rgba(245,200,66,0.08)`,
        border: `2px solid rgba(245,200,66,0.2)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24
    },

    searchBar: {
        width: '100%', maxWidth: 420, margin: '0 auto 40px',
        background: 'rgba(243,239,249,0.8)', border: '2px solid #EDE9FE', borderRadius: 24,
        padding: '14px 20px 14px 48px', fontSize: 13, fontWeight: 700, color: PURPLE_DARK,
        outline: 'none', boxSizing: 'border-box'
    },
    searchIconWrap: { position: 'relative', maxWidth: 420, margin: '0 auto 40px' },

    episodeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, textAlign: 'left' },
    episodeCard: {
        padding: '20px', background: 'rgba(243,239,249,0.6)', border: '1px solid #EDE9FE',
        borderRadius: 20, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 4
    },

    /* Login */
    loginShell: {
        minHeight: '100vh', background: PURPLE_DARK,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden'
    },
    loginGlow1: {
        position: 'absolute', top: -60, right: -60, width: 300, height: 300,
        background: `rgba(245,200,66,0.07)`, borderRadius: '50%', filter: 'blur(60px)'
    },
    loginGlow2: {
        position: 'absolute', bottom: -60, left: -60, width: 300, height: 300,
        background: `rgba(107,79,160,0.15)`, borderRadius: '50%', filter: 'blur(60px)'
    },
    loginCard: {
        maxWidth: 420, width: '100%', position: 'relative', zIndex: 1,
        background: `rgba(59,31,106,0.5)`, backdropFilter: 'blur(20px)',
        border: `1px solid rgba(245,200,66,0.15)`, padding: '40px 36px', borderRadius: 28,
        boxShadow: '0 24px 80px rgba(26,10,46,0.5)'
    },
    loginIconWrap: {
        width: 64, height: 64, borderRadius: 20, background: PURPLE_MID,
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        border: `2px solid ${GOLD}`, boxShadow: `0 0 30px rgba(245,200,66,0.25)`
    },
    loginTitle: { fontSize: 28, fontWeight: 900, color: '#fff', textAlign: 'center', margin: '0 0 6px' },
    loginSub: { fontSize: 12, color: PURPLE_SOFT, textAlign: 'center', margin: '0 0 28px' },
    loginLabel: { display: 'block', fontSize: 9, fontWeight: 800, color: PURPLE_SOFT, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 },
    loginInput: {
        width: '100%', padding: '13px 16px', borderRadius: 12,
        border: `2px solid rgba(155,114,207,0.25)`, background: 'rgba(255,255,255,0.06)',
        fontSize: 13, fontWeight: 600, color: '#fff',
        outline: 'none', boxSizing: 'border-box',
        transition: 'border-color 0.15s'
    },
    loginBtn: {
        width: '100%', padding: '15px', marginTop: 8,
        background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
        color: PURPLE_DARK, border: 'none', borderRadius: 14, cursor: 'pointer',
        fontWeight: 900, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
        boxShadow: `0 6px 24px rgba(245,200,66,0.4)`, transition: 'opacity 0.15s'
    },
    loginError: {
        padding: '12px 16px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)',
        borderRadius: 12, color: '#FCA5A5', fontSize: 12, fontWeight: 600, textAlign: 'center', marginBottom: 8
    },
    loginCancelLink: {
        display: 'block', textAlign: 'center', marginTop: 20, paddingTop: 20,
        borderTop: `1px solid rgba(255,255,255,0.06)`, fontSize: 12,
        color: PURPLE_SOFT, textDecoration: 'none', fontWeight: 600
    }
};

const AdminDashboard = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('admin');
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        provider_count: 0, referral_count: 0, staff_count: 0, recent_ai_logs: [], providers: []
    });
    const [staffList, setStaffList] = useState([]);
    const [referrals, setReferrals] = useState([]);
    const [activeEpisode, setActiveEpisode] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [directorySearch, setDirectorySearch] = useState('');
    const navigate = useNavigate();

    const handleAssessAndCode = (referral) => { setActiveEpisode(referral); setActiveTab('clinical'); };
    const handleSaveDiagnosis = (referralId, diagnosisData) => {
        setReferrals(prev => prev.map(r =>
            r.id === referralId
                ? { ...r, status: 'Processing', icd_primary: diagnosisData.primary, icd_secondary: diagnosisData.secondary, pdgm_weight: diagnosisData.weight }
                : r
        ));
        setActiveEpisode(null);
    };

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [mgmtTab, setMgmtTab] = useState('provider');
    const [viewMode, setViewMode] = useState('list');
    const [formData, setFormData] = useState({ provider_id: '', name: '', email: '', password: '', username: '', role: 'admin' });
    const [mgmtStatus, setMgmtStatus] = useState({ type: '', message: '' });
    const [confirmDelete, setConfirmDelete] = useState({ show: false, type: '', id: null, name: '' });

    useEffect(() => {
        const token = localStorage.getItem('olympia_admin_token');
        const role = localStorage.getItem('olympia_admin_role');
        if (token) { setIsLoggedIn(true); setUserRole(role || 'admin'); fetchDashboardData(token); }
        else setIsLoading(false);
    }, []);

    const fetchDashboardData = async (token) => {
        try {
            const [statsRes, staffRes, referralsRes] = await Promise.all([
                fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/staff', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/referrals', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            if (statsRes.ok) setStats(await statsRes.json());
            if (staffRes.ok) setStaffList(await staffRes.json());
            if (referralsRes.ok) setReferrals(await referralsRes.json());
        } catch (err) { console.error("Data fetch error:", err); }
        finally { setIsLoading(false); }
    };

    const handleLogin = async (e) => {
        e.preventDefault(); setIsLoading(true); setError('');
        try {
            const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('olympia_admin_token', data.token);
                localStorage.setItem('olympia_admin_role', data.role);
                setIsLoggedIn(true); setUserRole(data.role);
                fetchDashboardData(data.token);
            } else { setError(data.error || 'Invalid credentials'); setIsLoading(false); }
        } catch { setError('Connection failed. Please try again.'); setIsLoading(false); }
    };

    const handleLogout = () => {
        localStorage.removeItem('olympia_admin_token');
        localStorage.removeItem('olympia_admin_role');
        setIsLoggedIn(false); navigate('/admin');
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setMgmtStatus({ type: 'loading', message: 'Creating account...' });
        const endpoint = mgmtTab === 'provider' ? '/api/admin/providers' : '/api/admin/admins';
        const payload = mgmtTab === 'provider'
            ? { provider_id: formData.provider_id, name: formData.name, email: formData.email, password: formData.password }
            : { username: formData.username, password: formData.password, role: formData.role };
        try {
            const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('olympia_admin_token')}` }, body: JSON.stringify(payload) });
            const data = await res.json();
            if (res.ok) { setMgmtStatus({ type: 'success', message: data.message }); setFormData({ provider_id: '', name: '', email: '', password: '', username: '', role: 'admin' }); fetchDashboardData(localStorage.getItem('olympia_admin_token')); setViewMode('list'); }
            else setMgmtStatus({ type: 'error', message: data.error || 'Creation failed' });
        } catch { setMgmtStatus({ type: 'error', message: 'Connection error' }); }
    };

    const executeDelete = async () => {
        const { type, id } = confirmDelete;
        try {
            const res = await fetch(`/api/admin/${type === 'provider' ? 'providers' : 'admins'}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('olympia_admin_token')}` } });
            if (res.ok) { fetchDashboardData(localStorage.getItem('olympia_admin_token')); setConfirmDelete({ show: false, type: '', id: null, name: '' }); }
            else alert("Failed to delete account.");
        } catch (err) { console.error("Delete error:", err); }
    };

    const handleUpdateReferralStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`/api/admin/referrals/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('olympia_admin_token')}` }, body: JSON.stringify({ status: newStatus }) });
            if (res.ok) fetchDashboardData(localStorage.getItem('olympia_admin_token'));
            else alert("Failed to update status.");
        } catch (err) { console.error("Update status error:", err); }
    };

    /* ────────────── LOGIN SCREEN ────────────── */
    if (!isLoggedIn) {
        return (
            <div style={styles.loginShell}>
                <div style={styles.loginGlow1} />
                <div style={styles.loginGlow2} />
                <div style={styles.loginCard}>
                    <div style={styles.loginIconWrap}><ShieldCheck size={28} color={GOLD} /></div>
                    <h1 style={styles.loginTitle}>Olympia Internal</h1>
                    <p style={styles.loginSub}>Executive Administration Access</p>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={styles.loginLabel}>Staff Username</label>
                            <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
                                style={styles.loginInput} placeholder="Enter username" />
                        </div>
                        <div>
                            <label style={styles.loginLabel}>Access Pass</label>
                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                style={styles.loginInput} placeholder="••••••••" />
                        </div>
                        {error && <div style={styles.loginError}>{error}</div>}
                        <button disabled={isLoading} style={styles.loginBtn}>
                            {isLoading ? 'Verifying Credentials...' : 'Sign In to Audit Dashboard'}
                        </button>
                    </form>
                    <Link to="/" style={styles.loginCancelLink}>Cancel and return to Public Site</Link>
                </div>
            </div>
        );
    }

    /* ────────────── MAIN DASHBOARD ────────────── */
    return (
        <div style={styles.shell}>

            {/* Delete Confirmation Modal */}
            {confirmDelete.show && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalIconWrap}><AlertTriangle size={28} color="#DC2626" /></div>
                        <h3 style={styles.modalTitle}>Confirm Removal</h3>
                        <p style={styles.modalDesc}>
                            Are you sure you want to permanently delete <strong style={{ color: PURPLE_DARK }}>"{confirmDelete.name}"</strong>?
                            This will revoke all access immediately and cannot be undone.
                        </p>
                        <div style={styles.modalBtns}>
                            <button onClick={() => setConfirmDelete({ show: false, type: '', id: null, name: '' })} style={styles.modalCancelBtn}>Cancel</button>
                            <button onClick={executeDelete} style={styles.modalDeleteBtn}>Affirmative, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Sidebar ── */}
            <aside style={styles.sidebar}>
                <div style={styles.sidebarBrand}>
                    <div style={styles.brandIcon}><ShieldCheck size={22} color={GOLD} /></div>
                    <div>
                        <div style={styles.brandTitle}>Olympia</div>
                        <div style={styles.brandSub}>Admin Portal</div>
                    </div>
                </div>

                <nav style={styles.nav}>
                    {[
                        { id: 'overview', icon: <TrendingUp size={16} />, label: 'Dashboard Home' },
                        { id: 'users', icon: <UserPlus size={16} />, label: 'User Maintenance' },
                        { id: 'referrals', icon: <ClipboardCheck size={16} />, label: 'Referral Intake' },
                        { id: 'clinical', icon: <Stethoscope size={16} />, label: 'Clinical Tools' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); if (item.id === 'users') setViewMode('list'); }}
                            style={{ ...styles.navBtn, ...(activeTab === item.id ? styles.navBtnActive : {}) }}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                    <button style={styles.navBtnPlain}>
                        <MessageSquare size={16} /> AI Conversation Logs
                    </button>
                </nav>

                <div style={styles.staffCard}>
                    <div style={styles.staffSignedInLabel}>Signed In As</div>
                    <div style={styles.staffName}>{username || 'Admin'}</div>
                    <div style={styles.staffRoleRow}>
                        <div style={styles.staffRoleDot} />
                        <span style={styles.staffRoleText}>{userRole}</span>
                    </div>
                </div>

                <button onClick={handleLogout} style={styles.logoutBtn}>
                    <LogOut size={15} /> Sign Out
                </button>
            </aside>

            {/* ── Main Content ── */}
            <main style={styles.main}>

                {/* Header */}
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.pageTitle}>
                            {{ overview: 'System Overview', users: 'User Maintenance', referrals: 'Referral Intake', clinical: 'Clinical Tools' }[activeTab]}
                        </h1>
                        <p style={styles.pageSubtitle}>
                            {{ overview: 'Real-time platform metrics and audit logs.', users: 'Manage partner providers and internal staff accounts.', referrals: 'Review and approve incoming patient referrals.', clinical: 'AI-powered clinical coding and PDGM intelligence.' }[activeTab]}
                        </p>
                    </div>
                    <div style={styles.statusBadge}>
                        <Activity size={18} color={GOLD} />
                        <div>
                            <div style={styles.statusLabel}>System Live</div>
                            <div style={styles.statusValue}>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </div>
                    </div>
                </header>

                {/* ── OVERVIEW ── */}
                {activeTab === 'overview' && (
                    <>
                        <div style={styles.statsGrid}>
                            {[
                                { label: 'Total Providers', value: stats.provider_count, icon: <Users size={26} color={PURPLE_LIGHT} />, bg: '#F3EFF9', border: '#E9D5FF' },
                                { label: 'Total Referrals', value: stats.referral_count, icon: <FileText size={26} color={GOLD_DARK} />, bg: `rgba(245,200,66,0.08)`, border: `rgba(245,200,66,0.25)` },
                                { label: 'Staff Accounts', value: stats.staff_count, icon: <ShieldCheck size={26} color={PURPLE_MID} />, bg: '#EDE9FE', border: '#D8B4FE' },
                                { label: 'AI Logs Retained', value: stats.recent_ai_logs.length, icon: <MessageSquare size={26} color={PURPLE_SOFT} />, bg: '#FAF5FF', border: '#E9D5FF' },
                            ].map((s, i) => (
                                <div key={i} style={styles.statCard}>
                                    <div style={styles.statIconWrap(s.bg, s.border)}>{s.icon}</div>
                                    <div>
                                        <div style={styles.statLabel}>{s.label}</div>
                                        <div style={styles.statValue}>{s.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={styles.twoCol}>
                            {/* Providers table */}
                            <div style={styles.panelCard}>
                                <div style={styles.panelHeader}>
                                    <h3 style={styles.panelTitle}>Registered Providers</h3>
                                    <button onClick={() => { setActiveTab('users'); setViewMode('create'); }} style={styles.panelLink}>Add New</button>
                                </div>
                                <table style={styles.table}>
                                    <thead style={styles.thead}>
                                        <tr>
                                            <th style={styles.th}>Name</th>
                                            <th style={styles.th}>Provider ID</th>
                                            <th style={styles.th}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.providers.map((p, i) => (
                                            <tr key={i}>
                                                <td style={styles.td}>
                                                    <div style={styles.tdName}>{p.name}</div>
                                                    <div style={styles.tdSub}>{p.email}</div>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={styles.providerIdBadge}>{p.provider_id}</span>
                                                </td>
                                                <td style={styles.td}>
                                                    <button onClick={() => setConfirmDelete({ show: true, type: 'provider', id: p.id, name: p.name })} style={styles.deleteBtn}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* AI Logs */}
                            <div style={{ ...styles.panelCard, display: 'flex', flexDirection: 'column' }}>
                                <div style={styles.panelHeader}>
                                    <h3 style={styles.panelTitle}>Recent AI Interactions</h3>
                                    <button style={styles.panelLink}>Full Log</button>
                                </div>
                                <div style={styles.logsList}>
                                    {stats.recent_ai_logs.map((log, i) => (
                                        <div key={i} style={styles.logItem}>
                                            <div style={styles.logRow}>
                                                <div style={styles.logAvatarUser}><Users size={13} color={PURPLE_LIGHT} /></div>
                                                <div>
                                                    <div style={styles.logTypeLabel(PURPLE_SOFT)}>User Query</div>
                                                    <p style={{ ...styles.logText, color: PURPLE_DARK }}>"{log.user_query}"</p>
                                                </div>
                                            </div>
                                            <div style={{ ...styles.logRow, marginBottom: 0 }}>
                                                <div style={styles.logAvatarAI}><Activity size={13} color={GOLD} /></div>
                                                <div>
                                                    <div style={styles.logTypeLabel(GOLD_DARK)}>Assistant Response</div>
                                                    <p style={{ ...styles.logText, color: PURPLE_DARK, fontStyle: 'normal' }}>{log.ai_response}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ── REFERRALS ── */}
                {activeTab === 'referrals' && (
                    <div style={styles.referralsBigCard}>
                        <div style={styles.referralsHeader}>
                            <div>
                                <h3 style={{ ...styles.panelTitle, fontSize: 20, margin: '0 0 4px' }}>Intake Queue</h3>
                                <p style={{ margin: 0, fontSize: 13, color: PURPLE_LIGHT, fontWeight: 500 }}>Processing incoming patient referrals from medical partners.</p>
                            </div>
                            <div style={styles.pendingBadge}>
                                <div style={styles.pendingDot} />
                                {referrals.filter(r => r.status === 'Pending').length} PENDING
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={styles.table}>
                                <thead style={styles.thead}>
                                    <tr>
                                        <th style={styles.th}>Patient Details</th>
                                        <th style={styles.th}>Clinical Info</th>
                                        <th style={styles.th}>Referring Provider</th>
                                        <th style={styles.th}>Status & Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {referrals.map((r, i) => (
                                        <tr key={i}>
                                            <td style={styles.td}>
                                                <div style={styles.tdName}>{r.patient_name}</div>
                                                <div style={{ ...styles.tdSub, display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                                                    <Clock size={11} /> {r.patient_dob}
                                                </div>
                                                <div style={{ ...styles.tdSub, display: 'flex', alignItems: 'center', gap: 5 }}>
                                                    <Mail size={11} /> {r.patient_phone || 'N/A'}
                                                </div>
                                            </td>
                                            <td style={{ ...styles.td, maxWidth: 220 }}>
                                                <div style={{ fontSize: 9, fontWeight: 900, color: PURPLE_SOFT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Diagnosis</div>
                                                <div style={{ fontSize: 12, color: PURPLE_DARK, fontWeight: 700, marginBottom: 8 }}>{r.diagnosis}</div>
                                                <div style={{ fontSize: 9, fontWeight: 900, color: PURPLE_SOFT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Services Needed</div>
                                                <div style={{ fontSize: 11, color: PURPLE_LIGHT, background: 'rgba(243,239,249,0.8)', padding: '6px 10px', borderRadius: 8, fontWeight: 600 }}>{r.services_needed}</div>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.tdName}>{r.provider_name}</div>
                                                <div style={{ fontSize: 9, fontWeight: 800, color: GOLD_DARK, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3 }}>Verified Partner</div>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    <span style={styles.statusPill(r.status)}>{r.status}</span>
                                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                        {r.status === 'Pending' && (
                                                            <button onClick={() => handleUpdateReferralStatus(r.id, 'Processing')} style={styles.actionIconBtn('rgba(59,130,246,0.08)', '#3B82F6')} title="Mark as Processing">
                                                                <Activity size={15} />
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleAssessAndCode(r)} style={styles.actionIconBtn(`rgba(245,200,66,0.1)`, GOLD_DARK)} title="Assess & Code">
                                                            <Stethoscope size={15} />
                                                        </button>
                                                        {r.status === 'Processing' && (
                                                            <button onClick={() => handleUpdateReferralStatus(r.id, 'Admitted')} style={styles.actionIconBtn('rgba(22,163,74,0.08)', '#16A34A')} title="Admit">
                                                                <CheckCircle size={15} />
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleUpdateReferralStatus(r.id, 'Rejected')} style={styles.actionIconBtn('rgba(220,38,38,0.08)', '#DC2626')} title="Reject">
                                                            <X size={15} />
                                                        </button>
                                                    </div>
                                                    {r.icd_primary && (
                                                        <div style={styles.icdsAssigned}>
                                                            <ShieldCheck size={9} /> ICD Codes Assigned
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {referrals.length === 0 && (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '60px 0', textAlign: 'center' }}>
                                                <Package size={40} color="#E9D5FF" style={{ margin: '0 auto 12px', display: 'block' }} />
                                                <p style={{ color: PURPLE_SOFT, fontStyle: 'italic', fontSize: 13, margin: 0 }}>No referrals in the queue yet.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── CLINICAL ── */}
                {activeTab === 'clinical' && (
                    !activeEpisode ? (
                        <div style={styles.clinicalEmpty}>
                            <div style={styles.clinicalEmptyIcon}><Stethoscope size={36} color={GOLD} /></div>
                            <h3 style={{ fontSize: 22, fontWeight: 900, color: PURPLE_DARK, margin: '0 0 10px', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>Clinical Episode Directory</h3>
                            <p style={{ color: PURPLE_LIGHT, fontSize: 13, maxWidth: 400, margin: '0 0 32px', lineHeight: 1.7 }}>
                                Search or select a patient referral to begin the clinical assessment and PDGM coding process.
                            </p>
                            <div style={styles.searchIconWrap}>
                                <Search size={18} color={directorySearch ? GOLD_DARK : PURPLE_SOFT} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                                <input
                                    type="text" value={directorySearch}
                                    onChange={e => setDirectorySearch(e.target.value)}
                                    placeholder="Search by patient name or DOB..."
                                    style={styles.searchBar}
                                />
                            </div>
                            <div style={styles.episodeGrid}>
                                {referrals
                                    .filter(r => r.status !== 'Rejected')
                                    .filter(r =>
                                        r.patient_name.toLowerCase().includes(directorySearch.toLowerCase()) ||
                                        r.patient_dob.includes(directorySearch)
                                    )
                                    .map((r, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveEpisode(r)}
                                            style={styles.episodeCard}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = `0 8px 32px rgba(245,200,66,0.15)`; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#EDE9FE'; e.currentTarget.style.background = 'rgba(243,239,249,0.6)'; e.currentTarget.style.boxShadow = 'none'; }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: '50%', background: PURPLE_MID,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 13, fontWeight: 900, color: GOLD, flexShrink: 0
                                                }}>{r.patient_name.charAt(0)}</div>
                                                <div>
                                                    <div style={{ fontWeight: 900, fontSize: 11, color: PURPLE_DARK, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{r.patient_name}</div>
                                                    <div style={{ fontSize: 10, color: PURPLE_SOFT, fontWeight: 600 }}>DOB: {r.patient_dob}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #EDE9FE' }}>
                                                <span style={{ fontSize: 9, fontWeight: 900, color: GOLD_DARK, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Open Episode</span>
                                                <ArrowRight size={13} color={PURPLE_SOFT} />
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                                <button onClick={() => setActiveEpisode(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 900, color: PURPLE_SOFT, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <X size={13} /> Close Active Episode
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', background: `rgba(245,200,66,0.08)`, border: `1px solid rgba(245,200,66,0.25)`, borderRadius: 20, fontSize: 9, fontWeight: 900, color: GOLD_DARK, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: GOLD }} />
                                    Case Locks in 48h
                                </div>
                            </div>
                            <DiagnosisAssessment referralData={activeEpisode} onSave={(data) => handleSaveDiagnosis(activeEpisode.id, data)} />
                        </div>
                    )
                )}

                {/* ── USER MAINTENANCE ── */}
                {activeTab === 'users' && (
                    <div style={{ ...styles.panelCard, padding: '32px' }}>
                        <div style={styles.tabBar}>
                            <button onClick={() => { setMgmtTab('provider'); setViewMode('list'); setMgmtStatus({ type: '', message: '' }); }}
                                style={styles.tabBtn(mgmtTab === 'provider', GOLD_DARK)}>
                                <Users size={14} /> Partner Providers
                            </button>
                            <button onClick={() => { setMgmtTab('staff'); setViewMode('list'); setMgmtStatus({ type: '', message: '' }); }}
                                style={styles.tabBtn(mgmtTab === 'staff', PURPLE_LIGHT)}>
                                <Lock size={14} /> Internal Staff
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                            <div>
                                <h3 style={{ fontSize: 20, fontWeight: 900, color: PURPLE_DARK, margin: '0 0 4px' }}>
                                    {mgmtTab === 'provider' ? 'Medical Partners' : 'Internal Staff Access'}
                                </h3>
                                <p style={{ margin: 0, fontSize: 13, color: PURPLE_LIGHT }}>Manage and audit existing accounts.</p>
                            </div>
                            <button onClick={() => setViewMode(viewMode === 'list' ? 'create' : 'list')}
                                style={styles.createBtn(viewMode === 'list' ? GOLD : 'back')}>
                                {viewMode === 'list'
                                    ? <><UserPlus size={14} /> Create New</>
                                    : <><ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to List</>}
                            </button>
                        </div>

                        {viewMode === 'list' ? (
                            <div style={{ background: 'rgba(243,239,249,0.5)', borderRadius: 20, border: '1px solid #EDE9FE', overflow: 'hidden' }}>
                                <table style={styles.table}>
                                    <thead style={styles.thead}>
                                        <tr>
                                            <th style={styles.th}>{mgmtTab === 'provider' ? 'Entity Name' : 'Username'}</th>
                                            <th style={styles.th}>{mgmtTab === 'provider' ? 'Direct ID' : 'Tier'}</th>
                                            <th style={styles.th}>Created</th>
                                            <th style={styles.th}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(mgmtTab === 'provider' ? stats.providers : staffList).map((item, i) => (
                                            <tr key={i}>
                                                <td style={styles.td}>
                                                    <div style={styles.tdName}>{mgmtTab === 'provider' ? item.name : item.username}</div>
                                                    <div style={styles.tdSub}>{item.email || (item.role === 'superadmin' ? 'Executive Access' : 'Standard Admin')}</div>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        padding: '4px 10px', borderRadius: 8, fontSize: 9, fontWeight: 900,
                                                        letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid',
                                                        ...(mgmtTab === 'provider'
                                                            ? { background: `rgba(245,200,66,0.08)`, borderColor: `rgba(245,200,66,0.3)`, color: GOLD_DARK }
                                                            : item.role === 'superadmin'
                                                                ? { background: '#EDE9FE', borderColor: '#D8B4FE', color: PURPLE_MID }
                                                                : { background: '#FAF5FF', borderColor: '#E9D5FF', color: PURPLE_LIGHT })
                                                    }}>
                                                        {mgmtTab === 'provider' ? item.provider_id : item.role}
                                                    </span>
                                                </td>
                                                <td style={{ ...styles.td, fontSize: 12, color: PURPLE_SOFT, fontWeight: 600 }}>
                                                    {new Date(item.created_at || Date.now()).toLocaleDateString()}
                                                </td>
                                                <td style={styles.td}>
                                                    <button
                                                        onClick={() => setConfirmDelete({ show: true, type: mgmtTab, id: item.id, name: mgmtTab === 'provider' ? item.name : item.username })}
                                                        disabled={item.username === 'admin'}
                                                        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: item.username === 'admin' ? 'not-allowed' : 'pointer', color: item.username === 'admin' ? '#D8B4FE' : PURPLE_SOFT, fontWeight: 800, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', padding: 0 }}
                                                    >
                                                        <Trash2 size={14} />
                                                        {item.username === 'admin' ? 'System Owner' : 'Delete'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {(mgmtTab === 'provider' ? stats.providers : staffList).length === 0 && (
                                            <tr>
                                                <td colSpan="4" style={{ padding: '48px 0', textAlign: 'center', color: PURPLE_SOFT, fontStyle: 'italic', fontSize: 13 }}>No results found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <form onSubmit={handleCreateAccount} style={styles.formGrid}>
                                {mgmtTab === 'provider' ? (
                                    <>
                                        <div>
                                            <label style={styles.fieldLabel}>Hospital / Doctor Name</label>
                                            <div style={styles.inputWrap}>
                                                <UserCircle size={16} color={PURPLE_SOFT} style={styles.inputIcon} />
                                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={styles.input} placeholder="e.g. Dr. Robert Moore" />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={styles.fieldLabel}>Professional ID (NPI)</label>
                                            <input type="text" required value={formData.provider_id} onChange={e => setFormData({ ...formData, provider_id: e.target.value })} style={styles.inputPlain} placeholder="e.g. NPI-12345" />
                                        </div>
                                        <div>
                                            <label style={styles.fieldLabel}>Secure Email</label>
                                            <div style={styles.inputWrap}>
                                                <Mail size={16} color={PURPLE_SOFT} style={styles.inputIcon} />
                                                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={styles.input} placeholder="partner@clinic.com" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label style={styles.fieldLabel}>Staff Username</label>
                                            <div style={styles.inputWrap}>
                                                <ShieldCheck size={16} color={PURPLE_SOFT} style={styles.inputIcon} />
                                                <input type="text" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} style={styles.input} placeholder="e.g. j.doe_admin" />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={styles.fieldLabel}>Permission Tier</label>
                                            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={styles.select}>
                                                <option value="admin">Employee Admin</option>
                                                <option value="superadmin">Super Executive Admin</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                <div>
                                    <label style={styles.fieldLabel}>Assign Initial Password</label>
                                    <div style={styles.inputWrap}>
                                        <Lock size={16} color={PURPLE_SOFT} style={styles.inputIcon} />
                                        <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={styles.input} placeholder="••••••••" />
                                    </div>
                                </div>
                                <div style={{ gridColumn: '1 / -1', paddingTop: 8 }}>
                                    {mgmtStatus.message && (
                                        <div style={styles.statusMsg(mgmtStatus.type)}>{mgmtStatus.message}</div>
                                    )}
                                    <button type="submit" style={styles.submitBtn(mgmtTab === 'provider' ? 'teal' : 'purple')}>
                                        Deploy New {mgmtTab === 'provider' ? 'Provider Portal' : 'Staff Account'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;