import React, { useState } from 'react';
import { Search, Loader2, Clipboard, CheckCircle2, AlertCircle, Stethoscope, Info } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ICD10Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
            You are a professional Medical Coding Assistant for a Home Health Agency.
            Search for the following ICD-10 diagnosis code or clinical term: "${query}".

            Respond ONLY with a strict JSON object. No markdown, no preamble.
            {
                "code": "ICD-10 Code",
                "description": "Full Official Description",
                "pdgm_grouping": "PDGM Clinical Grouping",
                "is_primary_allowed": true/false,
                "comorbidity_hits": "Description of comorbidity tier impact",
                "clinical_tips": ["Tip 1", "Tip 2"],
                "related_codes": ["Code 1", "Code 2"]
            }
            `;

            const result = await model.generateContent(prompt);
            let responseText = result.response.text();
            
            // Robust JSON extraction
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("Invalid response format from AI");
            }
            
            const data = JSON.parse(jsonMatch[0]);
            setResults(data);
        } catch (err) {
            console.error("ICD-10 Search Error:", err);
            // Better error message for the user
            const msg = err.message || "";
            if (msg.includes("404") || msg.includes("not found")) {
                setError("AI Model Configuration Error. Retrying with fallback...");
                // Try one fallback
                try {
                    const genAI = new GoogleGenerativeAI(API_KEY);
                    const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
                    const result = await fallbackModel.generateContent(`Search ICD10 for "${query}". Return JSON: {code, description, pdgm_grouping, is_primary_allowed, comorbidity_hits, clinical_tips:[], related_codes:[]}`);
                    const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        setResults(JSON.parse(jsonMatch[0]));
                        setError("");
                        return;
                    }
                } catch (e) {
                    setError(`Search failed. Error: ${e.message}`);
                }
            } else {
                setError(`Search error: ${msg}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                            <Stethoscope size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900">Clinical Coding Intelligence</h3>
                            <p className="text-slate-500">Search ICD-10-CM codes and PDGM clinical groupings.</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSearch} className="relative group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none transition-colors">
                            <Search className={`w-5 h-5 ${query ? 'text-teal-500' : 'text-slate-400'}`} />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by code (e.g. I11.0) or description (e.g. Heart Failure)..."
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-32 py-5 text-slate-900 font-medium focus:outline-none focus:border-teal-500/50 focus:bg-white transition-all shadow-sm"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {results && (
                        <div className="mt-8 space-y-6 animate-fadeInUp">
                            {/* Main Result Header */}
                            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1 bg-teal-500 text-slate-900 rounded-lg text-xs font-black uppercase tracking-widest">
                                            {results.code}
                                        </span>
                                        {results.is_primary_allowed && (
                                            <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <CheckCircle2 size={10} /> Primary Allowed
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-3xl font-black mb-4 leading-tight">{results.description}</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black uppercase text-teal-400 mb-1">Clinical Grouping</p>
                                            <p className="font-bold text-slate-200">{results.pdgm_grouping || 'N/A'}</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black uppercase text-teal-400 mb-1">Comorbidity Impact</p>
                                            <p className="font-bold text-slate-200">{results.comorbidity_hits || 'None detected'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Clinical Tips Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 bg-white border border-slate-100 p-8 rounded-3xl shadow-xl shadow-slate-200/30">
                                    <h5 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                        <Clipboard size={18} className="text-teal-500" /> Documentation & Coding Tips
                                    </h5>
                                    <ul className="space-y-4">
                                        {results.clinical_tips.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-3 p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                                                <div className="w-6 h-6 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <span className="text-xs font-black text-teal-600">{i + 1}</span>
                                                </div>
                                                <p className="text-sm text-slate-700 font-medium leading-relaxed">{tip}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50">
                                        <Info className="text-teal-500 w-8 h-8" />
                                    </div>
                                    <h5 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-4">Related Codes</h5>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {results.related_codes.map((code, i) => (
                                            <div key={i} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm">
                                                {code}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                        Always verify against current ICD-10-CM guidelines and medical record.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ICD10Search;
