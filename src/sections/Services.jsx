import React, { useState, useEffect, useRef } from 'react'
import { Heart, Users, Activity, ArrowRight } from 'lucide-react'

// --- REVISED Intersection Observer hook (Resets on scroll out) ---
const useInView = (threshold = 0.1) => {
    const [isInView, setIsInView] = useState(false)
    const ref = useRef(null)
    
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            // Key Change: We update the state based on the current intersection status.
            setIsInView(entry.isIntersecting)
            
        }, { threshold }) 
        
        if (ref.current) {
            observer.observe(ref.current)
        }
        
        // Cleanup: Stop observing when the component unmounts
        return () => {
            if (ref.current) {
                observer.unobserve(ref.current)
            }
        }
    }, [threshold])
    
    return [ref, isInView]
}

const Services = () => {
    const [ref, isInView] = useInView()
    
    const services = [
        { 
            title: 'Skilled Nursing', 
            iconSrc: '/assets/branding/icon_comfort.png',
            image: '/1.png',
            desc: 'Comprehensive nursing services provided under professional physician supervision.',
            features: [ 'Advanced Wound Care', 'IV Fluid Therapy', 'Clinical Monitoring', 'Medication Management' ],
            color: 'from-rose-500/20'
        },
        { 
            title: 'Physical Therapy', 
            iconSrc: '/assets/branding/icon_activity.png',
            image: '/3.png',
            desc: 'Specialized rehabilitation to support recovery, mobility, and functional independence.',
            features: ['Motor Function Restoration', 'Therapeutic Exercise', 'Gait Training', 'Strength Building'],
            color: 'from-blue-500/20'
        },
        { 
            title: 'Home Health Aide', 
            iconSrc: '/assets/branding/icon_community.png',
            image: '/2.png',
            desc: 'Personalized assistance with daily living activities under professional guidance.',
            features: ['Personal Hygiene Support', 'Daily Activity Aid', 'Ambulation Assistance', 'Safety Oversight'],
            color: 'from-teal-500/20'
        },
        { 
            title: 'Speech Therapy', 
            iconSrc: '/assets/branding/icon_activity.png',
            image: '/SpeechTherapy.png',
            desc: 'Assistance for speech and communication challenges following illness or injury.',
            features: ['Swallowing Evaluation', 'Cognitive Retraining', 'Voice Therapy', 'Communication Tech'],
            color: 'from-amber-500/20'
        },
        { 
            title: 'Occupational Therapy', 
            iconSrc: '/assets/branding/icon_activity.png',
            image: '/OccupationalTherapy.png',
            desc: 'Customized therapy to help master daily tasks and adapt to life changes.',
            features: ['ADL Retraining', 'Adaptive Equipment', 'Home Environment Safety', 'Upper Extremity Rehab'],
            color: 'from-purple-500/20'
        },
        { 
            title: 'Clinical Social Work', 
            iconSrc: '/assets/branding/icon_community.png',
            image: '/Social.png',
            desc: 'Holistic support for patients and families navigating complex healthcare journeys.',
            features: ['Community Resources', 'Emotional Counseling', 'Discharge Planning', 'Financial Coordination'],
            color: 'from-emerald-500/20'
        }
    ]

    return (
        <section id="services" className="py-24 bg-[#0a0a0a] relative overflow-hidden">
            {/* Immersive Background Decorations */}
            <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-indigo-600/5 rounded-full filter blur-[150px] animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full filter blur-[120px]"></div>
            
            <div ref={ref} className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className={`text-center mb-24 transition-all duration-[1500ms] ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="h-px w-8 bg-purple-500"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">Clinical Capabilities</span>
                        <span className="h-px w-8 bg-purple-500"></span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                        Our Multidisciplinary Care
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
                        Sophisticated home healthcare solutions powered by **Olympia's Clinical Oversight System**.
                    </p>
                </div>

                {/* Advanced Services Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((service, i) => (
                        <div 
                            key={i} 
                            className={`group relative bg-white/[0.02] backdrop-blur-3xl rounded-[32px] p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer overflow-hidden ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                            style={{ transitionDelay: `${i * 150}ms` }}
                        >
                            {/* Animated Accent */}
                            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${service.color} to-transparent rounded-full filter blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
                            
                            {/* Image & Icon Block */}
                            <div className="relative mb-10">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10"></div>
                                <div className="overflow-hidden rounded-2xl aspect-[16/10]">
                                    <img 
                                        src={service.image} 
                                        alt={service.title}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 saturate-[0.8] group-hover:saturate-100"
                                    />
                                </div>
                                
                                {/* Branded 3D Icon Badge */}
                                <div className="absolute bottom-0 left-6 translate-y-1/2 w-16 h-16 bg-[#0a0a0a] rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 z-20 group-hover:scale-110 group-hover:border-purple-500/50 transition-all duration-500">
                                    <img src={service.iconSrc} alt={service.title} className="w-10 h-10 object-contain" />
                                </div>
                            </div>

                            {/* Content */}
                            <h3 className="text-2xl font-black text-white mb-4 pt-4 group-hover:text-purple-400 transition-colors">
                                {service.title}
                            </h3>
                            <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed line-clamp-2">
                                {service.desc}
                            </p>

                            {/* Features Bento List */}
                            <div className="grid grid-cols-2 gap-2 mb-10">
                                {service.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] rounded-lg border border-white/5">
                                        <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Learn More: Minimalist */}
                            <a 
                                href="#contact" 
                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 group/link"
                            >
                                Initiate Care Path
                                <ArrowRight className="group-hover/link:translate-x-2 transition-transform" size={12} />
                            </a>
                        </div>
                    ))}
                </div>

                {/* Integrated CTA Pod */}
                <div className={`mt-24 transition-all duration-[1500ms] delay-600 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="bg-gradient-to-r from-purple-600/10 via-indigo-600/10 to-transparent backdrop-blur-3xl rounded-[40px] p-12 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="max-w-xl">
                            <h4 className="text-2xl md:text-3xl font-black text-white mb-4">Request a Clinical Evaluation</h4>
                            <p className="text-gray-400 font-medium">Our senior coordination team is available to review patient eligibility and insurance coverage immediately.</p>
                        </div>
                        <a 
                            href="#contact" 
                            className="px-10 py-5 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                        >
                            Schedule Assessment
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Services