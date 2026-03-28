import React, { useState, useEffect, useRef } from 'react'
import { Shield, Heart, Users, Award, Clock, MapPin, Phone, Mail, CheckCircle, Search, XCircle, ArrowRight, Loader2 } from 'lucide-react'
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
const CommitmentCard = ({ title, description, icon: Icon }) => (
    <div className="flex gap-4 p-4 rounded-xl bg-purple-50 shadow-md border-l-4 border-purple-500 transition-shadow hover:shadow-lg">
        <Icon className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
        <div>
            <p className="font-bold text-gray-900 mb-1">{title}</p>
            <p className="text-sm text-gray-700">{description}</p>
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
                        <CheckCircle size={24} className="flex-shrink-0 mt-0.5"/>
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
                        <XCircle size={24} className="flex-shrink-0 mt-0.5"/>
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
                        <Loader2 size={20} className="animate-spin"/>
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
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-xl border-t-4 border-purple-500 relative overflow-hidden">
             
            <h4 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Intelligent Care Matcher
            </h4>
            <p className="text-center text-sm text-gray-500 mb-6">Powered by AI</p>

            <form onSubmit={checkServiceArea} className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder='e.g., "My dad needs physical therapy in Huntington Beach"'
                    value={location}
                    onChange={(e) => {
                        setLocation(e.target.value);
                        if (status !== 'initial') setStatus('initial'); 
                    }}
                    required
                    className="flex-grow p-4 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 transition duration-300 text-gray-800 placeholder-gray-400"
                />
                <button
                    type="submit"
                    disabled={status === 'checking' || location.trim() === ''}
                    className="flex items-center justify-center p-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition duration-300 disabled:bg-purple-300 sm:w-auto w-full"
                >
                    {status === 'checking' ? (
                        <span className="flex items-center gap-2"><Loader2 size={20} className="animate-spin" /> Checking</span>
                    ) : (
                        <span className="flex items-center gap-2"><Search size={20} /> Match Care</span>
                    )}
                </button>
            </form>
            
            {renderStatusMessage()}

            {status === 'served' && (
                <a 
                    href="#contact" 
                    className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 text-lg font-bold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-all"
                >
                    Start My Care Now <ArrowRight size={20} className="ml-2"/>
                </a>
            )}
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
            icon: Heart
        },
        {
            title: "RN-Led Clinical Oversight",
            description: "Every care team is managed and monitored by Registered Nurses (RNs) to ensure adherence to the highest clinical and safety standards.",
            icon: Shield
        },
        {
            title: "Unwavering Family Communication",
            description: "We provide consistent, transparent updates to family members, ensuring confidence and peace of mind regarding the care their loved ones receive.",
            icon: Users
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
                        <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-8 shadow-2xl border-2 border-purple-200 h-full">
                            <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Heart className="text-purple-600 w-8 h-8" /> Our Foundation of Care
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
                        <div className="bg-gradient-to-br from-white to-purple-100 rounded-3xl p-8 shadow-2xl border-2 border-purple-200 h-full">
                             <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Award className="text-purple-600 w-8 h-8" /> Our Unwavering Commitments
                            </h3>
                            <div className="space-y-4">
                                {commitments.map((item, i) => (
                                    <CommitmentCard 
                                        key={i} 
                                        title={item.title} 
                                        description={item.description}
                                        icon={item.icon}
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
                                <img 
                                    src="/achc-logo.png" 
                                    alt="ACHC Certification" 
                                    className="relative w-40 h-40 object-contain drop-shadow-xl transform transition-transform group-hover:rotate-6 active:scale-95" 
                                />
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

                {/* Service Areas with Map */}
                <div className={`mb-16 transition-all duration-1000 delay-600 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="bg-gradient-to-br from-purple-600 to-purple-900 rounded-3xl p-8 md:p-12 shadow-2xl text-white">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            
                            {/* Left: Service Areas List */}
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <MapPin className="text-purple-200" size={32} />
                                    <h3 className="text-3xl font-bold">Comprehensive Coverage — San Diego to Kern County</h3>
                                </div>
                                <p className="text-purple-100 mb-8 text-lg">
                                    Professional home health care services available across Southern California, spanning 7 counties:
                                </p>
                                <div className="space-y-4">
                                    {[
                                        { county: 'Orange County', cities: 'Huntington Beach, Irvine, Anaheim, Santa Ana, Newport Beach & more' },
                                        { county: 'San Diego County', cities: 'San Diego, Chula Vista, Oceanside, Carlsbad & more' },
                                        { county: 'Los Angeles County', cities: 'Los Angeles, Long Beach, Pasadena, Torrance & more' },
                                        { county: 'Riverside County', cities: 'Riverside, Corona, Temecula, Palm Springs & more' },
                                        { county: 'San Bernardino County', cities: 'San Bernardino, Ontario, Rancho Cucamonga & more' },
                                        { county: 'Ventura County', cities: 'Ventura, Oxnard, Thousand Oaks, Simi Valley & more' },
                                        { county: 'Kern County', cities: 'Bakersfield, Tehachapi, Delano & more' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 group">
                                            <CheckCircle className="text-emerald-400 flex-shrink-0 mt-0.5 group-hover:scale-125 transition-transform" size={18} />
                                            <div>
                                                <span className="text-white font-semibold">{item.county}</span>
                                                <span className="text-purple-200 text-sm ml-2">— {item.cities}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                                    <p className="text-purple-100 text-sm">
                                        <strong className="text-white">Need Confirmation?</strong> If your area isn't listed, please contact us Monday–Friday, 9AM–5PM at <a href="tel:6573770776" className="text-emerald-300 hover:text-emerald-200 transition-colors font-semibold">(657) 377-0776</a> to confirm availability.
                                    </p>
                                </div>
                            </div>

                            {/* Right: Interactive Map (Original structure preserved) */}
                            <div className="relative">
                                <div className="bg-white rounded-2xl p-4 shadow-2xl">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3322.123!2d-117.9530!3d33.6846!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80dd268e46639c73%3A0x5fa279993a2740d6!2s20422%20Beach%20Blvd%20%23320%2C%20Huntington%20Beach%2C%20CA%2092648!5e0!3m2!1sen!2sus!4v1234567890" 
                                        width="100%"
                                        height="400"
                                        style={{ border: 0, borderRadius: '12px' }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Olympia Home Health Location"
                                    ></iframe>
                                    <div className="mt-4 text-center">
                                        <p className="text-gray-900 font-semibold">Our Office</p>
                                        <p className="text-gray-600 text-sm">20422 Beach Blvd, Suite 320, Huntington Beach, CA 92648</p>
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