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
            desc: 'Comprehensive nursing services provided under physician supervision.',
            features: [ 'Treatment and injections',
                'Dressing change',
                'Catheter care',
                'Supervision of medications',
                'Diabetic teaching',
                'Drawing blood and lab work',
                'IV Fluids and antibiotics therapy',
                'Wound care',
                'Ostomy care',
                'Parenteral nutrition',
                'Pre-op and post-op care',
                'Family/patient health teaching']
        },
        { 
            title: 'Home Health Aide', 
            iconSrc: '/assets/branding/icon_community.png',
            image: '/2.png',
            desc: 'Assistance with personal care, hygiene, ambulation, and exercises under professional supervision.',
            features: ['Personal care assistance',
                'Hygiene support',
                'Ambulation assistance',
                'Exercise guidance',
                'Daily living activities']
        },
        { 
            title: 'Physical Therapy', 
            iconSrc: '/assets/branding/icon_activity.png',
            image: '/3.png',
            desc: 'Physical, occupational and speech therapy to support recovery and mobility.',
            features: ['Adaptive equipment utilization',
                'Rehabilitation aid',
                'Loss of function restoration',
                'Range of motion improvement',
                'Strength building',
                'Therapeutic exercise']
        },
        { 
            title: 'Speech Therapy', 
            iconSrc: '/assets/branding/icon_activity.png',
            image: '/SpeechTherapy.png',
            desc: 'Assist patients with speech challenges following illness or accident.',
            features: ['Adaptive equipment utilization',
                'Speech assessment',
                'Communication strategies',
                'Post-illness recovery',
                'Swallowing therapy']
        },
        { 
            title: 'Occupational Therapy', 
            iconSrc: '/assets/branding/icon_activity.png',
            image: '/OccupationalTherapy.png',
            desc: 'Assist patients with speech challenges following illness or accident.',
            features: ['Adaptive equipment utilization',
                'Speech assessment',
                'Communication strategies',
                'Post-illness recovery',
                'Swallowing therapy']
        },
        { 
            title: 'Social Services', 
            iconSrc: '/assets/branding/icon_community.png',
            image: '/Social.png',
            desc: 'Support for patients and families coping with illness or disability.',
            features: ['Emotional support',
                'Financial resource location',
                'Community assistance coordination',
                'Home meal delivery',
                'Support group connections']
        },
        { 
            title: 'Nutritional Guidance', 
            iconSrc: '/assets/branding/icon_comfort.png',
            image: '/Nutrition.png',
            desc: 'Help patients understand and follow special diets prescribed by physicians.',
            features: ['Diet education',
                'Meal planning support',
                'Nutritional counseling',
                'Special diet guidance']
        }

    ]

    return (
        <section id="services" className="py-24 bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
            
            <div ref={ref} className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Section Header - SLOW MOTION EFFECT */}
                {/* Changed duration-1000 to duration-[2000ms] */}
                <div className={`text-center mb-16 transition-all duration-[2000ms] ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
                        What We Offer
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Our Services
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Comprehensive home health care solutions tailored to your unique needs
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((service, i) => (
                        <div 
                            key={i} 
                            // SLOW MOTION EFFECT (on the individual cards)
                            // Changed duration-500 to duration-[1500ms] 
                            className={`group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-[1500ms] hover:-translate-y-3 border border-gray-100 cursor-pointer ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                            // The style tag maintains the staggered delay
                            style={{ transitionDelay: `${i * 300}ms` }}
                        >
                            
                            {/* Image Block */}
                            <div className="relative mb-6 overflow-hidden rounded-xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <img 
                                    src={service.image} 
                                    alt={service.title}
                                    className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                
                                {/* Icon badge */}
                                <div className="absolute -bottom-6 left-4 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl border border-purple-100 z-20 group-hover:scale-110 transition-transform">
                                    <img src={service.iconSrc} alt={service.title} className="w-10 h-10 object-contain" />
                                </div>
                            </div>

                            {/* Content */}
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 pt-4 group-hover:text-purple-700 transition-colors">
                                {service.title}
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                {service.desc}
                            </p>

                            {/* Features List */}
                            <ul className="space-y-2 mb-6">
                                {service.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-3 group-hover:scale-150 transition-transform"></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {/* Learn More Link */}
                            <a 
                                href="#contact" 
                                className="inline-flex items-center text-purple-700 font-semibold group/link"
                            >
                                Learn More
                                <ArrowRight className="ml-2 group-hover/link:translate-x-2 transition-transform" size={18} />
                            </a>

                            {/* Decorative gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                        </div>
                    ))}
                </div>

                {/* CTA Section - SLOW MOTION EFFECT */}
                {/* Changed duration-1000 to duration-[2000ms] */}
                <div className={`mt-16 text-center transition-all duration-[2000ms] delay-600 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <p className="text-gray-600 mb-6">Need personalized care solutions?</p>
                    <a 
                        href="#contact" 
                        className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-800 rounded-full hover:shadow-2xl transition-all hover:scale-105"
                    >
                        Schedule a Consultation
                    </a>
                </div>
            </div>
        </section>
    )
}

export default Services