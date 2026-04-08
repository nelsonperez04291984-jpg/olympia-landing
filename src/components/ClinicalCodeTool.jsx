import React, { useState, useRef, useCallback } from 'react';
import {
    Search, ClipboardList, CheckCircle2, AlertTriangle, AlertCircle,
    X, Copy, Check, Download, ChevronDown, BarChart3, Zap,
    Shield, RefreshCw, Info, Activity
} from 'lucide-react';

/* ── Design Tokens (matches AdminDashboard) ── */
const PURPLE_DARK  = '#1A0A2E';
const PURPLE_MID   = '#3B1F6A';
const PURPLE_LIGHT = '#6B4FA0';
const PURPLE_SOFT  = '#A98EDD';
const PURPLE_GHOST = '#F8F6FF';
const GOLD         = '#F5C842';
const GOLD_DARK    = '#D4A017';
const WHITE        = '#FFFFFF';
const SHADOW_SM    = '0 2px 12px rgba(26,10,46,0.08)';
const SHADOW_MD    = '0 8px 32px rgba(26,10,46,0.12)';
const TRANSITION   = 'all 0.3s cubic-bezier(0.4,0,0.2,1)';

/* ── Status color map ── */
const STATUS_STYLES = {
    Verified:       { bg: '#F0FDF4', border: '#BBF7D0', color: '#15803D', dot: '#22C55E' },
    Mapped:         { bg: '#EFF6FF', border: '#BFDBFE', color: '#1D4ED8', dot: '#3B82F6' },
    'Needs Review': { bg: '#FFFBEB', border: '#FDE68A', color: '#92400E', dot: '#F59E0B' },
    Unrecognized:   { bg: '#FFF7ED', border: '#FDBA74', color: '#9A3412', dot: '#F97316' },
    Duplicate:      { bg: '#FFF1F2', border: '#FECACA', color: '#BE123C', dot: '#EF4444' },
};

/* ── Group colour accent ── */
const GROUP_COLORS = {
    Wound:            '#DC2626', Neuro:        '#7C3AED', MS:              '#0284C7',
    Cardiac:          '#DB2777', Endo:         '#D97706', 'Endo/Metabolic':'#D97706',
    Respiratory:      '#0891B2', GIGU:         '#059669', Infectious:      '#16A34A',
    Behavioral:       '#9333EA', 'Complex Nursing':'#EA580C', 'Medication Mgmt':'#6366F1',
    Other:            '#6B7280',
};

/* ── Sample codes for the placeholder ── */
const PLACEHOLDER_CODES = `E119
I10
I259
M1258
G9009
S81802S
4019
7242`;

