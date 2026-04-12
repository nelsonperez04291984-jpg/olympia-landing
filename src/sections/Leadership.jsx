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
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-rose-200 rounded-full filter blur-[120px] opacity-20"></div>
            
            <div ref={ref} className="max-w-7xl mx-auto px-6 relative z-10">
                
                {/* Section Header */}
                <div className={`text-center mb-24 transition-all duration-[1500ms] ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="h-px w-8 bg-purple-500"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-600">Who We Are</span>
                        <span className="h-px w-8 bg-purple-500"></span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tighter">
                        Mission & Values
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
                        Built on a foundation of compassion and clinical excellence, our mission guides everything we do.
                    </p>
                </div>

                {/* Mission Statement: Premium White Card */}
                <div className={`mb-24 transition-all duration-[1500ms] ${isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <div className="bg-white rounded-[48px] shadow-2xl shadow-purple-900/10 overflow-hidden border border-purple-50 group/mission">
                        <div className="grid lg:grid-cols-5 gap-0">
                            {/* Image Side */}
                            <div className="lg:col-span-2 relative overflow-hidden h-[400px] lg:h-auto">
                                <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent z-10"></div>
                                <img 
                                    src="/jeonalyn.jpg" 
                                    alt="Jeonalyn Ashby, Founder" 
                                    className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105`}
                                />
                            </div>

                            {/* Mission Content */}
                            <div className="lg:col-span-3 p-8 lg:p-20 flex flex-col justify-center">
                                <div className={`transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`} style={{ transitionDelay: '300ms' }}>
                                    <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                                        Our Mission
                                    </span>
                                    <h3 className="text-3xl md:text-5xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tighter">
                                        Caring Beyond Limits — One Patient, One Home.
                                    </h3>
                                </div>

                                <p className={`text-gray-600 text-lg font-medium leading-relaxed mb-8 transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`} style={{ transitionDelay: '600ms' }}>
                                    At Olympia Home Health, our mission is to deliver exceptional, compassionate healthcare directly to our patients' homes. We believe everyone deserves <span className="text-purple-700 font-black">high-quality care</span> in the dignity of their own environment.
                                </p>

                                <div className={`transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: '900ms' }}>
                                    <a 
                                        href="#contact" 
                                        className="inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-full hover:shadow-2xl hover:scale-105 transition-all font-black text-xs uppercase tracking-widest"
                                    >
                                        Initiate Consultation
                                        <ArrowRight size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Core Values: Interactive Grid */}
                <div className={`transition-all duration-[2000ms] ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: '400ms' }}>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, i) => {
                            return (
                                <div 
                                    key={i}
                                    className={`group relative bg-white rounded-[40px] p-8 shadow-2xl shadow-purple-900/5 border border-purple-50 hover:shadow-purple-900/10 hover:-translate-y-2 transition-all duration-700 cursor-default overflow-hidden`}
                                    style={{ transitionDelay: `${600 + i * 150}ms` }}
                                >
                                    {/* Accent Blur */}
                                    <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${value.color} to-transparent rounded-full filter blur-2xl opacity-10 group-hover:opacity-30 transition-opacity`}></div>
                                    
                                    <div className="relative mb-8 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                                        <div className="absolute inset-0 bg-purple-100 rounded-3xl blur-2xl opacity-0 group-hover:opacity-40 transition-opacity"></div>
                                        <div className="w-16 h-16 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-center relative shadow-inner">
                                            <img src={value.iconSrc} alt={value.title} className="w-10 h-10 object-contain" />
                                        </div>
                                    </div>
                                    
                                    <h4 className="text-xl font-black text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
                                        {value.title}
                                    </h4>
                                    <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
                                        {value.description}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Professional Quote Pod */}
                <div className={`mt-24 transition-all duration-[2000ms] delay-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="bg-white rounded-[40px] p-12 lg:p-16 shadow-2xl shadow-purple-900/5 border border-purple-50 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 text-[200px] text-purple-50 font-black leading-none pointer-events-none">"</div>
                        <p className="text-2xl lg:text-3xl text-gray-700 font-medium italic mb-8 leading-relaxed relative z-10">
                            Our mission is simple: to provide <span className="text-purple-700 italic font-black">compassionate, professional care</span> that empowers our patients to live their best lives at home.
                        </p>
                        <div className="flex items-center gap-4">
                            <span className="w-12 h-px bg-purple-500"></span>
                            <p className="text-purple-600 font-black uppercase tracking-widest text-xs">Jeonalyn Ashby, BSN — Founder & CEO</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Leadership