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
        <section id="services" className="py-12 bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
            
            <div ref={ref} className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className={`text-center mb-10 transition-all duration-[1500ms] ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <span className="h-px w-8 bg-purple-500"></span>
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-600">What We Offer</span>
                        <span className="h-px w-8 bg-purple-500"></span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-3 tracking-tighter">
                        Our Services
                    </h2>
                    <p className="text-sm text-gray-600 max-w-2xl mx-auto font-medium">
                        Comprehensive home health care solutions tailored to you.
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((service, i) => (
                        <div 
                            key={i} 
                            className={`group relative bg-white rounded-[24px] p-5 shadow-2xl shadow-purple-900/5 border border-purple-50 hover:shadow-purple-900/10 hover:-translate-y-2 transition-all duration-700 cursor-pointer overflow-hidden ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                            style={{ transitionDelay: `${i * 150}ms` }}
                        >
                            {/* Animated Accent */}
                            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${service.color} to-transparent rounded-full filter blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
                            
                            {/* Image Block */}
                            <div className="relative mb-8 overflow-hidden rounded-3xl aspect-[16/10]">
                                <img 
                                    src={service.image} 
                                    alt={service.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                
                                {/* Branded 3D Icon Badge */}
                                <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-purple-100 z-20 group-hover:scale-110 transition-transform">
                                    <img src={service.iconSrc} alt={service.title} className="w-10 h-10 object-contain" />
                                </div>
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                                {service.title}
                            </h3>
                            <p className="text-gray-600 text-[12px] font-medium mb-5 leading-relaxed">
                                {service.desc}
                            </p>

                            {/* Features Bento List */}
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                {service.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-2 py-1 bg-purple-50/50 rounded-xl border border-purple-100/50">
                                        <div className="w-1 h-1 bg-purple-600 rounded-full"></div>
                                        <span className="text-[7.5px] font-bold text-gray-700 uppercase tracking-wider">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Learn More: Minimalist */}
                            <a 
                                href="#contact" 
                                className="inline-flex items-center gap-2 text-[8.5px] font-black uppercase tracking-[0.2em] text-purple-700 group/link"
                            >
                                Initiate Care Path
                                <ArrowRight className="group-hover/link:translate-x-2 transition-transform" size={12} />
                            </a>
                        </div>
                    ))}
                </div>

                {/* Integrated CTA Pod */}
                <div className={`mt-10 transition-all duration-[1500ms] delay-600 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="bg-white rounded-[24px] shadow-2xl shadow-purple-900/10 p-6 md:p-10 border border-purple-50 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="max-w-xl text-center md:text-left">
                            <h4 className="text-lg md:text-xl font-black text-gray-900 mb-1">Need personalized care solutions?</h4>
                            <p className="text-gray-600 text-xs font-medium">Schedule a clinical consultation to discuss your family's needs.</p>
                        </div>
                        <a 
                            href="#contact" 
                            className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-full font-black text-[9px] uppercase tracking-widest hover:shadow-2xl hover:scale-105 transition-all text-center"
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