const ClinicalCodeTool = ({ token }) => {
    const [inputText, setInputText]         = useState('');
    const [isLoading, setIsLoading]         = useState(false);
    const [results, setResults]             = useState([]);
    const [summary, setSummary]             = useState(null);
    const [error, setError]                 = useState('');
    const [icd9Resolutions, setIcd9Resolutions] = useState({}); // code → chosen ICD-10
    const [copiedReport, setCopiedReport]   = useState(false);
    const [filterStatus, setFilterStatus]   = useState('all');
    const [activeRow, setActiveRow]         = useState(null); // for dropdown open state
    const textareaRef = useRef(null);

    /* ── Parse raw input into array of codes ── */
    const parseCodes = (raw) =>
        raw
            .split(/[\n,;\s]+/)
            .map(s => s.trim())
            .filter(s => s.length >= 3);

    /* ── Submit to API ── */
    const handleLookup = async () => {
        setError('');
        const codes = parseCodes(inputText);
        if (codes.length === 0) {
            setError('Please enter at least one diagnosis code.');
            return;
        }
        if (codes.length > 200) {
            setError('Maximum 200 codes per request. Please split into smaller batches.');
            return;
        }

        setIsLoading(true);
        setResults([]);
        setSummary(null);
        setIcd9Resolutions({});

        try {
            const res = await fetch('/api/admin/diagnosis/batch-lookup', {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ codes }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Lookup failed');
            }

            const data = await res.json();
            setResults(data.results || []);
            setSummary(data.summary || null);
        } catch (err) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    /* ── Clear everything ── */
    const handleReset = () => {
        setInputText('');
        setResults([]);
        setSummary(null);
        setError('');
        setIcd9Resolutions({});
        setFilterStatus('all');
        setActiveRow(null);
        textareaRef.current?.focus();
    };

    /* ── Copy plain-text report to clipboard ── */
    const handleCopyReport = () => {
        const lines = ['OLYMPIA — DIAGNOSIS CODE REPORT', '=' .repeat(56)];
        if (summary) {
            lines.push(`Total: ${summary.total}  |  Verified: ${summary.verified}  |  ICD-9 Mapped: ${summary.mapped_icd9}  |  Needs Review: ${summary.needs_review}  |  Unrecognized: ${summary.unrecognized}`);
            lines.push('Groups Covered: ' + (summary.groups_covered || []).join(', '));
            lines.push('─'.repeat(56));
        }
        lines.push(
            ['Code', 'Type', 'Clinical Group', 'Priority', 'Comorbidity', 'Status', 'Description']
                .join('\t')
        );
        filteredResults.forEach(r => {
            lines.push([
                r.input_code,
                r.type,
                r.group_name || r.clinical_group || '—',
                r.priority_order < 990 ? r.priority_order : '—',
                r.comorbidity_group !== 'No_group' ? r.comorbidity_group : '—',
                r.status,
                (r.description || '').substring(0, 60),
            ].join('\t'));
        });
        lines.push('', `Generated: ${new Date().toLocaleString()}`);
        navigator.clipboard.writeText(lines.join('\n'));
        setCopiedReport(true);
        setTimeout(() => setCopiedReport(false), 2500);
    };

    /* ── Filtered view ── */
    const filteredResults = filterStatus === 'all'
        ? results
        : results.filter(r => r.status === filterStatus || (filterStatus === 'flagged' && (r.needs_review || r.is_duplicate)));

    /* ── Resolve ICD-9 "Multiple Options" ── */
    const resolveIcd9 = (code, chosenCode) => {
        setIcd9Resolutions(prev => ({ ...prev, [code]: chosenCode }));
        setActiveRow(null);
    };

    /* ── How many ICD-9 still unresolved ── */
    const unresolvedCount = results.filter(r => r.type === 'ICD-9' && r.needs_review && !icd9Resolutions[r.input_code]).length;

    /* ═══════════════════════ RENDER ═══════════════════════ */
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* ── Engine badge ── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 12,
            }}>
                <div>
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: PURPLE_DARK, margin: 0, letterSpacing: '-0.01em' }}>
                        Batch ICD Processor
                    </h2>
                    <p style={{ fontSize: 13, color: PURPLE_LIGHT, margin: '6px 0 0', fontWeight: 500 }}>
                        Paste any mix of ICD-9 and ICD-10 codes — the engine classifies, groups, and flags in one pass.
                    </p>
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                    background: `linear-gradient(135deg, ${PURPLE_MID}, ${PURPLE_DARK})`,
                    borderRadius: 12, border: `1px solid rgba(245,200,66,0.2)`,
                    boxShadow: '0 4px 16px rgba(26,10,46,0.2)',
                }}>
                    <Zap size={13} color={GOLD} />
                    <span style={{ fontSize: 9, fontWeight: 900, color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        CMS PDGM Regulatory Engine v2.5
                    </span>
                </div>
            </div>

            {/* ── Input card ── */}
            <div style={{
                background: WHITE, borderRadius: 28, border: '1px solid rgba(107,79,160,0.08)',
                boxShadow: SHADOW_MD, overflow: 'hidden',
            }}>
                {/* Card header */}
                <div style={{
                    padding: '20px 32px', borderBottom: '1px solid #F3EFF9',
                    background: 'linear-gradient(90deg, rgba(243,239,249,0.5) 0%, rgba(255,255,255,0) 100%)',
                    display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 12,
                        background: `rgba(245,200,66,0.1)`, border: `1.5px solid rgba(245,200,66,0.25)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <ClipboardList size={18} color={GOLD_DARK} />
                    </div>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: PURPLE_DARK }}>Code Entry</div>
                        <div style={{ fontSize: 11, color: PURPLE_SOFT, fontWeight: 500 }}>
                            One per line, or comma/space separated · ICD-9 and ICD-10 accepted · max 200
                        </div>
                    </div>
                </div>

                {/* Text area area */}
                <div style={{ padding: '28px 32px' }}>
                    <div style={{ position: 'relative' }}>
                        <textarea
                            ref={textareaRef}
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            placeholder={PLACEHOLDER_CODES}
                            onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleLookup(); }}
                            style={{
                                width: '100%', minHeight: 180, padding: '20px 24px',
                                borderRadius: 20, border: '2.5px solid #F3EFF9',
                                background: '#F9F7FD', fontSize: 15, fontWeight: 700,
                                color: PURPLE_DARK, fontFamily: "'Courier New', monospace",
                                outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                                lineHeight: 1.9, letterSpacing: '0.04em', transition: TRANSITION,
                            }}
                            onFocus={e => { e.target.style.borderColor = PURPLE_SOFT; e.target.style.background = WHITE; e.target.style.boxShadow = `0 0 0 4px rgba(169,142,221,0.12)`; }}
                            onBlur={e => { e.target.style.borderColor = '#F3EFF9'; e.target.style.background = '#F9F7FD'; e.target.style.boxShadow = 'none'; }}
                        />
                        {inputText && (
                            <button
                                onClick={() => setInputText('')}
                                style={{
                                    position: 'absolute', top: 14, right: 14,
                                    background: 'rgba(107,79,160,0.08)', border: 'none',
                                    borderRadius: 8, padding: 6, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', color: PURPLE_SOFT,
                                }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Code count hint */}
                    {inputText && (
                        <div style={{ marginTop: 8, fontSize: 11, color: PURPLE_SOFT, fontWeight: 600, paddingLeft: 4 }}>
                            {parseCodes(inputText).length} code{parseCodes(inputText).length !== 1 ? 's' : ''} detected
                            <span style={{ marginLeft: 8, opacity: 0.6 }}>· Ctrl+Enter to process</span>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                        <button
                            onClick={handleLookup}
                            disabled={isLoading || !inputText.trim()}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '14px 32px', borderRadius: 16, border: 'none',
                                background: (!inputText.trim() || isLoading)
                                    ? 'rgba(107,79,160,0.15)'
                                    : `linear-gradient(135deg, ${PURPLE_MID}, ${PURPLE_DARK})`,
                                color: (!inputText.trim() || isLoading) ? PURPLE_SOFT : GOLD,
                                fontWeight: 900, fontSize: 12, letterSpacing: '0.1em',
                                textTransform: 'uppercase', cursor: (!inputText.trim() || isLoading) ? 'not-allowed' : 'pointer',
                                boxShadow: (!inputText.trim() || isLoading) ? 'none' : `0 8px 28px rgba(26,10,46,0.25)`,
                                transition: TRANSITION,
                            }}
                        >
                            {isLoading
                                ? <><Activity size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                                : <><Search size={16} /> Lookup Codes</>
                            }
                        </button>

                        {results.length > 0 && (
                            <>
                                <button
                                    onClick={handleCopyReport}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '14px 24px', borderRadius: 16,
                                        border: `1.5px solid ${copiedReport ? '#BBF7D0' : '#EDE9FE'}`,
                                        background: copiedReport ? '#F0FDF4' : WHITE,
                                        color: copiedReport ? '#15803D' : PURPLE_LIGHT,
                                        fontWeight: 900, fontSize: 11, letterSpacing: '0.08em',
                                        textTransform: 'uppercase', cursor: 'pointer', transition: TRANSITION,
                                    }}
                                >
                                    {copiedReport ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Report</>}
                                </button>
                                <button
                                    onClick={handleReset}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '14px 20px', borderRadius: 16,
                                        border: '1.5px solid rgba(239,68,68,0.2)',
                                        background: 'rgba(239,68,68,0.04)',
                                        color: '#EF4444', fontWeight: 900, fontSize: 11,
                                        letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                                        transition: TRANSITION,
                                    }}
                                >
                                    <RefreshCw size={14} /> New Batch
                                </button>
                            </>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            marginTop: 16, padding: '14px 20px', borderRadius: 16,
                            background: '#FFF1F2', border: '1.5px solid #FECACA',
                            fontSize: 13, fontWeight: 700, color: '#BE123C',
                        }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                </div>
            </div>

            {/* ── ICD-9 Multiple Options alert ── */}
            {unresolvedCount > 0 && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 24px', borderRadius: 20,
                    background: '#FFFBEB', border: '1.5px solid #FDE68A',
                    boxShadow: SHADOW_SM,
                }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12, background: 'rgba(245,158,11,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <AlertTriangle size={20} color="#F59E0B" />
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: '#92400E' }}>
                            {unresolvedCount} ICD-9 code{unresolvedCount !== 1 ? 's' : ''} require manual selection
                        </div>
                        <div style={{ fontSize: 12, color: '#B45309', fontWeight: 500, marginTop: 2 }}>
                            Use the dropdown in each flagged row to select the correct ICD-10 equivalent before saving.
                        </div>
                    </div>
                </div>
            )}

            {/* ── Summary bar ── */}
            {summary && (
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 16,
                }}>
                    {[
                        { label: 'Total Codes',     value: summary.total,        color: PURPLE_MID,  icon: <BarChart3 size={18} /> },
                        { label: 'Verified ICD-10', value: summary.verified,      color: '#16A34A',   icon: <CheckCircle2 size={18} /> },
                        { label: 'ICD-9 Mapped',    value: summary.mapped_icd9,  color: '#2563EB',   icon: <Shield size={18} /> },
                        { label: 'Needs Review',    value: summary.needs_review,  color: '#D97706',   icon: <AlertTriangle size={18} /> },
                        { label: 'Unrecognized',    value: summary.unrecognized,  color: '#EA580C',   icon: <AlertCircle size={18} /> },
                        { label: 'Comorbidities',   value: summary.comorbidities, color: '#7C3AED',   icon: <Activity size={18} /> },
                    ].map(stat => (
                        <div key={stat.label} style={{
                            background: WHITE, borderRadius: 20, padding: '20px 24px',
                            border: '1px solid rgba(107,79,160,0.06)', boxShadow: SHADOW_SM,
                            display: 'flex', flexDirection: 'column', gap: 8,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 10, fontWeight: 900, color: PURPLE_SOFT, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    {stat.label}
                                </span>
                                <span style={{ color: stat.color, opacity: 0.7 }}>{stat.icon}</span>
                            </div>
                            <div style={{ fontSize: 32, fontWeight: 950, color: stat.color, lineHeight: 1, letterSpacing: '-0.02em' }}>
                                {stat.value}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Groups covered chips ── */}
            {summary?.groups_covered?.length > 0 && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                    padding: '16px 24px', background: WHITE, borderRadius: 20,
                    border: '1px solid rgba(107,79,160,0.06)', boxShadow: SHADOW_SM,
                }}>
                    <span style={{ fontSize: 10, fontWeight: 900, color: PURPLE_SOFT, letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 4 }}>
                        Groups Covered:
                    </span>
                    {summary.groups_covered.map(g => (
                        <span key={g} style={{
                            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                            background: `${GROUP_COLORS[g] || '#6B7280'}18`,
                            color: GROUP_COLORS[g] || '#6B7280',
                            border: `1.5px solid ${GROUP_COLORS[g] || '#6B7280'}40`,
                        }}>{g}</span>
                    ))}
                </div>
            )}

            {/* ── Results table ── */}
            {results.length > 0 && (
                <div style={{
                    background: WHITE, borderRadius: 28, border: '1px solid rgba(107,79,160,0.06)',
                    boxShadow: SHADOW_MD, overflow: 'hidden',
                }}>
                    {/* Table header bar */}
                    <div style={{
                        padding: '20px 32px', borderBottom: '1px solid #F3EFF9',
                        background: 'linear-gradient(90deg, rgba(243,239,249,0.5) 0%, rgba(255,255,255,0) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 12,
                    }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: PURPLE_DARK }}>
                            Diagnosis Report
                            <span style={{
                                marginLeft: 12, padding: '3px 10px', background: `rgba(245,200,66,0.12)`,
                                border: `1px solid rgba(245,200,66,0.3)`, borderRadius: 8,
                                fontSize: 11, fontWeight: 900, color: GOLD_DARK,
                            }}>{filteredResults.length} codes</span>
                        </div>
                        {/* Filter pills */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {['all', 'Verified', 'Mapped', 'Needs Review', 'Unrecognized', 'Duplicate', 'flagged'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilterStatus(f)}
                                    style={{
                                        padding: '6px 14px', borderRadius: 20, border: '1.5px solid',
                                        borderColor: filterStatus === f ? PURPLE_SOFT : '#EDE9FE',
                                        background: filterStatus === f ? `rgba(107,79,160,0.08)` : WHITE,
                                        color: filterStatus === f ? PURPLE_MID : PURPLE_SOFT,
                                        fontSize: 10, fontWeight: 900, letterSpacing: '0.06em',
                                        textTransform: 'uppercase', cursor: 'pointer', transition: TRANSITION,
                                    }}
                                >{f === 'flagged' ? '⚑ Flagged' : f === 'all' ? 'All' : f}</button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                            <thead>
                                <tr style={{ background: 'rgba(243,239,249,0.4)' }}>
                                    {['#', 'Code', 'Type', 'Description', 'Clinical Group', 'Priority', 'Comorbidity', 'Status'].map(h => (
                                        <th key={h} style={{
                                            padding: '14px 20px', textAlign: 'left',
                                            fontSize: 9, fontWeight: 900, color: PURPLE_SOFT,
                                            letterSpacing: '0.12em', textTransform: 'uppercase',
                                            borderBottom: '1px solid #F3EFF9', whiteSpace: 'nowrap',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredResults.map((row, idx) => {
                                    const ss = STATUS_STYLES[row.status] || STATUS_STYLES['Unrecognized'];
                                    const groupColor = GROUP_COLORS[row.group_name] || PURPLE_LIGHT;
                                    const hasOptions = row.type === 'ICD-9' && row.needs_review && row.icd9_options?.length > 0;
                                    const resolved   = icd9Resolutions[row.input_code];
                                    const isOpen     = activeRow === `${row.input_code}-${idx}`;

                                    return (
                                        <tr
                                            key={idx}
                                            style={{
                                                background: idx % 2 === 0 ? WHITE : '#F9F7FD',
                                                borderLeft: row.is_duplicate ? '3px solid #EF4444'
                                                    : row.needs_review ? '3px solid #F59E0B'
                                                    : row.comorbidity_group !== 'No_group' ? '3px solid #7C3AED'
                                                    : '3px solid transparent',
                                                transition: TRANSITION,
                                            }}
                                        >
                                            {/* # */}
                                            <td style={{ padding: '16px 20px', borderBottom: '1px solid #F3EFF9' }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: PURPLE_SOFT }}>{idx + 1}</span>
                                            </td>

                                            {/* Code */}
                                            <td style={{ padding: '16px 20px', borderBottom: '1px solid #F3EFF9' }}>
                                                <span style={{
                                                    display: 'inline-block', padding: '4px 10px',
                                                    background: PURPLE_DARK, color: GOLD,
                                                    borderRadius: 8, fontSize: 12, fontWeight: 900,
                                                    fontFamily: "'Courier New', monospace",
                                                    letterSpacing: '0.06em',
                                                }}>
                                                    {row.input_code}
                                                </span>
                                                {row.mapped_icd10 && !row.needs_review && (
                                                    <div style={{ fontSize: 9, color: '#2563EB', fontWeight: 800, marginTop: 4, letterSpacing: '0.04em' }}>
                                                        → {row.mapped_icd10.toUpperCase()}
                                                    </div>
                                                )}
                                                {resolved && (
                                                    <div style={{ fontSize: 9, color: '#16A34A', fontWeight: 800, marginTop: 4, letterSpacing: '0.04em' }}>
                                                        ✓ Resolved → {resolved.toUpperCase()}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Type */}
                                            <td style={{ padding: '16px 20px', borderBottom: '1px solid #F3EFF9' }}>
                                                <span style={{
                                                    padding: '3px 9px', borderRadius: 6, fontSize: 9, fontWeight: 900,
                                                    letterSpacing: '0.08em', textTransform: 'uppercase',
                                                    background: row.type === 'ICD-10' ? 'rgba(59,31,106,0.08)' : 'rgba(245,158,11,0.1)',
                                                    color: row.type === 'ICD-10' ? PURPLE_MID : '#92400E',
                                                    border: `1px solid ${row.type === 'ICD-10' ? 'rgba(107,79,160,0.2)' : 'rgba(245,158,11,0.3)'}`,
                                                }}>
                                                    {row.type}
                                                </span>
                                            </td>

                                            {/* Description + ICD-9 dropdown */}
                                            <td style={{ padding: '16px 20px', borderBottom: '1px solid #F3EFF9', maxWidth: 320 }}>
                                                <div style={{
                                                    fontSize: 12, fontWeight: 600, color: PURPLE_DARK,
                                                    lineHeight: 1.5,
                                                }}>
                                                    {row.description || '—'}
                                                </div>
                                                {row.subchapter && (
                                                    <div style={{ fontSize: 10, color: PURPLE_SOFT, marginTop: 3, fontWeight: 500 }}>
                                                        {row.subchapter}
                                                    </div>
                                                )}

                                                {/* ICD-9 Multiple Options dropdown */}
                                                {hasOptions && (
                                                    <div style={{ position: 'relative', marginTop: 8 }}>
                                                        <button
                                                            onClick={() => setActiveRow(isOpen ? null : `${row.input_code}-${idx}`)}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: 6,
                                                                padding: '6px 12px', borderRadius: 10,
                                                                border: `1.5px solid ${resolved ? '#BBF7D0' : '#FDE68A'}`,
                                                                background: resolved ? '#F0FDF4' : '#FFFBEB',
                                                                color: resolved ? '#15803D' : '#92400E',
                                                                fontSize: 10, fontWeight: 900, letterSpacing: '0.04em',
                                                                cursor: 'pointer', textTransform: 'uppercase',
                                                            }}
                                                        >
                                                            {resolved ? <Check size={11} /> : <AlertTriangle size={11} />}
                                                            {resolved ? `Resolved: ${resolved.toUpperCase()}` : 'Select ICD-10 →'}
                                                            <ChevronDown size={11} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                                                        </button>
                                                        {isOpen && (
                                                            <div style={{
                                                                position: 'absolute', top: '110%', left: 0,
                                                                background: WHITE, borderRadius: 14,
                                                                border: '1.5px solid #EDE9FE', boxShadow: SHADOW_MD,
                                                                zIndex: 50, minWidth: 260, overflow: 'hidden',
                                                            }}>
                                                                <div style={{ padding: '10px 16px', borderBottom: '1px solid #F3EFF9', fontSize: 9, fontWeight: 900, color: PURPLE_SOFT, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                                                    Select ICD-10 Equivalent
                                                                </div>
                                                                {row.icd9_options.map(opt => (
                                                                    <button
                                                                        key={opt}
                                                                        onClick={() => resolveIcd9(row.input_code, opt)}
                                                                        style={{
                                                                            display: 'block', width: '100%', padding: '12px 16px',
                                                                            textAlign: 'left', border: 'none', background: resolved === opt ? '#F0FDF4' : 'transparent',
                                                                            color: PURPLE_DARK, fontSize: 13, fontWeight: 800,
                                                                            fontFamily: "'Courier New', monospace", cursor: 'pointer',
                                                                            transition: '0.15s',
                                                                        }}
                                                                        onMouseEnter={e => e.target.style.background = '#F3EFF9'}
                                                                        onMouseLeave={e => e.target.style.background = resolved === opt ? '#F0FDF4' : 'transparent'}
                                                                    >
                                                                        {opt.toUpperCase()}
                                                                        {resolved === opt && <span style={{ marginLeft: 8, fontSize: 9, color: '#16A34A' }}>✓ Selected</span>}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Clinical Group */}
                                            <td style={{ padding: '16px 20px', borderBottom: '1px solid #F3EFF9' }}>
                                                {row.group_name ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                        <span style={{
                                                            padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900,
                                                            background: `${groupColor}14`,
                                                            color: groupColor,
                                                            border: `1.5px solid ${groupColor}40`,
                                                            display: 'inline-block',
                                                        }}>
                                                            {row.group_name}
                                                        </span>
                                                        {row.clinical_group && (
                                                            <span style={{ fontSize: 9, color: PURPLE_SOFT, fontWeight: 700 }}>
                                                                Group {row.clinical_group}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: 12, color: PURPLE_SOFT, fontStyle: 'italic' }}>—</span>
                                                )}
                                            </td>

                                            {/* Priority */}
                                            <td style={{ padding: '16px 20px', borderBottom: '1px solid #F3EFF9', textAlign: 'center' }}>
                                                {row.priority_order < 990 ? (
                                                    <div style={{
                                                        width: 36, height: 36, borderRadius: '50%',
                                                        background: `${groupColor}12`,
                                                        border: `2px solid ${groupColor}40`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                                                        fontSize: 13, fontWeight: 950, color: groupColor,
                                                    }}>
                                                        {row.priority_order}
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: 11, color: PURPLE_SOFT }}>—</span>
                                                )}
                                            </td>

                                            {/* Comorbidity */}
                                            <td style={{ padding: '16px 20px', borderBottom: '1px solid #F3EFF9' }}>
                                                {row.comorbidity_group && row.comorbidity_group !== 'No_group' ? (
                                                    <span style={{
                                                        padding: '4px 10px', borderRadius: 8, fontSize: 9, fontWeight: 900,
                                                        background: 'rgba(124,58,237,0.08)', color: '#7C3AED',
                                                        border: '1.5px solid rgba(124,58,237,0.2)',
                                                        display: 'inline-block', letterSpacing: '0.04em',
                                                    }}>
                                                        {row.comorbidity_group}
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: 11, color: PURPLE_SOFT }}>—</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td style={{ padding: '16px 20px', borderBottom: '1px solid #F3EFF9' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                                    padding: '5px 12px', borderRadius: 20, fontSize: 9,
                                                    fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase',
                                                    background: ss.bg, color: ss.color,
                                                    border: `1.5px solid ${ss.border}`,
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: ss.dot, flexShrink: 0 }} />
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty filter state */}
                    {filteredResults.length === 0 && (
                        <div style={{ padding: '60px 0', textAlign: 'center', color: PURPLE_SOFT, fontSize: 13 }}>
                            No codes match the selected filter.
                        </div>
                    )}

                    {/* Table footer */}
                    <div style={{
                        padding: '16px 32px', borderTop: '1px solid #F3EFF9',
                        background: 'rgba(243,239,249,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 8,
                    }}>
                        <div style={{ fontSize: 11, color: PURPLE_SOFT, fontWeight: 600 }}>
                            Sorted by clinical priority (Groups Legend order) · Generated {new Date().toLocaleTimeString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            {[
                                { color: '#EF4444', label: 'Duplicate' },
                                { color: '#F59E0B', label: 'Needs Review' },
                                { color: '#7C3AED', label: 'Comorbidity' },
                            ].map(l => (
                                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <div style={{ width: 3, height: 16, borderRadius: 2, background: l.color }} />
                                    <span style={{ fontSize: 9, fontWeight: 800, color: PURPLE_SOFT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Initial empty state ── */}
            {results.length === 0 && !isLoading && !error && (
                <div style={{
                    background: WHITE, borderRadius: 28,
                    border: '1px solid rgba(107,79,160,0.06)', boxShadow: SHADOW_SM,
                    padding: '56px 40px', textAlign: 'center',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'rgba(245,200,66,0.06)', border: '1.5px solid rgba(245,200,66,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 8, boxShadow: '0 8px 24px rgba(245,200,66,0.08)',
                    }}>
                        <Search size={30} color={GOLD} />
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: PURPLE_DARK, letterSpacing: '-0.01em' }}>
                        Ready to Process
                    </div>
                    <div style={{ fontSize: 13, color: PURPLE_LIGHT, maxWidth: 380, lineHeight: 1.7 }}>
                        Paste ICD-9 or ICD-10 codes in the box above, then click <strong>Lookup Codes</strong>.
                        Results are sorted by clinical group priority and flagged automatically.
                    </div>
                    <div style={{
                        display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center',
                    }}>
                        {['E119 (Diabetes)', 'I10 (Hypertension)', '4019 (ICD-9 HTN)', 'I87313 (Wound)'].map(hint => (
                            <span key={hint} style={{
                                padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                                background: '#F3EFF9', color: PURPLE_SOFT, border: '1px solid #EDE9FE',
                            }}>{hint}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Spin keyframe */}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default ClinicalCodeTool;
