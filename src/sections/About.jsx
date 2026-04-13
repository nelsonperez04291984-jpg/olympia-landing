import React, { useState, useEffect, useRef } from 'react'
import { Shield, Heart, Users, Award, Clock, MapPin, Phone, Mail, CheckCircle, Search, XCircle, ArrowRight, Loader2, Zap } from 'lucide-react'
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- 1. Intersection Observer hook ---
const useInView = (threshold = 0.1) => {
    const [isInView, setIsInView] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsInView(entry.isIntersecting)
        }, { threshold })

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current)
            }
        }
    }, [threshold])

    return [ref, isInView]
}

// --- Component for Marketing Details (Commitment Items, kept as it's used above) ---
const CommitmentCard = ({ title, description, iconSrc }) => (
    <div className="flex gap-5 p-6 rounded-3xl bg-white shadow-2xl shadow-purple-900/5 border border-purple-50 transition-all hover:-translate-y-1 hover:shadow-purple-900/10 group">
        <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-purple-200 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity"></div>
            <img src={iconSrc} alt={title} className="relative w-16 h-16 object-contain" />
        </div>
        <div>
            <p className="font-black text-gray-900 mb-1 text-lg">{title}</p>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">{description}</p>
        </div>
    </div>
);

// --- NEW COMPONENT: Interactive Service Area Checker (AI Powered) ---
const ServiceAreaChecker = ({ serviceAreas }) => {
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('initial'); // 'initial', 'checking', 'served', 'unserved'
    const [explanation, setExplanation] = useState('');

    const checkServiceArea = async (e) => {
        e.preventDefault();
        if (!location.trim()) {
            setStatus('initial');
            return;
        }

        setStatus('checking');
        setExplanation('');

        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

        if (!API_KEY) {
            // Fallback simulated async check if no API key
            setTimeout(() => {
                const normalizedInput = location.toLowerCase().trim();
                const isServed = serviceAreas.some(area =>
                    area.toLowerCase().includes(normalizedInput)
                );
                if (isServed) {
                    setStatus('served');
                    setExplanation("Demo Mode: Area matches our basic list.");
                } else {
                    setStatus('unserved');
                    setExplanation("Demo Mode: Area not recognized in basic list.");
                }
            }, 800);
            return;
        }

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
            You are an intelligent intake assistant for Olympia Home Health (based in Huntington Beach, CA).
            A user has entered the following message to check if we serve them: "${location}".
            
            Our coverage spans from San Diego County to Kern County, including all of Southern California. Our primary service areas (cities and counties): ${serviceAreas.join(', ')}.
            
            Task:
            1. Determine if the location mentioned is within our service area. If they don't mention a location, assume we need to ask.
            2. If they mentioned any specific medical needs (e.g. physical therapy, post-surgery, dementia), acknowledge it gently.
            
            Respond with a strict JSON object exactly in this format without any markdown wrappers (no \`\`\`json):
            {
              "isServed": true or false,
              "message": "A short, empathetic sentence explaining the result. E.g., 'Great news! We serve Huntington Beach and can definitely help with post-surgery physical therapy.' OR 'We primarily serve Orange County, but let's see what we can do for your specific needs.'"
            }
            `;

            const result = await model.generateContent(prompt);
            let responseText = result.response.text().trim();
            console.log("Raw Gemini Response:", responseText); // Debugging line

            // Clean up any potential markdown formatting the model might still add
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '');
            const match = responseText.match(/\{[\s\S]*\}/);
            if (match) {
                responseText = match[0];
            }

            const data = JSON.parse(responseText);

            setExplanation(data.message);
            setStatus(data.isServed ? 'served' : 'unserved');
        } catch (error) {
            console.error("AI Service Area check error:", error);
            // Fallback to basic string matching
            const normalizedInput = location.toLowerCase().trim();
            const isServed = serviceAreas.some(area => area.toLowerCase().includes(normalizedInput));
            setStatus(isServed ? 'served' : 'unserved');
            setExplanation(isServed ? "Great New! We serve your area." : "Please call to confirm availability.");
        }
    };

    const renderStatusMessage = () => {
        switch (status) {
            case 'served':
                return (
                    <div className="bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-lg flex items-start gap-3 mt-6">
                        <CheckCircle size={24} className="flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-lg mb-1">Care is Available</p>
                            <p className="text-emerald-700">{explanation}</p>
                            <p className="mt-2 text-sm">You qualify for immediate care coordination. Click below to start your free assessment.</p>
                        </div>
                    </div>
                );
            case 'unserved':
                return (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-lg flex items-start gap-3 mt-6">
                        <XCircle size={24} className="flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-lg mb-1">Let's Discuss Your Needs</p>
                            <p className="text-red-700">{explanation}</p>
                            <p className="mt-2 text-sm">Please call us immediately at **(657) 377-0776** to confirm if we can accommodate your specific situation.</p>
                        </div>
                    </div>
                );
            case 'checking':
                return (
                    <div className="bg-purple-100 text-purple-800 p-4 rounded-lg flex items-center justify-center gap-3 mt-6">
                        <Loader2 size={20} className="animate-spin" />
                        <p>Analyzing your request...</p>
                    </div>
                );
            case 'initial':
            default:
                return (
                    <p className="text-gray-600 mt-4 text-center">Type your city, zip code, or specific needs (e.g. "Physical therapy in Irvine").</p>
                );
        }
    }


    return (
        <div className="max-w-3xl mx-auto p-10 bg-white/40 backdrop-blur-xl rounded-[40px] shadow-[0_32px_64px_-16px_rgba(88,28,135,0.15)] border border-white/60 relative overflow-hidden group">
            {/* Animated Glow Backdrop */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-400/20 rounded-full filter blur-[80px] group-hover:bg-purple-400/30 transition-colors duration-700"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-400/10 rounded-full filter blur-[80px] group-hover:bg-emerald-400/20 transition-colors duration-700"></div>

            <div className="relative z-10">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-2xl mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        <Zap size={32} className="text-white fill-purple-200/50" />
                    </div>
                    <h4 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                        Intelligent Care Matcher
                    </h4>
                    <div className="flex items-center gap-2">
                        <span className="h-px w-8 bg-purple-200"></span>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                            Powered by Olympia AI
                        </p>
                        <span className="h-px w-8 bg-purple-200"></span>
                    </div>
                </div>

                <form onSubmit={checkServiceArea} className="relative max-w-2xl mx-auto">
                    <div className="relative flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-[30px] border-2 border-purple-100 shadow-xl focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all duration-500">
                        <div className="flex-grow flex items-center pl-6 w-full">
                            <Search className="text-purple-300 mr-3" size={20} />
                            <input
                                type="text"
                                placeholder='e.g., "I need wound care in Huntington Beach"'
                                value={location}
                                onChange={(e) => {
                                    setLocation(e.target.value);
                                    if (status !== 'initial') setStatus('initial');
                                }}
                                required
                                className="w-full py-4 bg-transparent text-gray-800 font-semibold focus:outline-none placeholder-gray-400"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'checking' || location.trim() === ''}
                            className={`
                                flex items-center justify-center px-10 py-4 rounded-[22px] font-black text-xs uppercase tracking-widest text-white shadow-lg transition-all duration-300 group/btn
                                ${status === 'checking' ? 'bg-purple-300' : 'bg-gradient-to-r from-purple-600 to-purple-800 hover:scale-[1.02] hover:shadow-purple-500/40 active:scale-95'}
                                sm:w-auto w-full
                            `}
                        >
                            {status === 'checking' ? (
                                <><Loader2 size={16} className="animate-spin mr-2" /> Mapping...</>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Match My Care <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </div>
                    <p className="mt-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Verify coverage for cities, zip codes, or specific medical needs
                    </p>
                </form>

                <div className="max-w-2xl mx-auto">
                    {renderStatusMessage()}
                </div>

                {status === 'served' && (
                    <div className="mt-8 flex justify-center animate-bounceIn">
                        <a
                            href="#contact"
                            className="inline-flex items-center px-12 py-5 text-lg font-black text-white bg-emerald-500 rounded-full hover:bg-emerald-600 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] hover:scale-105 transition-all"
                        >
                            Start Coordination Now <ArrowRight size={20} className="ml-3" />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};
// --- END NEW COMPONENT ---


const About = () => {
    const [ref, isInView] = useInView()

    // Coverage from San Diego County to Kern County
    const serviceAreas = [
        // Orange County
        'Huntington Beach', 'Fountain Valley', 'Westminster', 'Garden Grove', 'Costa Mesa', 'Newport Beach', 'Santa Ana', 'Anaheim', 'Orange', 'Irvine', 'Tustin', 'Seal Beach', 'Fullerton', 'Laguna Beach', 'Mission Viejo', 'Lake Forest',
        // San Diego County
        'San Diego', 'Chula Vista', 'Oceanside', 'Escondido', 'Carlsbad', 'Vista', 'El Cajon', 'Encinitas',
        // Riverside County
        'Riverside', 'Corona', 'Temecula', 'Murrieta', 'Palm Springs', 'Moreno Valley', 'Hemet',
        // San Bernardino County
        'San Bernardino', 'Ontario', 'Rancho Cucamonga', 'Fontana', 'Victorville', 'Redlands',
        // Los Angeles County
        'Los Angeles', 'Long Beach', 'Pasadena', 'Torrance', 'Pomona', 'Downey', 'Whittier', 'Burbank', 'Santa Clarita',
        // Ventura County
        'Ventura', 'Oxnard', 'Thousand Oaks', 'Simi Valley', 'Camarillo',
        // Kern County
        'Bakersfield', 'Tehachapi', 'Ridgecrest', 'Delano',
    ];

    // Data for the Core Commitment section
    const commitments = [
        {
            title: "Holistic & Patient-Centered Care",
            description: "We focus on the patient's dignity and independence, integrating physical needs with emotional and social well-being in every tailored plan.",
            iconSrc: "/assets/branding/icon_comfort.png"
        },
        {
            title: "RN-Led Clinical Oversight",
            description: "Every care team is managed and monitored by Registered Nurses (RNs) to ensure adherence to the highest clinical and safety standards.",
            iconSrc: "/assets/branding/icon_oversight.png"
        },
        {
            title: "Unwavering Family Communication",
            description: "We provide consistent, transparent updates to family members, ensuring confidence and peace of mind regarding the care their loved ones receive.",
            iconSrc: "/assets/branding/icon_community.png"
        }
    ]

    return (
        <section id="about" className="py-24 bg-white relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-20 left-0 w-96 h-96 bg-emerald-100 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-20 right-0 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-20"></div>

            <div ref={ref} className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Section Header */}
                <div className={`text-center mb-16 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
                        About Olympia Home Health
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        Your Trusted Partner for Compassionate Home Health Care
                    </h2>
                    <p className="text-2xl text-purple-700 font-bold mb-4">
                        Bringing Exceptional Care and Comfort Right to Your Doorstep.
                    </p>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Olympia Home Health Inc is dedicated to providing coordinated, comprehensive, and patient-centered services to homebound individuals across Southern California — from San Diego to Kern County.
                    </p>
                </div>

                {/* Main Content Grid - Mission Statement and Commitments */}
                <div className="grid md:grid-cols-2 gap-12 items-start mb-16">

                    {/* Left Column: Mission Statement */}
                    <div className={`transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
                        <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-8 shadow-2xl border-2 border-purple-200 h-full relative overflow-hidden">
                            <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-4">
                                <img src="/assets/branding/icon_comfort.png" alt="Foundation" className="w-12 h-12 object-contain" />
                                Our Foundation of Care
                            </h3>
                            <p className="text-xl text-purple-700 leading-relaxed font-semibold mb-6">
                                "Our mission is simple: to provide the highest quality of healthcare professionals in the comfort of your home, ensuring every patient receives **exceptional care with unparalleled compassion.**"
                            </p>
                            <p className="text-base text-gray-700 leading-relaxed border-l-4 border-emerald-400 pl-4 py-2 italic">
                                We manage complex care needs with expertise, allowing patients and their families to focus on recovery and peace of mind in a familiar environment. Our goal is to empower independence and promote healing where life is lived best—at home.
                            </p>
                            <div className="mt-8 p-3 bg-emerald-100 rounded-lg text-center">
                                <p className="text-sm font-bold text-emerald-800">
                                    Care and Scheduling inquiries are available **Monday–Friday, 9AM–5PM** by phone.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Core Commitments */}
                    <div className={`transition-all duration-1000 delay-300 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
                        <div className="bg-gradient-to-br from-white to-purple-100 rounded-3xl p-8 shadow-2xl border-2 border-purple-200 h-full relative">
                            <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-4">
                                <img src="/assets/branding/icon_oversight.png" alt="Commitments" className="w-12 h-12 object-contain" />
                                Our Unwavering Commitments
                            </h3>
                            <div className="space-y-4">
                                {commitments.map((item, i) => (
                                    <CommitmentCard
                                        key={i}
                                        title={item.title}
                                        description={item.description}
                                        iconSrc={item.iconSrc}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACHC ACCREDITATION HIGHLIGHT */}
                <div className={`mb-16 transition-all duration-1000 delay-400 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl p-8 border-2 border-yellow-200 shadow-xl overflow-hidden relative">
                        {/* Decorative background circle */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-yellow-200 rounded-full opacity-20"></div>

                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-2xl animate-pulse"></div>
                                <div className="achc-seal-container achc-seal-shadow w-40 h-40 transform transition-transform group-hover:rotate-6 active:scale-95">
                                    <img
                                        src="/ACHC.png"
                                        alt="ACHC Certification"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <span className="inline-block px-4 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-bold mb-3 uppercase tracking-wider">
                                    Gold Standard of Care
                                </span>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">Accredited Excellence</h3>
                                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                                    Olympia Home Health Inc. is proud to be accredited by the **Accreditation Commission for Health Care (ACHC)**. This prestigious accreditation reflects our commitment to meeting the highest national standards for quality, safety, and clinical excellence.
                                </p>
                                <p className="text-gray-600 italic">
                                    "When you choose an ACHC-accredited provider, you're choosing a partner dedicated to the best possible patient outcomes."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SERVICE AREA CHECKER (REPLACEMENT SECTION) */}
                <div className={`mb-16 transition-all duration-1000 delay-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    {/* CONFIRMED: THE MARKETING HEADLINE IS STILL HERE */}
                    <h3 className="text-4xl font-bold text-gray-900 mb-3 text-center">
                        No Matter How Far, We're Here For You
                    </h3>
                    <p className="text-lg text-gray-600 mb-10 text-center max-w-3xl mx-auto">
                        **We bring exceptional, trusted healthcare directly to your home.** Verify your service availability instantly and start your care plan today.
                    </p>

                    <ServiceAreaChecker serviceAreas={serviceAreas} />
                </div>

                {/* --- ADVANCED SERVICE AREAS BENTO --- */}
                <div className={`mb-24 transition-all duration-[1500ms] ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}>
                    <div className="bg-gradient-to-br from-white to-purple-50 rounded-[48px] p-8 md:p-16 shadow-2xl shadow-purple-900/10 border border-purple-100 relative overflow-hidden group/bento">
                        {/* Immersive Background Elements */}
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-200/20 rounded-full filter blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100/20 rounded-full filter blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
                        
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                                <div className="max-w-2xl">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center border border-purple-200">
                                            <MapPin className="text-purple-600" size={24} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600">Regional Coverage</span>
                                    </div>
                                    <h3 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
                                        Clinical Presence
                                    </h3>
                                    <p className="text-gray-600 text-lg font-medium leading-relaxed">
                                        Providing premium home health coordination across **Southern California**, spanning 7 strategic counties.
                                    </p>
                                </div>
                                <div className="hidden lg:block">
                                    <div className="bg-white/60 border border-purple-100 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="flex -space-x-2">
                                                {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-purple-600 flex items-center justify-center text-[10px] font-black text-white">BSN</div>)}
                                            </div>
                                            <p className="text-[10px] font-black text-purple-900 uppercase tracking-widest leading-tight">Professional units<br/>Active coordination</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-12 gap-6 items-start">
                                {/* Left Side: Bento Cards for Counties */}
                                <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
                                    {[
                                        { county: 'Orange County', cities: 'Huntington Beach, Irvine, Anaheim', size: 'col-span-2', icon: '01' },
                                        { county: 'San Diego', cities: 'Chula Vista, Oceanside', size: 'col-span-1', icon: '02' },
                                        { county: 'Los Angeles', cities: 'Long Beach, Pasadena', size: 'col-span-1', icon: '03' },
                                        { county: 'Riverside', cities: 'Corona, Temecula', size: 'col-span-1', icon: '04' },
                                        { county: 'San Bernardino', cities: 'Ontario, Rancho Cucamonga', size: 'col-span-1', icon: '05' },
                                        { county: 'Ventura', cities: 'Oxnard, Thousand Oaks', size: 'col-span-1', icon: '06' },
                                        { county: 'Kern County', cities: 'Bakersfield, Delano', size: 'col-span-1', icon: '07' },
                                    ].map((item, i) => (
                                        <div 
                                            key={i} 
                                            className={`${item.size} group/tile bg-white hover:bg-purple-50 rounded-[28px] p-6 shadow-xl shadow-purple-900/5 border border-purple-100/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-purple-900/10`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[10px] font-black text-purple-300 uppercase tracking-tighter">Region {item.icon}</span>
                                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100 group-hover/tile:bg-purple-600 group-hover/tile:border-purple-600 transition-all">
                                                    <CheckCircle className="text-purple-600 group-hover/tile:text-white" size={14} />
                                                </div>
                                            </div>
                                            <h4 className="text-xl font-black text-gray-900 mb-2">{item.county}</h4>
                                            <p className="text-gray-500 text-xs font-medium leading-relaxed">
                                                Home Health Services in {item.cities} & Surrounding Areas
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Right Side: Map UI */}
                                <div className="lg:col-span-5 space-y-6">
                                    <div className="bg-white rounded-[36px] p-2 shadow-2xl border border-purple-100 overflow-hidden relative group/map">
                                        <div className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-xl border border-purple-200 rounded-2xl p-4 shadow-xl">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-[8px] font-black text-gray-900 uppercase tracking-[0.2em]">Operational HQ</span>
                                            </div>
                                            <h5 className="text-xs font-black text-purple-700">Huntington Beach, CA</h5>
                                        </div>

                                        <div className="relative overflow-hidden rounded-[30px] border border-purple-50">
                                            <iframe
                                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3322.123!2d-117.9530!3d33.6846!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80dd268e46639c73%3A0x5fa279993a2740d6!2s20422%20Beach%20Blvd%20%23320%2C%20Huntington%20Beach%2C%20CA%2092648!5e0!3m2!1sen!2sus!4v1234567890"
                                                width="100%"
                                                height="420"
                                                style={{ border: 0 }}
                                                allowFullScreen=""
                                                loading="lazy"
                                                title="Operations Map"
                                            ></iframe>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-[36px] p-8 shadow-2xl relative overflow-hidden group/cta">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
                                            <Phone size={120} className="text-white fill-white" />
                                        </div>
                                        <div className="relative z-10">
                                            <h4 className="text-2xl font-black text-white mb-4">Direct Intake Coordination</h4>
                                            <p className="text-purple-100 text-sm font-medium leading-relaxed mb-6">
                                                Unauthorized in your city? Our team can authorize extended range cases immediately.
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <a href="tel:6573770776" className="px-8 py-4 bg-white text-purple-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                                                    (657) 377-0776
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Non-Discrimination Statement */}
                <div className={`bg-gradient-to-r from-purple-100 to-blue-100 rounded-3xl p-8 shadow-lg mb-12 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Equal Opportunity Care: Our Commitment to Fairness</h3>
                    <p className="text-gray-700 leading-relaxed text-sm text-center max-w-4xl mx-auto">
                        Pursuant to title VI of the Civil Right Act of 1964, Section 504 of the Rehabilitation Act of 1973 and the age Discrimination Act of 1975 and their implementing regulations, Olympia Home Health Inc, does not discriminate in the provision of services and employment because of race color, national origin, disability or age. For further information regarding services or employment or to file a complaint, contact Olympia Home Health Inc at (657) 377-0776.
                    </p>
                </div>

                {/* CTA Button - HIGHLY IMPROVED MARKETING CTA */}
                <div className="text-center">
                    <a
                        href="#contact"
                        className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-purple-600 to-purple-800 rounded-full hover:from-purple-700 hover:to-purple-900 shadow-xl transition-all hover:scale-105 hover:shadow-purple-400/50"
                    >
                        Schedule Your Free Consultation
                    </a>
                    <p className="mt-4 text-purple-700 font-semibold text-lg">
                        📞 **Your first consultation is complimentary and without obligation.**
                    </p>
                </div>
            </div>
        </section>
    )
}

export default About