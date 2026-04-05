import React, { useState, useEffect } from 'react';
import {
    Users,
    FileText,
    //MessageSquare,
    ShieldCheck,
    LogOut,
    TrendingUp,
    Clock,
    Activity,
    ArrowRight,
    Search,
    UserPlus,
    User,
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
    Stethoscope,
    Zap,
    CheckCircle2,
    LinkIcon,
    Copy,
    Check,
    MessageCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DiagnosisAssessment from '../components/DiagnosisAssessment';

/* ── Design Tokens (Professional Clinical Palette) ── */
const PURPLE_DARK = '#1A0A2E';      // Deep Midnight
const PURPLE_MID = '#3B1F6A';       // Brand Primary
const PURPLE_LIGHT = '#6B4FA0';     // Accents
const PURPLE_SOFT = '#A98EDD';      // Interactive/Labels
const PURPLE_GHOST = '#F8F6FF';     // Subtle Backgrounds
const GOLD = '#F5C842';             // Premium Accent
const GOLD_DARK = '#D4A017';        // Contrast Accent
const BG = '#F3EFF9';               // App Background
const WHITE = '#FFFFFF';
const SHADOW_SM = '0 2px 12px rgba(26,10,46,0.08)';
const SHADOW_MD = '0 8px 32px rgba(26,10,46,0.12)';
const GLASS = 'blur(12px) saturate(180%)';
const TRANSITION = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

const styles = {
    /* Shell */
    shell: { display: 'flex', minHeight: '100vh', background: BG, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" },

    /* ── Sidebar (Modern Floating Style) ── */
    sidebar: {
        width: 280, flexShrink: 0, background: PURPLE_DARK,
        display: 'flex', flexDirection: 'column', padding: '36px 24px',
        position: 'fixed', height: '100vh', overflowY: 'auto',
        boxShadow: '12px 0 40px rgba(26,10,46,0.25)', zIndex: 20,
        borderRight: '1px solid rgba(245,200,66,0.1)'
    },
    sidebarBrand: {
        display: 'flex', alignItems: 'center', gap: 14, marginBottom: 44,
        padding: '0 8px'
    },
    brandIcon: {
        width: 48, height: 48, borderRadius: 16, background: 'rgba(59,31,106,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1.5px solid ${GOLD}`, boxShadow: `0 0 24px rgba(245,200,66,0.2)`,
        flexShrink: 0, backdropFilter: GLASS
    },
    brandTextWrap: { display: 'flex', flexDirection: 'column', gap: 2 },
    brandTitle: { fontSize: 19, fontWeight: 900, color: WHITE, lineHeight: 1, letterSpacing: '-0.01em' },
    brandSub: { fontSize: 10, fontWeight: 800, color: PURPLE_SOFT, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.8 },

    nav: { display: 'flex', flexDirection: 'column', gap: 8, flex: 1 },
    navBtn: (active) => ({
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
        borderRadius: 14, border: 'none', background: active ? `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_DARK} 100%)` : 'transparent',
        cursor: 'pointer', color: active ? PURPLE_DARK : PURPLE_SOFT,
        fontWeight: 800, fontSize: 11, letterSpacing: '0.06em',
        textTransform: 'uppercase', textAlign: 'left', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        width: '100%',
        boxShadow: active ? `0 8px 24px rgba(245,200,66,0.3)` : 'none',
        transform: active ? 'translateX(4px)' : 'translateX(0)'
    }),
    navLabel: { flex: 1 },
    navBtnPlain: {
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
        borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer',
        color: PURPLE_SOFT, fontWeight: 700, fontSize: 11, letterSpacing: '0.06em',
        textTransform: 'uppercase', textAlign: 'left', width: '100%'
    },

    staffCard: {
        background: 'linear-gradient(180deg, rgba(59,31,106,0.4) 0%, rgba(26,10,46,0.6) 100%)',
        borderRadius: 20, padding: '20px', marginBottom: 16,
        border: `1px solid rgba(245,200,66,0.1)`, backdropFilter: GLASS,
        display: 'flex', flexDirection: 'column', gap: 4
    },
    staffSignedInLabel: { fontSize: 9, fontWeight: 900, color: PURPLE_SOFT, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 },
    staffName: { fontSize: 14, fontWeight: 800, color: WHITE, marginBottom: 2 },
    staffRoleRow: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,200,66,0.1)', padding: '4px 10px', borderRadius: 8, width: 'fit-content' },
    staffRoleDot: { width: 6, height: 6, borderRadius: '50%', background: GOLD },
    staffRoleText: { fontSize: 9, fontWeight: 900, color: GOLD, letterSpacing: '0.1em', textTransform: 'uppercase' },

    logoutBtn: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(239,68,68,0.3)',
        background: 'rgba(239,68,68,0.06)', color: '#FCA5A5', cursor: 'pointer',
        fontWeight: 800, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', width: '100%',
        transition: 'all 0.2s',
        ':hover': { background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.6)' }
    },

    /* ── Main ── */
    main: { flex: 1, marginLeft: 280, padding: '48px 60px', overflowY: 'auto', background: BG },

    header: {
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 48, flexWrap: 'wrap', gap: 24
    },
    pageTitle: { fontSize: 36, fontWeight: 900, color: PURPLE_DARK, margin: 0, letterSpacing: '-0.03em' },
    pageSubtitle: { fontSize: 15, color: PURPLE_LIGHT, marginTop: 8, fontWeight: 500, margin: '8px 0 0', opacity: 0.8 },
    statusBadge: {
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px',
        background: WHITE, borderRadius: 20, border: '1px solid rgba(107,79,160,0.1)',
        boxShadow: SHADOW_SM, height: 'fit-content'
    },
    statusLabel: { fontSize: 9, fontWeight: 900, color: PURPLE_SOFT, letterSpacing: '0.12em', textTransform: 'uppercase' },
    statusValue: { fontSize: 13, fontWeight: 800, color: PURPLE_DARK },

    /* ── Stats Grid ── */
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginBottom: 48 },
    statCard: {
        background: WHITE, padding: '32px', borderRadius: 28,
        border: '1px solid rgba(107,79,160,0.05)', boxShadow: SHADOW_MD,
        display: 'flex', alignItems: 'center', gap: 20, cursor: 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        ':hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(26,10,46,0.15)' }
    },
    statIconWrap: (bg, border) => ({
        width: 64, height: 64, borderRadius: 20, background: bg, border: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
    }),
    statLabel: { fontSize: 10, fontWeight: 900, color: PURPLE_SOFT, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 },
    statValue: { fontSize: 40, fontWeight: 950, color: PURPLE_DARK, lineHeight: 1, letterSpacing: '-0.02em' },

    /* ── Two-col grid ── */
    twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },

    /* ── Panel card ── */
    panelCard: {
        background: WHITE, borderRadius: 28, border: '1px solid rgba(107,79,160,0.05)',
        boxShadow: SHADOW_MD, overflow: 'hidden', display: 'flex', flexDirection: 'column'
    },
    panelHeader: {
        padding: '24px 32px', borderBottom: '1px solid #F3EFF9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(90deg, rgba(243,239,249,0.4) 0%, rgba(255,255,255,0) 100%)'
    },
    panelTitle: { fontSize: 18, fontWeight: 900, color: PURPLE_DARK, margin: 0, letterSpacing: '-0.01em' },
    panelLink: {
        fontSize: 11, fontWeight: 800, color: PURPLE_LIGHT, background: 'rgba(107,79,160,0.05)',
        border: 'none', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase',
        padding: '8px 16px', borderRadius: 10, transition: 'all 0.2s'
    },

    /* ── Table ── */
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0 },
    thead: { background: 'rgba(243,239,249,0.3)' },
    th: {
        padding: '16px 32px', textAlign: 'left', fontSize: 10, fontWeight: 900,
        color: PURPLE_SOFT, letterSpacing: '0.12em', textTransform: 'uppercase',
        borderBottom: '1px solid #F3EFF9'
    },
    td: { padding: '20px 32px', borderBottom: '1px solid #F8F6FF', verticalAlign: 'middle' },
    tdName: { fontWeight: 800, color: PURPLE_DARK, fontSize: 15, marginBottom: 4 },
    tdSub: { fontSize: 12, color: PURPLE_SOFT, fontWeight: 500 },

    providerIdBadge: {
        padding: '4px 12px', background: PURPLE_DARK, color: GOLD,
        borderRadius: 8, fontSize: 11, fontWeight: 900, fontFamily: 'monospace',
        boxShadow: '0 2px 8px rgba(26,10,46,0.2)'
    },

    deleteBtn: {
        background: 'rgba(239,68,68,0.05)', border: 'none', cursor: 'pointer',
        color: '#EF4444', padding: '10px', borderRadius: 12, display: 'flex',
        alignItems: 'center', transition: 'all 0.2s'
    },
    shareIconBtn: {
        background: 'rgba(59,31,106,0.05)', border: 'none', cursor: 'pointer',
        color: PURPLE_MID, padding: '10px', borderRadius: 12, display: 'flex',
        alignItems: 'center', transition: 'all 0.2s',
        ':hover': { background: 'rgba(59,31,106,0.1)' }
    },

    /* ── AI Logs ── */
    logsList: { padding: '24px 32px', overflowY: 'auto', maxHeight: 520, display: 'flex', flexDirection: 'column', gap: 20 },
    logItem: {
        background: PURPLE_GHOST, borderRadius: 24, padding: '24px',
        border: '1px solid #EDE9FE', transition: 'all 0.2s',
        ':hover': { transform: 'scale(1.01)', boxShadow: SHADOW_SM }
    },
    logRow: { display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 },
    logAvatarUser: {
        width: 36, height: 36, borderRadius: 12, background: WHITE,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: SHADOW_SM, border: '1px solid #EDE9FE'
    },
    logAvatarAI: {
        width: 36, height: 36, borderRadius: 12, background: PURPLE_MID,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: `0 4px 12px rgba(245,200,66,0.25)`, border: `1.5px solid ${GOLD}`
    },
    logTypeLabel: (color) => ({ fontSize: 10, fontWeight: 900, color, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }),
    logText: { fontSize: 13, color: PURPLE_DARK, fontWeight: 600, lineHeight: 1.6, fontStyle: 'italic', margin: 0 },

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
        background: WHITE, borderRadius: 32, border: '1px solid rgba(107,79,160,0.05)',
        boxShadow: SHADOW_MD, overflow: 'hidden'
    },
    referralsHeader: {
        padding: '36px 40px', borderBottom: '1px solid #F3EFF9',
        background: 'linear-gradient(135deg, rgba(243,239,249,0.5) 0%, rgba(255,255,255,0) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    },
    pendingBadge: {
        padding: '8px 18px', background: WHITE, borderRadius: 14, border: '1px solid #EDE9FE',
        fontSize: 10, fontWeight: 900, color: PURPLE_MID, display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: SHADOW_SM
    },
    pendingDot: { width: 8, height: 8, borderRadius: '50%', background: GOLD, boxShadow: `0 0 10px ${GOLD}` },

    statusPill: (status) => {
        const map = {
            Pending: { bg: '#FFFBEB', border: 'rgba(245,200,66,0.2)', color: '#92400E' },
            Processing: { bg: '#EFF6FF', border: 'rgba(59,130,246,0.2)', color: '#1D4ED8' },
            Admitted: { bg: '#F0FDF4', border: 'rgba(22,163,74,0.2)', color: '#15803D' },
            Rejected: { bg: '#FFF1F2', border: 'rgba(225,29,72,0.2)', color: '#BE123C' },
        };
        const s = map[status] || { bg: '#F3EFF9', border: '#EDE9FE', color: PURPLE_LIGHT };
        return {
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
            borderRadius: 20, fontSize: 10, fontWeight: 900, letterSpacing: '0.08em',
            textTransform: 'uppercase', border: `1px solid ${s.border}`,
            background: s.bg, color: s.color, whiteSpace: 'nowrap',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        };
    },

    actionIconBtn: (bg, color) => ({
        padding: 10, background: bg, borderRadius: 12, border: 'none',
        cursor: 'pointer', color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
        ':hover': { transform: 'scale(1.1)', boxShadow: SHADOW_SM }
    }),

    icdsAssigned: {
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
        background: `rgba(245,200,66,0.1)`, border: `1.5px solid rgba(245,200,66,0.25)`,
        borderRadius: 8, fontSize: 9, fontWeight: 900, color: GOLD_DARK,
        letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 8
    },
    sourceBadge: (isFhir) => ({
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px',
        background: isFhir ? '#EDE9FE' : '#F3EFF9', border: `1px solid ${isFhir ? '#C4B5FD' : '#E9D5FF'}`,
        borderRadius: 8, fontSize: 8, fontWeight: 900, color: isFhir ? PURPLE_MID : PURPLE_SOFT,
        letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6
    }),

    /* ── User Maintenance ── */
    tabBar: {
        display: 'flex', gap: 8, background: 'rgba(243,239,249,0.8)',
        padding: '8px', borderRadius: 24, marginBottom: 32, border: '1px solid #EDE9FE',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)'
    },
    tabBtn: (active, accent) => ({
        flex: 1, padding: '14px 24px', borderRadius: 18,
        border: active ? '1px solid rgba(107,79,160,0.1)' : 'none',
        background: active ? WHITE : 'transparent',
        color: active ? accent : PURPLE_SOFT,
        fontWeight: 900, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
        cursor: 'pointer', boxShadow: active ? SHADOW_SM : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        transition: 'all 0.2s'
    }),

    createBtn: (accent) => ({
        display: 'flex', alignItems: 'center', gap: 10, padding: '14px 28px',
        background: accent === GOLD ? `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})` : `linear-gradient(135deg, ${PURPLE_MID}, ${PURPLE_DARK})`,
        color: accent === GOLD ? PURPLE_DARK : GOLD,
        border: accent === GOLD ? 'none' : `1.5px solid ${GOLD}`,
        borderRadius: 16, cursor: 'pointer', fontWeight: 950, fontSize: 11,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        boxShadow: accent === GOLD ? `0 8px 32px rgba(245,200,66,0.35)` : `0 8px 32px rgba(26,10,46,0.2)`,
        transition: 'all 0.2s',
        ':hover': { transform: 'translateY(-2px)' }
    }),

    /* Form */
    formGrid: {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32,
        background: WHITE, padding: '48px', borderRadius: 32,
        border: '1px solid rgba(107,79,160,0.05)', boxShadow: SHADOW_MD
    },
    fieldLabel: {
        display: 'block', fontSize: 10, fontWeight: 900, color: PURPLE_SOFT,
        letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12,
        opacity: 0.9
    },
    inputWrap: { position: 'relative' },
    inputIcon: { position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: PURPLE_SOFT },
    input: {
        width: '100%', padding: '16px 20px 16px 52px', borderRadius: 16,
        border: '2.5px solid #F3EFF9', background: '#F9F7FD',
        fontSize: 14, fontWeight: 700, color: PURPLE_DARK,
        outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s',
        ':focus': { borderColor: PURPLE_SOFT, background: WHITE, boxShadow: `0 0 0 4px rgba(169,142,221,0.15)` }
    },
    inputPlain: {
        width: '100%', padding: '16px 20px', borderRadius: 16,
        border: '2.5px solid #F3EFF9', background: '#F9F7FD',
        fontSize: 14, fontWeight: 700, color: PURPLE_DARK,
        outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s',
        ':focus': { borderColor: PURPLE_SOFT, background: WHITE, boxShadow: `0 0 0 4px rgba(169,142,221,0.15)` }
    },
    select: {
        width: '100%', padding: '16px 20px', borderRadius: 16,
        border: '2.5px solid #F3EFF9', background: '#F9F7FD',
        fontSize: 14, fontWeight: 800, color: PURPLE_DARK,
        outline: 'none', boxSizing: 'border-box', appearance: 'none', transition: 'all 0.2s',
        ':focus': { borderColor: PURPLE_SOFT, background: WHITE }
    },
    submitBtn: (accent) => ({
        width: '100%', padding: '18px', borderRadius: 20, border: 'none', cursor: 'pointer',
        background: accent === 'teal'
            ? `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`
            : `linear-gradient(135deg, ${PURPLE_MID}, ${PURPLE_DARK})`,
        color: accent === 'teal' ? PURPLE_DARK : GOLD,
        fontWeight: 950, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase',
        boxShadow: accent === 'teal' ? `0 8px 32px rgba(245,200,66,0.4)` : `0 8px 32px rgba(26,10,46,0.25)`,
        transition: 'all 0.2s',
        ':hover': { transform: 'translateY(-2px)' }
    }),

    /* Status messages */
    statusMsg: (type) => ({
        display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px',
        borderRadius: 18, marginBottom: 20, fontSize: 13, fontWeight: 700,
        border: '1.5px solid',
        ...(type === 'success' ? { background: '#F0FDF4', borderColor: '#BBF7D0', color: '#15803D' } :
            type === 'error' ? { background: '#FFF1F2', borderColor: '#FECACA', color: '#BE123C' } :
                { background: '#EFF6FF', borderColor: '#BFDBFE', color: '#1D4ED8' })
    }),

    /* Clinical empty state */
    clinicalEmpty: {
        background: WHITE, borderRadius: 32, border: '1px solid rgba(107,79,160,0.05)',
        boxShadow: SHADOW_MD, padding: '100px 40px',
        textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'
    },
    clinicalEmptyIcon: {
        width: 100, height: 100, borderRadius: '50%', background: `rgba(245,200,66,0.06)`,
        border: `1.5px solid rgba(245,200,66,0.15)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32,
        boxShadow: '0 8px 24px rgba(245,200,66,0.1)'
    },

    searchBar: {
        width: '100%', maxWidth: 480, margin: '0 auto 48px',
        background: WHITE, border: '2.5px solid #F3EFF9', borderRadius: 24,
        padding: '16px 24px 16px 56px', fontSize: 14, fontWeight: 700, color: PURPLE_DARK,
        outline: 'none', boxSizing: 'border-box', boxShadow: SHADOW_SM,
        transition: TRANSITION,
        ':focus': { borderColor: PURPLE_SOFT, boxShadow: `0 8px 24px rgba(107,79,160,0.12)` }
    },
    searchIconWrap: { position: 'relative', maxWidth: 480, margin: '0 auto 48px' },

    episodeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, textAlign: 'left' },
    episodeCard: {
        padding: '24px', background: WHITE, border: '1px solid rgba(107,79,160,0.05)',
        borderRadius: 24, cursor: 'pointer', transition: TRANSITION, display: 'flex', flexDirection: 'column', gap: 6,
        boxShadow: SHADOW_SM,
        ':hover': { transform: 'translateY(-4px)', boxShadow: SHADOW_MD, borderColor: PURPLE_SOFT }
    },

    /* Login */
    loginShell: {
        minHeight: '100vh', background: PURPLE_DARK,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden'
    },
    loginGlow1: {
        position: 'absolute', top: -100, right: -100, width: 500, height: 500,
        background: `radial-gradient(circle, rgba(245,200,66,0.12) 0%, rgba(245,200,66,0) 70%)`, filter: 'blur(80px)'
    },
    loginGlow2: {
        position: 'absolute', bottom: -100, left: -100, width: 500, height: 500,
        background: `radial-gradient(circle, rgba(107,79,160,0.15) 0%, rgba(107,79,160,0) 70%)`, filter: 'blur(80px)'
    },
    loginCard: {
        maxWidth: 440, width: '100%', position: 'relative', zIndex: 1,
        background: `rgba(59,31,106,0.3)`, backdropFilter: 'blur(32px)',
        border: `1px solid rgba(255,255,255,0.1)`, padding: '56px 48px', borderRadius: 40,
        boxShadow: '0 32px 100px rgba(26,10,46,0.6)', textAlign: 'center'
    },
    loginIconWrap: {
        width: 72, height: 72, borderRadius: 24, background: 'rgba(59,31,106,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px',
        border: `2px solid ${GOLD}`, boxShadow: `0 0 40px rgba(245,200,66,0.25)`,
        backdropFilter: GLASS
    },
    loginTitle: { fontSize: 32, fontWeight: 950, color: WHITE, textAlign: 'center', margin: '0 0 8px', letterSpacing: '-0.02em' },
    loginSub: { fontSize: 13, color: PURPLE_SOFT, textAlign: 'center', margin: '0 0 44px', fontWeight: 600, letterSpacing: '0.04em' },
    loginLabel: { display: 'block', fontSize: 10, fontWeight: 900, color: PURPLE_SOFT, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12, textAlign: 'left' },
    loginInput: {
        width: '100%', padding: '16px 20px', borderRadius: 16,
        border: `2px solid rgba(155,114,207,0.2)`, background: 'rgba(255,255,255,0.04)',
        fontSize: 14, fontWeight: 700, color: WHITE,
        outline: 'none', boxSizing: 'border-box',
        transition: 'all 0.2s',
        ':focus': { borderColor: GOLD, background: 'rgba(255,255,255,0.08)', boxShadow: '0 0 0 4px rgba(245,200,66,0.1)' }
    },
    loginBtn: {
        width: '100%', padding: '18px', marginTop: 12,
        background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
        color: PURPLE_DARK, border: 'none', borderRadius: 18, cursor: 'pointer',
        fontWeight: 950, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase',
        boxShadow: `0 12px 40px rgba(245,200,66,0.4)`, transition: 'all 0.2s',
        ':hover': { transform: 'translateY(-2px)', boxShadow: `0 16px 48px rgba(245,200,66,0.5)` }
    },
    loginError: {
        padding: '14px 20px', background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.2)',
        borderRadius: 16, color: '#FCA5A5', fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 16
    },
    loginCancelLink: {
        display: 'inline-block', textAlign: 'center', marginTop: 32, paddingTop: 32,
        borderTop: `1px solid rgba(255,255,255,0.08)`, fontSize: 13,
        color: PURPLE_SOFT, textDecoration: 'none', fontWeight: 700, transition: 'color 0.2s',
        ':hover': { color: WHITE }
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
    const [clinicalStatus, setClinicalStatus] = useState({ show: false, message: '', type: 'success' });
    const [error, setError] = useState('');
    const [directorySearch, setDirectorySearch] = useState('');
    const navigate = useNavigate();

    const handleFixSchema = async () => {
        setClinicalStatus({ show: true, message: 'Patching Database Schema...', type: 'loading' });
        try {
            const res = await fetch('/api/admin/fix-schema');
            if (res.ok) {
                setClinicalStatus({ show: true, message: 'System Schema Repaired Successfully', type: 'success' });
                setTimeout(() => setClinicalStatus({ show: false, message: '', type: 'success' }), 4000);
            } else {
                setClinicalStatus({ show: true, message: 'Schema Patch Failed', type: 'error' });
            }
        } catch {
            setClinicalStatus({ show: true, message: 'Connection Error', type: 'error' });
        }
    };

    const handleAssessAndCode = (referral) => { setActiveEpisode(referral); setActiveTab('clinical'); };
    const handleSaveDiagnosis = async (referralId, diagnosisData) => {
        setClinicalStatus({ show: true, message: 'Syncing Clinical Data...', type: 'loading' });
        try {
            const res = await fetch(`/api/admin/referrals/${referralId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('olympia_admin_token')}`
                },
                body: JSON.stringify({
                    status: 'Processing',
                    icd_primary: diagnosisData.primary,
                    icd_secondary: JSON.stringify(diagnosisData.secondary),
                    pdgm_weight: diagnosisData.weight
                })
            });

            if (res.ok) {
                setClinicalStatus({ show: true, message: 'Diagnoses Saved to Patient Record', type: 'success' });
                setTimeout(() => setClinicalStatus({ show: false, message: '', type: 'success' }), 3000);
                setActiveEpisode(null);
                fetchDashboardData(localStorage.getItem('olympia_admin_token'));
            } else {
                setClinicalStatus({ show: true, message: 'Failed to Sync Data', type: 'error' });
            }
        } catch (err) {
            setClinicalStatus({ show: true, message: 'Connection Error', type: 'error' });
        }
    };

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [mgmtTab, setMgmtTab] = useState('provider');
    const [viewMode, setViewMode] = useState('list');
    const [formData, setFormData] = useState({ provider_id: '', name: '', email: '', password: '', username: '', role: 'admin' });
    const [mgmtStatus, setMgmtStatus] = useState({ type: '', message: '' });
    const [confirmDelete, setConfirmDelete] = useState({ show: false, type: '', id: null, name: '' });
    const [copiedToken, setCopiedToken] = useState(null);

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

    const handleCopyLink = (token) => {
        const link = `${window.location.origin}/referral/${token}`;
        navigator.clipboard.writeText(link);
        setCopiedToken(token);
        setTimeout(() => setCopiedToken(null), 2000);
    };

    const handleShareEmail = (name, token) => {
        const link = `${window.location.origin}/referral/${token}`;
        const subject = encodeURIComponent(`Patient Referral - FastLink for ${name}`);
        const body = encodeURIComponent(`Hi ${name},\n\nPlease use this secure link to send us your patient referrals directly: ${link}\n\nThank you,\nOlympia Homehealth Intake Team`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const handleShareChat = (name, token) => {
        const link = `${window.location.origin}/referral/${token}`;
        const text = encodeURIComponent(`Hi ${name}, here is your secure link for the Olympia Referral Portal: ${link}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
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

            {/* Global Success Toast */}
            {clinicalStatus.show && (
                <div style={{
                    position: 'fixed', bottom: 32, right: 32, zIndex: 1000,
                    background: clinicalStatus.type === 'error' ? '#EF4444' : clinicalStatus.type === 'loading' ? PURPLE_MID : '#10B981',
                    color: WHITE, padding: '16px 28px', borderRadius: 20, boxShadow: SHADOW_MD,
                    display: 'flex', alignItems: 'center', gap: 12, fontWeight: 900, fontSize: 13,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    animation: 'fadeInUp 0.3s ease-out'
                }}>
                    {clinicalStatus.type === 'loading' ? <Activity size={18} className="animate-spin" /> :
                        clinicalStatus.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                    {clinicalStatus.message}
                </div>
            )}

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
                    <div style={styles.brandIcon}><ShieldCheck size={26} color={GOLD} strokeWidth={2.5} /></div>
                    <div style={styles.brandTextWrap}>
                        <div style={styles.brandTitle}>Olympia</div>
                        <div style={styles.brandSub}>Admin Portal</div>
                    </div>
                </div>

                <nav style={styles.nav}>
                    {[
                        { id: 'overview', icon: <TrendingUp size={18} />, label: 'Dashboard Home' },
                        { id: 'users', icon: <UserPlus size={18} />, label: 'Partner & Staff' },
                        { id: 'referrals', icon: <ClipboardCheck size={18} />, label: 'Referral Intake' },
                        { id: 'clinical', icon: <Stethoscope size={18} />, label: 'Clinical Tools' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); if (item.id === 'users') setViewMode('list'); }}
                            style={styles.navBtn(activeTab === item.id)}
                        >
                            {item.icon} <span style={styles.navLabel}>{item.label}</span>
                            {activeTab === item.id && <ArrowRight size={14} opacity={0.6} />}
                        </button>
                    ))}
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
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={handleFixSchema} style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px',
                            background: WHITE, borderRadius: 16, border: '1px solid #FEE2E2',
                            boxShadow: SHADOW_SM, cursor: 'pointer', height: 'fit-content',
                            fontSize: 10, fontWeight: 900, color: '#EF4444', letterSpacing: '0.05em', textTransform: 'uppercase'
                        }}>
                            <Zap size={14} /> Repair System
                        </button>
                        <div style={styles.statusBadge}>
                            <Activity size={18} color={GOLD} />
                            <div>
                                <div style={styles.statusLabel}>System Live</div>
                                <div style={styles.statusValue}>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            </div>
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
                                /*{ label: 'AI Logs Retained', value: stats.recent_ai_logs.length, icon: <MessageSquare size={26} color={PURPLE_SOFT} />, bg: '#FAF5FF', border: '#E9D5FF' },*/
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
                                            <th style={styles.th}>Fast-Link</th>
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
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <button 
                                                            onClick={() => handleCopyLink(p.referral_token)}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: 6, background: copiedToken === p.referral_token ? '#F0FDF4' : 'rgba(107,79,160,0.05)',
                                                                border: `1px solid ${copiedToken === p.referral_token ? '#16A34A' : '#EDE9FE'}`,
                                                                borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
                                                                color: copiedToken === p.referral_token ? '#16A34A' : PURPLE_LIGHT,
                                                                fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            {copiedToken === p.referral_token ? <Check size={12} /> : <LinkIcon size={12} />}
                                                            {copiedToken === p.referral_token ? 'Copied' : 'Fast-Link'}
                                                        </button>
                                                        <button onClick={() => handleShareEmail(p.name, p.referral_token)} style={styles.shareIconBtn} title="Share via Email">
                                                            <Mail size={14} />
                                                        </button>
                                                        <button onClick={() => handleShareChat(p.name, p.referral_token)} style={styles.shareIconBtn} title="Share via WhatsApp/SMS">
                                                            <MessageCircle size={14} />
                                                        </button>
                                                    </div>
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
                                                <div style={styles.sourceBadge(r.source && r.source.includes('FHIR'))}>
                                                    {r.source && r.source.includes('FHIR') ? <Zap size={10} /> : <User size={10} />}
                                                    {r.source || 'Manual Portal'}
                                                </div>
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
                                                <div style={styles.tdName}>{r.provider_name || (r.source && r.source.includes('FHIR') ? 'Integrated Hospital EHR' : 'System Import')}</div>
                                                <div style={{ fontSize: 9, fontWeight: 800, color: r.source && r.source.includes('FHIR') ? PURPLE_MID : GOLD_DARK, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3 }}>
                                                    {r.source && r.source.includes('FHIR') ? 'Interoperability Pipeline' : 'Verified Partner'}
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                    <span style={styles.statusPill(r.status)}>{r.status}</span>

                                                    {r.icd_primary && (
                                                        <div style={{
                                                            marginTop: 4, padding: '8px 12px', background: 'rgba(245,200,66,0.05)',
                                                            border: `1px solid rgba(245,200,66,0.2)`, borderRadius: 12,
                                                            display: 'flex', flexDirection: 'column', gap: 2
                                                        }}>
                                                            <div style={{ fontSize: 8, fontWeight: 900, color: GOLD_DARK, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Clinical Record</div>
                                                            <div style={{ fontSize: 11, fontWeight: 950, color: PURPLE_DARK }}>ICD: {r.icd_primary}</div>
                                                            <div style={{ fontSize: 10, fontWeight: 700, color: GOLD_DARK }}>Weight: {r.pdgm_weight}</div>
                                                        </div>
                                                    )}

                                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
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
                                                    {r.icd_primary && (
                                                        <div style={{ fontSize: 9, fontWeight: 900, color: GOLD_DARK, marginTop: 4, letterSpacing: '0.05em' }}>
                                                            ASSIGNED: {r.icd_primary}
                                                        </div>
                                                    )}
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
                                            {mgmtTab === 'provider' && <th style={styles.th}>Fast-Link</th>}
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
                                                {mgmtTab === 'provider' && (
                                                    <td style={styles.td}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <button 
                                                                onClick={() => handleCopyLink(item.referral_token)}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: 6, background: copiedToken === item.referral_token ? '#F0FDF4' : 'rgba(107,79,160,0.05)',
                                                                    border: `1px solid ${copiedToken === item.referral_token ? '#16A34A' : '#EDE9FE'}`,
                                                                    borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
                                                                    color: copiedToken === item.referral_token ? '#16A34A' : PURPLE_LIGHT,
                                                                    fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                {copiedToken === item.referral_token ? <Check size={12} /> : <LinkIcon size={12} />}
                                                                {copiedToken === item.referral_token ? 'Copied' : 'Copy Link'}
                                                            </button>
                                                            <button onClick={() => handleShareEmail(item.name, item.referral_token)} style={styles.shareIconBtn} title="Share via Email">
                                                                <Mail size={14} />
                                                            </button>
                                                            <button onClick={() => handleShareChat(item.name, item.referral_token)} style={styles.shareIconBtn} title="Share via WhatsApp/SMS">
                                                                <MessageCircle size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
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