import React, { useState, useEffect, useRef } from 'react'
import { Heart, Shield, Star, Users, ArrowRight } from 'lucide-react'

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

const values = [
    {
        iconSrc: '/assets/branding/icon_comfort.png',
        title: 'Compassion',
        description: 'We treat every patient like family, delivering care with empathy, warmth, and genuine concern for their well-being.',
        color: 'from-rose-50 to-white',
        textColor: 'text-rose-600',
    },
    {
        iconSrc: '/assets/branding/icon_oversight.png',
        title: 'Excellence',
        description: 'We uphold the highest standards of clinical quality, ensuring every service we provide meets rigorous professional benchmarks.',
        color: 'from-purple-50 to-white',
        textColor: 'text-purple-600',
    },
    {
        iconSrc: '/assets/branding/icon_integrity.png',
        title: 'Integrity',
        description: 'We operate with honesty and transparency in every interaction — with patients, families, and healthcare partners.',
        color: 'from-amber-50 to-white',
        textColor: 'text-amber-600',
    },
    {
        iconSrc: '/assets/branding/icon_community.png',
        title: 'Community',
        description: 'We are committed to strengthening the communities we serve by making quality home health care accessible to all.',
        color: 'from-teal-50 to-white',
        textColor: 'text-teal-600',
    },
]

const Leadership = () => {
    const [ref, isInView] = useInView()

    return (
        <section id="leadership" className="py-24 bg-gradient-to-br from-purple-50 via-white to-purple-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-rose-200 rounded-full filter blur-3xl opacity-15"></div>
            
            <div ref={ref} className="max-w-6xl mx-auto px-6 relative z-10">
                
                {/* Section Header */}
                <div className={`text-center mb-16 transition-all duration-[2000ms] ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
                        Who We Are
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Our Mission & Values
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Built on a foundation of compassion and clinical excellence, our mission guides everything we do.
                    </p>
                </div>

                {/* Mission Statement Card */}
                <div className={`mb-16 transition-all duration-[1500ms] ${isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-purple-200 transition-all duration-500">
                        <div className="grid md:grid-cols-5 gap-0">
                            {/* Image Side */}
                            <div className="md:col-span-2 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent z-10 group-hover:from-purple-600/30 transition-all"></div>
                                <img 
                                    src="/jeonalyn.jpg" 
                                    alt="Jeonalyn Ashby, Founder" 
                                    className={`w-full h-full object-cover min-h-[400px] transition-transform duration-700 group-hover:scale-105 ${isInView ? 'scale-100' : 'scale-110'}`}
                                    style={{ transitionDuration: '1500ms' }}
                                />
                            </div>

                            {/* Mission Content */}
                            <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center">
                                <div className={`transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`} style={{ transitionDelay: '300ms' }}>
                                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
                                        Our Mission
                                    </span>
                                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
                                        Caring Beyond Limits — One Patient, One Home at a Time
                                    </h3>
                                </div>

                                <p className={`text-gray-600 leading-relaxed mb-4 transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`} style={{ transitionDelay: '600ms' }}>
                                    At Olympia Home Health, our mission is to deliver exceptional, compassionate healthcare directly to our patients' homes. We believe every individual deserves access to high-quality care in the comfort and dignity of their own environment.
                                </p>

                                <p className={`text-gray-600 leading-relaxed mb-6 transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`} style={{ transitionDelay: '900ms' }}>
                                    Founded by Jeonalyn Ashby, Olympia was born from a deeply personal commitment to community health. Our team of dedicated professionals works closely with patients and their families to create personalized care plans that promote healing, independence, and peace of mind.
                                </p>

                                <div className={`transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: '1200ms' }}>
                                    <a 
                                        href="#contact" 
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-full hover:shadow-2xl transition-all hover:scale-105 font-semibold w-fit"
                                    >
                                        <ArrowRight size={18} />
                                        Get in Touch
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Core Values Grid */}
                <div className={`transition-all duration-[2000ms] ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: '400ms' }}>
                    <h3 className="text-2xl font-bold text-gray-900 text-center mb-10">
                        The Values That Drive Us
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, i) => {
                            return (
                                <div 
                                    key={i}
                                    className={`group relative bg-white rounded-[32px] p-8 shadow-2xl shadow-purple-900/5 border border-purple-50 hover:shadow-purple-900/10 hover:-translate-y-2 transition-all duration-500 cursor-default overflow-hidden`}
                                    style={{ transitionDelay: `${600 + i * 150}ms` }}
                                >
                                    {/* Accent Blur */}
                                    <div className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${value.color} rounded-full filter blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                                    
                                    <div className={`relative w-20 h-20 mb-8 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                        <div className="absolute inset-0 bg-purple-100 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity"></div>
                                        <img src={value.iconSrc} alt={value.title} className="relative w-full h-full object-contain" />
                                    </div>
                                    
                                    <h4 className="text-xl font-black text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
                                        {value.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                        {value.description}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Quote */}
                <div className={`mt-16 transition-all duration-[2000ms] delay-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100 hover:shadow-2xl transition-all">
                        <div className="text-5xl text-purple-300 mb-4">"</div>
                        <p className="text-xl text-gray-700 italic mb-4 leading-relaxed">
                            Our mission is simple: to provide compassionate, professional care that empowers our patients to live their best lives at home.
                        </p>
                        <p className="text-purple-700 font-semibold">— Jeonalyn Ashby, Founder</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Leadership