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
        <section id="leadership" className="py-24 bg-[#020617] relative overflow-hidden">
            {/* Cinematic Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none"></div>
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-600/5 rounded-full filter blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full filter blur-[150px]"></div>
            
            <div ref={ref} className="max-w-7xl mx-auto px-6 relative z-10">
                
                {/* Section Header */}
                <div className={`text-center mb-24 transition-all duration-[1500ms] ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="h-px w-8 bg-purple-500/50"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">Institutional Foundation</span>
                        <span className="h-px w-8 bg-purple-500/50"></span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                        Mission & Clinical Values
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
                        Guided by a century of combined clinical expertise and a personal commitment to high-fidelity home care.
                    </p>
                </div>

                {/* Mission Statement: High-Fidelity Glass Card */}
                <div className={`mb-24 transition-all duration-[1500ms] ${isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden border border-white/10 group/mission">
                        <div className="grid lg:grid-cols-5 gap-0">
                            {/* Image Side: Cinematic Overlay */}
                            <div className="lg:col-span-2 relative overflow-hidden h-[400px] lg:h-auto">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-transparent to-transparent z-10"></div>
                                <div className="absolute inset-0 bg-purple-600/10 mix-blend-overlay z-10"></div>
                                <img 
                                    src="/jeonalyn.jpg" 
                                    alt="Jeonalyn Ashby, Founder" 
                                    className={`w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105`}
                                />
                            </div>

                            {/* Mission Content */}
                            <div className="lg:col-span-3 p-8 lg:p-20 flex flex-col justify-center">
                                <div className={`transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`} style={{ transitionDelay: '300ms' }}>
                                    <span className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                                        Executive Vision
                                    </span>
                                    <h3 className="text-3xl md:text-5xl font-black text-white mb-8 leading-[1.1] tracking-tighter">
                                        Caring Beyond Limits — One Patient, One Home.
                                    </h3>
                                </div>

                                <p className={`text-gray-400 text-lg font-medium leading-relaxed mb-8 transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`} style={{ transitionDelay: '600ms' }}>
                                    Olympia was born from a personal commitment to professionalize community health. We believe every individual deserves access to <span className="text-white">high-fidelity clinical care</span> in the dignity of their own environment.
                                </p>

                                <div className={`transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: '900ms' }}>
                                    <a 
                                        href="#contact" 
                                        className="inline-flex items-center gap-4 px-10 py-5 bg-white text-black rounded-full hover:scale-105 transition-all font-black text-xs uppercase tracking-widest shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                                    >
                                        Initiate Consultation
                                        <ArrowRight size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Core Values: Advanced Interactive Grid */}
                <div className={`transition-all duration-[2000ms] ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`} style={{ transitionDelay: '400ms' }}>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, i) => {
                            return (
                                <div 
                                    key={i}
                                    className={`group relative bg-white/[0.02] backdrop-blur-2xl rounded-[36px] p-8 border border-white/5 hover:border-purple-500/40 hover:bg-white/[0.05] transition-all duration-700 cursor-default overflow-hidden`}
                                    style={{ transitionDelay: `${600 + i * 150}ms` }}
                                >
                                    {/* Advanced Hover Glow */}
                                    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-600/10 rounded-full filter blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                    
                                    <div className="relative mb-10 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                                        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="w-16 h-16 bg-[#020617] rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden shadow-inner">
                                            <img src={value.iconSrc} alt={value.title} className="w-10 h-10 object-contain" />
                                        </div>
                                    </div>
                                    
                                    <h4 className="text-xl font-black text-white mb-3 group-hover:text-purple-400 transition-colors">
                                        {value.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed group-hover:text-gray-400 transition-colors">
                                        {value.description}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Professional Endorsement */}
                <div className={`mt-24 transition-all duration-[2000ms] delay-500 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="bg-gradient-to-br from-white/[0.03] to-transparent rounded-[40px] p-12 lg:p-16 border border-white/5 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 text-[200px] text-white/5 font-black leading-none pointer-events-none">"</div>
                        <p className="text-2xl lg:text-3xl text-gray-300 font-medium italic mb-8 leading-relaxed relative z-10">
                            Our mission is simple: to provide <span className="text-white italic">compassionate, professional care</span> that empowers our patients to live their best lives at home.
                        </p>
                        <div className="flex items-center gap-4">
                            <span className="w-12 h-px bg-purple-500"></span>
                            <p className="text-purple-400 font-black uppercase tracking-widest text-xs">Jeonalyn Ashby, BSN — Founder & CEO</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Leadership