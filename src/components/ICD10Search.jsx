import React, { useState } from 'react';
import { Search, Loader2, Clipboard, CheckCircle2, AlertCircle, Stethoscope, Info, TrendingUp, DollarSign, Activity, FileText } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ICD10Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Patient Context State for PDGM
    const [admissionSource, setAdmissionSource] = useState('community'); // 'community' | 'institutional'
    const [episodeTiming, setEpisodeTiming] = useState('early'); // 'early' | 'late'
    const [functionalLevel, setFunctionalLevel] = useState('medium'); // 'low' | 'medium' | 'high'
    const [comorbidityAdjustment, setComorbidityAdjustment] = useState('none'); // 'none' | 'low' | 'high'

    const BASE_RATE = 2038.39; // 2024 PDGM Base Rate

    const calculateReimbursement = (baseWeight) => {
        // Simplified PDGM calculation logic
        // Factors based on typical CMS 2024 Case-Mix weight variations
        let multiplier = 1.0;
        
        if (admissionSource === 'institutional') multiplier *= 1.2;
        if (episodeTiming === 'early') multiplier *= 1.15;
        
        if (functionalLevel === 'high') multiplier *= 1.4;
        else if (functionalLevel === 'medium') multiplier *= 1.25;
        
        if (comorbidityAdjustment === 'high') multiplier *= 1.2;
        else if (comorbidityAdjustment === 'low') multiplier *= 1.1;

        const weight = baseWeight * multiplier;
        return {
            amount: (BASE_RATE * weight).toFixed(2),
            finalWeight: weight.toFixed(4)
        };
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError('');
        setResults(null);

        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

        if (!API_KEY) {
            setError('System Error: API Key not configured. Please contact support.');
            setIsLoading(false);
            return;
        }

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
            You are a professional Medical Coding & PDGM Analyst.
            Search for ICD-10 diagnosis codes related to: "${query}".
            
            Return a list of the top 4 most relevant codes.
            For each code, provide:
            1. Official ICD-10 code and description.
            2. PDGM Clinical Group (e.g., Neuro Rehab, MMTA, Wounds).
            3. Estimated base Case-Mix Weight (between 0.8 and 2.5).
            4. Clinical Priority (Primary vs Secondary).
            5. Implementation tips for documentation.
            6. Whether it is allowed as a primary diagnosis under PDGM.

            Respond ONLY with a strict JSON array of objects.
            [
                {
                    "code": "ICD-10 Code",
                    "description": "Full Description",
                    "pdgm_grouping": "Clinical Group",
                    "base_weight": 1.25,
                    "is_primary_allowed": true,
                    "priority": "Primary",
                    "tips": ["Tip 1", "Tip 2"]
                }
            ]
            `;

            const result = await model.generateContent(prompt);
            let responseText = result.response.text();
            
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error("Invalid response format");
            
            const data = JSON.parse(jsonMatch[0]);
            
            // Calculate and Rank
            const enrichedResults = data.map(item => {
                const calc = calculateReimbursement(item.base_weight);
                return {
                    ...item,
                    calculated_payment: calc.amount,
                    final_weight: calc.finalWeight
                };
            }).sort((a, b) => b.calculated_payment - a.calculated_payment);

            setResults(enrichedResults);
        } catch (err) {
            console.error("Search Error:", err);
            setError(`Search failed: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn space-y-8">
            {/* Header & Context Selector */}
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
                    {/* Patient Context Selectors */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admission Source</label>
                            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                                <button 
                                    onClick={() => setAdmissionSource('community')}
                                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${admissionSource === 'community' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >COMMUNITY</button>
                                <button 
                                    onClick={() => setAdmissionSource('institutional')}
                                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${admissionSource === 'institutional' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >INSTITUTIONAL</button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Episode Timing</label>
                            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                                <button 
                                    onClick={() => setEpisodeTiming('early')}
                                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${episodeTiming === 'early' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >EARLY</button>
                                <button 
                                    onClick={() => setEpisodeTiming('late')}
                                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${episodeTiming === 'late' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                >LATE</button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Functional Level</label>
                            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                                {['low', 'medium', 'high'].map(level => (
                                    <button 
                                        key={level}
                                        onClick={() => setFunctionalLevel(level)}
                                        className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all uppercase ${functionalLevel === level ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                    >{level}</button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Comorbidity</label>
                            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                                {['none', 'low', 'high'].map(adj => (
                                    <button 
                                        key={adj}
                                        onClick={() => setComorbidityAdjustment(adj)}
                                        className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all uppercase ${comorbidityAdjustment === adj ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                                    >{adj}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors">
                            <Search className={`w-5 h-5 ${query ? 'text-teal-500' : 'text-slate-400'}`} />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter diagnosis description or code to rank reimbursement impact..."
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-32 py-5 text-slate-900 font-medium focus:outline-none focus:border-teal-500/50 focus:bg-white transition-all shadow-sm"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Run PDGM Logic'}
                        </button>
                    </form>
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
                    {/* Results Table/List */}
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
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm mx-auto shadow-sm ${
                                                    index === 0 ? 'bg-teal-500 text-white ring-4 ring-teal-500/20' : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                    #{index + 1}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-tighter">
                                                        {item.code}
                                                    </span>
                                                    {item.is_primary_allowed && (
                                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                                                            <CheckCircle2 size={10} /> Primary Allowed
                                                        </span>
                                                    )}
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
                                                <p className={`text-2xl font-black ${index === 0 ? 'text-teal-600' : 'text-slate-900'}`}>
                                                    <span className="text-sm align-top mr-0.5">$</span>
                                                    {parseFloat(item.calculated_payment).toLocaleString()}
                                                </p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">30-Day Payment</p>
                                            </td>
                                        </tr>
                                        {/* Nested documentation tips */}
                                        <tr className={`${index === 0 ? 'bg-teal-50/10' : ''}`}>
                                            <td colSpan="4" className="px-8 pb-6">
                                                <div className="bg-white/50 border border-slate-100 rounded-2xl p-4 flex gap-6 overflow-x-auto no-scrollbar">
                                                    <div className="flex-shrink-0 flex items-center gap-2">
                                                        <Clipboard size={14} className="text-slate-400" />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coding Tips:</span>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        {item.tips.map((tip, i) => (
                                                            <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 whitespace-nowrap">
                                                                <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center text-[8px] font-black text-teal-600">
                                                                    {i+1}
                                                                </div>
                                                                <p className="text-[10px] text-slate-600 font-bold">{tip}</p>
                                                            </div>
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
                        
                        {/* Legend / Info */}
                        <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <Info className="text-teal-400" size={20} />
                                <p className="text-[11px] font-medium text-slate-300 max-w-xl">
                                    Calculations based on <span className="text-teal-400 font-black">PDGM 2024 National Base Rate</span>. Ranking is determined by payment potential after applying clinical group weights and patient context modifiers.
                                </p>
                            </div>
                            <button className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                Export Analysis Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ICD10Search;
