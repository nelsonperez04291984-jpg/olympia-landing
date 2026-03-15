import React, { useState } from 'react';
import { Search, Loader2, Info, MessageSquare } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const KNOWLEDGE_BASE = `
Olympia Home Health Knowledge Base:
- Services provided: Skilled Nursing, Physical Therapy, Occupational Therapy, Speech Therapy, Medical Social Worker services, and Certified Home Health Aides.
- Service Area: Orange County, California.
- Location: 2044 Beach Blvd, Suite 320, Huntington Beach, CA 92648.
- Contact: Phone (657) 377-0776. Emergency care and scheduling available 24/7 by phone.
- Insurance/Payment: We accept Medicare and select private insurances. Patients should call to verify specific coverage.
- Compliance: We provide equal opportunity care and do not discriminate based on race, color, national origin, disability, or age.
- Mission: To provide the highest quality of healthcare professionals in the comfort of your home, ensuring exceptional care with unparalleled compassion. RN-led clinical oversight.
- Leadership: The CEO of Olympia Home Health is Jeonalyn Ashby.
`;

const SYSTEM_INSTRUCTION = `You are the automated FAQ and Resource Center for Olympia Home Health. 
Answer the user's question accurately but ONLY using the provided Knowledge Base.
If the answer is not in the knowledge base, politely say "I'm sorry, I don't have that specific information in my resources. Please contact our office at (657) 377-0776 for assistance."
Do not provide general medical advice. If asked a medical question, direct them to call 911 or their doctor.
Keep answers concise, friendly, and easy to read. Use bullet points if applicable.

${KNOWLEDGE_BASE}`;

const AIFaq = () => {
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasAsked, setHasAsked] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setHasAsked(true);
        setIsLoading(true);
        setAnswer('');

        if (!API_KEY) {
            setTimeout(() => {
                setAnswer("I'm currently in 'Demo Mode' because the Gemini API key is missing. Add your `VITE_GEMINI_API_KEY` to `.env.local` to enable accurate AI answers based on the Olympia knowledge base!");
                setIsLoading(false);
            }, 1000);
            return;
        }

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash",
                systemInstruction: SYSTEM_INSTRUCTION
            });
            
            const result = await model.generateContent(query);
            const responseText = result.response.text();
            
            setAnswer(responseText);
        } catch (error) {
            console.error("AI FAQ error:", error);
            setAnswer("Sorry, I'm having trouble retrieving that information right now. Please call us at (657) 377-0776.");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to render markdown-like text (simple bullet points)
    const renderAnswer = (text) => {
        return text.split('\n').map((line, index) => {
            if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
                return (
                    <li key={index} className="ml-4 list-disc text-gray-700 mb-2">
                        {line.trim().substring(2).replace(/\*\*/g, '')}
                    </li>
                );
            }
            if (line.trim() === '') return <br key={index} />;
            return <p key={index} className="text-gray-700 mb-2">{line.replace(/\*\*/g, '')}</p>;
        });
    };

    return (
        <section id="faq" className="py-24 bg-purple-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 rounded-full filter blur-3xl opacity-30 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200 rounded-full filter blur-3xl opacity-30 transform -translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center mb-12 animate-fadeInUp">
                    <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4">
                        <MessageSquare className="text-purple-600 w-8 h-8" />
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        AI-Powered Resource Center
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Have questions about our services, insurance, or hiring? Ask our intelligent assistant to instantly search our knowledge base.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-purple-100 p-8 md:p-12 animate-fadeInUp animation-delay-200">
                    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., Do you accept Medicare?"
                            className="w-full pl-6 pr-16 py-4 rounded-full border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-lg text-gray-800 placeholder-gray-400 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !query.trim()}
                            className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full px-6 flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none"
                            aria-label="Ask Question"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                        </button>
                    </form>

                    {/* Quick Suggestion Chips */}
                    {!hasAsked && (
                        <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto mt-6">
                            {[
                                "What areas do you serve?",
                                "Do you provide physical therapy?",
                                "Where is your office located?"
                            ].map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => { setQuery(suggestion); setHasAsked(false); }}
                                    className="px-4 py-2 bg-purple-50 text-purple-700 text-sm rounded-full border border-purple-100 hover:bg-purple-100 transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Results Area */}
                    {hasAsked && (
                        <div className="mt-8 bg-purple-50 border-l-4 border-purple-500 rounded-r-xl p-6 transition-all duration-500">
                            {isLoading ? (
                                <div className="flex items-center gap-3 text-purple-600">
                                    <Loader2 className="animate-spin w-6 h-6" />
                                    <span className="font-medium animate-pulse">Searching our knowledge base...</span>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-2 text-gray-900 font-bold mb-3">
                                        <Info className="text-purple-600 w-5 h-5" />
                                        Answer:
                                    </div>
                                    <div className="text-lg leading-relaxed">
                                        {renderAnswer(answer)}
                                    </div>
                                    
                                    <div className="mt-6 text-sm text-gray-500 flex items-center justify-between border-t border-purple-200 pt-4">
                                        <span>Information generated from Olympia Home Health resources.</span>
                                        <a href="#contact" className="text-purple-600 hover:text-purple-800 font-medium">Contact a human →</a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default AIFaq;
