import React, { useState, useEffect } from 'react';
import { Search, Loader2, Clipboard, CheckCircle2, AlertCircle, Stethoscope, Info, TrendingUp, DollarSign, Activity, FileText } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ICD10Search = ({ isEmbedded = false, onSelect = null, externalContext = null, hideSearch = false, externalQuery = '' }) => {
    const [query, setQuery] = useState(externalQuery || '');
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Patient Context State for standalone mode
    const [admissionSource, setAdmissionSource] = useState('community'); 
    const [episodeTiming, setEpisodeTiming] = useState('early'); 
    const [functionalLevel, setFunctionalLevel] = useState('medium'); 
    const [comorbidityAdjustment, setComorbidityAdjustment] = useState('none'); 

    const BASE_RATE = 2038.39; 

    const calculateReimbursement = (baseWeight, ctxOverride = null) => {
        // Use provided context, external context, or local state
        const ctx = ctxOverride || externalContext || { admissionSource, episodeTiming, functionalLevel, comorbidityAdjustment };
        
        let multiplier = 1.0;
        if (ctx.admissionSource === 'institutional') multiplier *= 1.2;
        if (ctx.episodeTiming === 'early') multiplier *= 1.15;
        if (ctx.functionalLevel === 'high') multiplier *= 1.4;
        else if (ctx.functionalLevel === 'medium') multiplier *= 1.25;
        if (ctx.comorbidityAdjustment === 'high') multiplier *= 1.2;
        else if (ctx.comorbidityAdjustment === 'low') multiplier *= 1.1;

        const weight = parseFloat(baseWeight) * multiplier;
        return {
            amount: (BASE_RATE * weight).toFixed(2),
            finalWeight: weight.toFixed(4)
        };
    };

    // Handle external query changes
    useEffect(() => {
        if (externalQuery !== undefined && externalQuery !== null) {
            setQuery(externalQuery);
        }
    }, [externalQuery]);

    // Automatic search when query changes (debounced)
    useEffect(() => {
        if (!query.trim()) {
            setResults(null);
            return;
        }

        const timer = setTimeout(() => {
            handleSearch({ preventDefault: () => {} });
        }, 500); // 500ms debounce for performance

        return () => clearTimeout(timer);
    }, [query]);

    // Keep results reactive to context changes
    useEffect(() => {
        if (results && results.length > 0) {
            const updatedResults = results.map(item => {
                const calc = calculateReimbursement(item.base_weight);
                return {
                    ...item,
                    calculated_payment: calc.amount,
                    final_weight: calc.finalWeight
                };
            }).sort((a, b) => b.calculated_payment - a.calculated_payment);
            
            // Only update if the values actually changed to avoid infinite loops
            if (JSON.stringify(updatedResults) !== JSON.stringify(results)) {
                setResults(updatedResults);
            }
        }
    }, [externalContext, admissionSource, episodeTiming, functionalLevel, comorbidityAdjustment]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError('');
        setResults(null);

        try {
            // ── 1. Local Database Search ──────────────────────────────
            const localRes = await fetch(`/api/admin/diagnosis/search?q=${encodeURIComponent(query)}`);
            if (!localRes.ok) throw new Error("Local search failed");
            const localResults = await localRes.json();

            if (localResults.length === 0) {
                // If no local results, we can still fall back to AI-only search
                // but user said "use imported data", so we should probably inform them.
            }

            // ── 2. AI Enrichment ─────────────────────────────────────
            const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
            let finalResults = localResults.map(r => {
                const calc = calculateReimbursement(1.0);
                return { 
                    ...r, 
                    base_weight: 1.0, 
                    is_primary_allowed: true, 
                    reasoning: "Direct match from clinical database.", 
                    tips: [], 
                    calculated_payment: calc.amount, 
                    final_weight: calc.finalWeight 
                };
            });

            if (API_KEY && localResults.length > 0) {
                try {
                    const genAI = new GoogleGenerativeAI(API_KEY);
                    // Use flash for speed, but wrap in try/catch for quota
                    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                    const enrichPrompt = `
                    You are a PDGM Clinical Analyst. I have these ICD-10 codes from our master database.
                    For each code, provide the missing clinical analytics for home health reimbursement.
                    
                    Input Codes:
                    ${localResults.map(r => `${r.code}: ${r.description}`).join('\n')}

                    For each code provide:
                    1. Estimated PDGM Base Case-Mix Weight (0.8 - 2.5).
                    2. Whether it is a valid PRIMARY diagnosis under CMS 2024 rules.
                    3. Clinical reasoning.
                    4. 2-3 clinical documentation tips.

                    Respond ONLY with a JSON array: [{"code": "...", "base_weight": 1.2, "is_primary_allowed": true, "reasoning": "...", "tips": ["..."]}]
                    `;

                    const aiResult = await model.generateContent(enrichPrompt);
                    const aiText = aiResult.response.text();
                    const jsonMatch = aiText.match(/\[[\s\S]*\]/);
                    
                    if (jsonMatch) {
                        const enrichmentData = JSON.parse(jsonMatch[0]);
                        finalResults = localResults.map(local => {
                            const aiData = enrichmentData.find(a => a.code === local.code) || {};
                            const base_weight = aiData.base_weight || 1.0;
                            const calc = calculateReimbursement(base_weight);
                            
                            return {
                                ...local,
                                base_weight,
                                is_primary_allowed: aiData.is_primary_allowed ?? true,
                                reasoning: aiData.reasoning || "Direct match from clinical database.",
                                tips: aiData.tips || [],
                                calculated_payment: calc.amount,
                                final_weight: calc.finalWeight,
                                ai_enriched: true
                            };
                        });
                    }
                } catch (aiErr) {
                    console.warn("AI Enrichment failed (likely quota):", aiErr);
                    // We already have the default finalResults set up above
                    // Maybe add a flag to show AI is unavailable
                    finalResults = finalResults.map(r => ({ ...r, ai_unavailable: true }));
                }
            }
            
            setResults(finalResults);
        } catch (err) {
            console.error("Search Error:", err);
            setError(`Search failed: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const searchInputUI = (
        <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors">
                <Search className={`w-5 h-5 ${query ? 'text-teal-500' : 'text-slate-400'}`} />
            </div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isEmbedded ? "Search ICD code or condition (e.g. CVA, stroke, diabetes)..." : "Enter diagnosis description or code to rank reimbursement impact..."}
                className={`w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-32 text-slate-900 font-medium focus:outline-none focus:border-teal-500/50 focus:bg-white transition-all shadow-sm ${isEmbedded ? 'py-4 text-sm' : 'py-5'}`}
            />
            <button
                type="submit"
                disabled={isLoading}
                className={`absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50 ${isEmbedded ? 'px-4 py-2 text-[10px]' : 'px-8 py-3'}`}
            >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : (isEmbedded ? 'Find Codes' : 'Run PDGM Logic')}
            </button>
        </form>
    );

    if (isEmbedded) {
        return (
            <div className="space-y-4">
                {!hideSearch && searchInputUI}
                {error && <p className="text-xs text-red-500 font-bold ml-1 flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}
                {results && (
                    <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden shadow-xl animate-fadeInUp max-h-[400px] overflow-y-auto custom-scrollbar">
                        {results.map((item, index) => (
                            <div key={item.code} className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors ${index === 0 ? 'bg-teal-50/10' : ''}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-black">{item.code}</span>
                                            {index === 0 && <span className="bg-teal-500 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter shadow-sm shadow-teal-500/20">Recommended</span>}
                                        </div>
                                        <h5 className="text-sm font-bold text-slate-900 leading-tight mb-1">{item.description}</h5>
                                        <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500">
                                            <span className="flex items-center gap-1"><TrendingUp size={10} className="text-teal-500" /> ${parseFloat(item.calculated_payment).toLocaleString()}</span>
                                            <span className="flex items-center gap-1 uppercase tracking-tighter text-[9px] font-black text-slate-400">|</span>
                                            <span className="uppercase tracking-widest text-[8px] font-bold">{item.pdgm_grouping}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5 min-w-[100px]">
                                        <button 
                                            onClick={() => onSelect && onSelect(item, 'primary')}
                                            disabled={!item.is_primary_allowed}
                                            className="w-full py-1.5 px-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-30 disabled:hover:bg-teal-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                        >Primary</button>
                                        <button 
                                            onClick={() => onSelect && onSelect(item, 'secondary')}
                                            className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                        >+ Comorbidity</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn space-y-8">
            {/* Standard standalone UI remains unchanged for backward compatibility or direct access */}
            <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">Revenue Optimized Coding</h3>
                                <p className="text-slate-500 text-sm font-medium">PDGM Payment Estimates & Clinical Ranking</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                            <DollarSign className="text-teal-500" size={16} />
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Base Rate:</span>
                            <span className="text-sm font-black text-slate-900">${BASE_RATE.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Patient Context Selectors (Local state used here) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admission Source</label>
                            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                                <button onClick={() => setAdmissionSource('community')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${admissionSource === 'community' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>COMMUNITY</button>
                                <button onClick={() => setAdmissionSource('institutional')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${admissionSource === 'institutional' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>INSTITUTIONAL</button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Episode Timing</label>
                            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                                <button onClick={() => setEpisodeTiming('early')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${episodeTiming === 'early' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>EARLY</button>
                                <button onClick={() => setEpisodeTiming('late')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${episodeTiming === 'late' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>LATE</button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Functional Level</label>
                            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                                {['low', 'medium', 'high'].map(level => (
                                    <button key={level} onClick={() => setFunctionalLevel(level)} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all uppercase ${functionalLevel === level ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{level}</button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Comorbidity</label>
                            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                                {['none', 'low', 'high'].map(adj => (
                                    <button key={adj} onClick={() => setComorbidityAdjustment(adj)} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all uppercase ${comorbidityAdjustment === adj ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{adj}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                    {searchInputUI}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold animate-shake">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {results && (
                <div className="grid grid-cols-1 gap-6 animate-fadeInUp">
                    <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Activity size={20} className="text-teal-500" /> Ranked Clinical Options
                            </h4>
                            <div className="bg-teal-50 text-teal-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-100">
                                {results.length} Scenarios Calculated
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                                    <tr>
                                        <th className="px-8 py-4 w-16 text-center">Rank</th>
                                        <th className="px-8 py-4">Diagnosis & Code</th>
                                        <th className="px-8 py-4">Group & Weight</th>
                                        <th className="px-8 py-4 text-right">Est. Reimbursement</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {results.map((item, index) => (
                                        <React.Fragment key={item.code}>
                                            <tr className={`hover:bg-slate-50/50 transition-colors group cursor-default ${index === 0 ? 'bg-teal-50/20' : ''}`}>
                                                <td className="px-8 py-6 text-center">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm mx-auto shadow-sm ${index === 0 ? 'bg-teal-500 text-white ring-4 ring-teal-500/20' : 'bg-slate-100 text-slate-400'}`}>#{index + 1}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-tighter">{item.code}</span>
                                                        {item.is_primary_allowed && <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={10} /> Primary Allowed</span>}
                                                    </div>
                                                    <p className="font-bold text-slate-900 text-lg leading-tight">{item.description}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Group:</span>
                                                            <span className="text-xs font-bold text-slate-700">{item.pdgm_grouping}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Case-Mix:</span>
                                                            <span className="text-xs font-bold text-slate-700">{item.final_weight}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <p className={`text-2xl font-black ${index === 0 ? 'text-teal-600' : 'text-slate-900'}`}><span className="text-sm align-top mr-0.5">$</span>{parseFloat(item.calculated_payment).toLocaleString()}</p>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">30-Day Payment</p>
                                                </td>
                                            </tr>
                                            <tr className={`${index === 0 ? 'bg-teal-50/10' : ''}`}>
                                                <td colSpan="4" className="px-8 pb-6">
                                                    <div className="bg-white/50 border border-slate-100 rounded-2xl p-4 flex gap-6 overflow-x-auto no-scrollbar">
                                                        <div className="flex-shrink-0 flex items-center gap-2"><Clipboard size={14} className="text-slate-400" /><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coding Tips:</span></div>
                                                        <div className="flex gap-4">
                                                            {item.tips.map((tip, i) => (
                                                                <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 whitespace-nowrap"><div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center text-[8px] font-black text-teal-600">{i+1}</div><p className="text-[10px] text-slate-600 font-bold">{tip}</p></div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-3"><Info className="text-teal-400" size={20} /><p className="text-[11px] font-medium text-slate-300 max-w-xl">Calculations based on <span className="text-teal-400 font-black">PDGM 2024 National Base Rate</span>. Ranking is determined by payment potential after applying clinical group weights and patient context modifiers.</p></div>
                            <button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Export Analysis Report</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ICD10Search;
