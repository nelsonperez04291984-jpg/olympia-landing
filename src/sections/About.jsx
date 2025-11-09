import React, { useState, useEffect, useRef } from 'react'
import { Shield, Heart, Users, Award, Clock, MapPin, Phone, Mail, CheckCircle, Search, XCircle, ArrowRight, Loader2 } from 'lucide-react'

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

// --- NEW COMPONENT: Interactive Service Area Checker ---
const ServiceAreaChecker = ({ serviceAreas }) => {
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('initial'); // 'initial', 'checking', 'served', 'unserved'

    const checkServiceArea = (e) => {
        e.preventDefault();
        if (!location.trim()) {
            setStatus('initial');
            return;
        }

        setStatus('checking');
        
        // --- SIMULATED ASYNC CHECK ---
        setTimeout(() => {
            const normalizedInput = location.toLowerCase().trim();
            
            // Logic: Check if the input (city or zip) is in the service area list
            const isServed = serviceAreas.some(area => 
                area.toLowerCase().includes(normalizedInput)
            );

            if (isServed) {
                setStatus('served');
            } else {
                setStatus('unserved');
            }
        }, 800); // Increased timeout to 800ms to make the 'checking' state more visible
    };
    
    const renderStatusMessage = () => {
        switch (status) {
            case 'served':
                return (
                    <div className="bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-lg flex items-center gap-3 mt-6">
                        <CheckCircle size={24} className="flex-shrink-0"/>
                        <div>
                            <p className="font-bold text-lg">Great News! We Serve Your Area.</p>
                            <p>You qualify for immediate care coordination. Click below to start your free assessment.</p>
                        </div>
                    </div>
                );
            case 'unserved':
                return (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-lg flex items-center gap-3 mt-6">
                        <XCircle size={24} className="flex-shrink-0"/>
                        <div>
                            <p className="font-bold text-lg">Check Required.</p>
                            <p>We primarily serve Orange County, but please call us immediately at **(657) 377-0776** to confirm availability outside our standard range.</p>
                        </div>
                    </div>
                );
            case 'checking':
                return (
                    <div className="bg-purple-100 text-purple-800 p-4 rounded-lg flex items-center justify-center gap-3 mt-6">
                        <Loader2 size={20} className="animate-spin"/>
                        <p>Confirming your service area...</p>
                    </div>
                );
            case 'initial':
            default:
                return (
                    <p className="text-gray-600 mt-4 text-center">Enter your city or zip code above to confirm instant service availability.</p>
                );
        }
    }


    return (
        <div className="max-w-xl mx-auto p-8 bg-white rounded-3xl shadow-xl border-t-4 border-purple-500">
            <h4 className="text-2xl font-bold text-gray-900 text-center mb-4">
                Verify Instant Coverage
            </h4>
            <form onSubmit={checkServiceArea} className="flex gap-3">
                <input
                    type="text"
                    placeholder="Enter City or Zip Code (e.g., 92648 or Huntington Beach)"
                    value={location}
                    onChange={(e) => {
                        setLocation(e.target.value);
                        // Reset status immediately on typing to encourage new search
                        if (status !== 'initial') setStatus('initial'); 
                    }}
                    required
                    className="flex-grow p-4 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 transition duration-300 text-gray-800"
                />
                <button
                    type="submit"
                    disabled={status === 'checking' || location.trim() === ''}
                    className="flex items-center justify-center p-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition duration-300 disabled:bg-purple-300"
                >
                    {status === 'checking' ? (
                        <Loader2 size={24} className="animate-spin" />
                    ) : (
                        <Search size={24} />
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

    // Combined list of cities and common zip codes for simple detection
    const serviceAreas = [
        'Huntington Beach', 'Fountain Valley', 'Westminster', 'Garden Grove', 'Costa Mesa', 'Newport Beach', 'Santa Ana', 'Anaheim', 'Orange', 'Irvine', 'Tustin', 'Seal Beach',
        '92648', '92649', '92708', '92704', '92703', '92843', '92844', '92627', '92660', '92705', '92806', '92868', '92780', '92605' 
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
                        Olympia Home Health Inc is dedicated to providing coordinated, comprehensive, and patient-centered services to homebound individuals across Orange County.
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
                                    Emergency Care and Scheduling are available **24/7** by phone.
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

                {/* SERVICE AREA CHECKER (REPLACEMENT SECTION) */}
                <div className={`mb-16 transition-all duration-1000 delay-400 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
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
                                    <h3 className="text-3xl font-bold">Comprehensive Coverage in Orange County</h3>
                                </div>
                                <p className="text-purple-100 mb-8 text-lg">
                                    Professional home health care services available throughout these communities and surrounding areas:
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    {serviceAreas.filter(a => !a.match(/^\d+$/)).slice(0, 12).map((area, i) => ( // Display top 12 cities
                                        <div key={i} className="flex items-center gap-3 group">
                                            <CheckCircle className="text-emerald-400 flex-shrink-0 group-hover:scale-125 transition-transform" size={20} />
                                            <span className="text-purple-50 font-medium group-hover:text-white transition-colors">
                                                {area}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                                    <p className="text-purple-100 text-sm">
                                        <strong className="text-white">Need Confirmation?</strong> If your area isn't listed, please contact us 24/7 at <a href="tel:6573770776" className="text-emerald-300 hover:text-emerald-200 transition-colors font-semibold">(657) 377-0776</a> to confirm availability.
                                    </p>
                                </div>
                            </div>

                            {/* Right: Interactive Map (Original structure preserved) */}
                            <div className="relative">
                                <div className="bg-white rounded-2xl p-4 shadow-2xl">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106428.47489186373!2d-118.00065764999999!3d33.7174708!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80dd27b61c4d60cf%3A0x999c4f2b8f49f20!2s2044%20Beach%20Blvd%20%23320%2C%20Huntington%20Beach%2C%20CA%2092648!5e0!3m2!1sen!2sus!4v1234567890" 
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
                                        <p className="text-gray-600 text-sm">2044 Beach Blvd, Suite 320, Huntington Beach, CA 92648</p>
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