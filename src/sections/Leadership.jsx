import React, { useState, useEffect, useRef } from 'react'
import { Heart, Shield, Star, Users, ArrowRight, MapPin } from 'lucide-react'

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

                {/* Mission Statement: The Executive Vision Card */}
                <div className={`mb-24 transition-all duration-[1500ms] ${isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    <div className="bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(88,28,135,0.15)] overflow-hidden border border-purple-50 group/mission flex flex-col lg:flex-row">
                        
                        {/* Left Side: The Executive ID Badge */}
                        <div className="lg:w-[42%] relative bg-white flex flex-col border-b lg:border-b-0 lg:border-r border-gray-100">
                            {/* The Purple Branding Arc */}
                            <div className="absolute top-0 left-0 w-full h-[240px] bg-gradient-to-br from-purple-500 to-purple-700 rounded-b-[120px] shadow-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="flex flex-col items-center justify-center h-full pt-4">
                                    <img src="/logo.png" alt="Olympia Logo" className="w-24 h-24 object-contain brightness-0 invert" />
                                    <div className="mt-2 text-center">
                                        <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em]">Olympia</p>
                                        <p className="text-[8px] font-bold text-white/60 uppercase tracking-[0.2em]">Home Health Inc</p>
                                    </div>
                                </div>
                            </div>

                            {/* Portrait Frame */}
                            <div className="relative z-10 flex flex-col items-center mt-32 px-10 pb-10">
                                <div className="relative group/portrait">
                                    {/* Gold Glowing Border */}
                                    <div className="absolute -inset-1.5 bg-gradient-to-t from-[#B8860B] via-[#FFD700] to-[#B8860B] rounded-[32px] blur-sm opacity-50 group-hover/portrait:opacity-100 transition-opacity duration-700"></div>
                                    <div className="relative w-full aspect-[4/5] max-w-[280px] bg-white rounded-[28px] overflow-hidden border-[6px] border-[#D4AF37] shadow-2xl">
                                        <img 
                                            src="/jeonalyn.jpg" 
                                            alt="Jeonalyn Ashby, CEO" 
                                            className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover/portrait:scale-110" 
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 text-center">
                                    <h4 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Jeonalyn Ashby</h4>
                                    <div className="flex items-center justify-center gap-3 mt-1">
                                        <div className="h-px w-6 bg-gray-300"></div>
                                        <p className="text-sm font-black text-purple-600 uppercase tracking-[0.4em]">CEO</p>
                                        <div className="h-px w-6 bg-gray-300"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Gold Metallic Footer */}
                            <div className="mt-auto bg-gradient-to-r from-[#B8860B] via-[#FFD700] to-[#8B4513] p-6 flex flex-col items-center justify-center shadow-inner">
                                <div className="flex items-center gap-3 text-[#3E2723]">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                                        <MapPin size={18} className="fill-[#3E2723]/30" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[11px] font-black uppercase tracking-tight leading-none">20422 Beach Blvd, Suite 320</p>
                                        <p className="text-[10px] font-bold tracking-tight">Huntington Beach, CA 92648</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: The Vision Content */}
                        <div className="lg:w-[58%] p-8 lg:p-20 flex flex-col justify-center relative overflow-hidden">
                            {/* Decorative Grid Texture */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clothe.png')] opacity-[0.03] pointer-events-none"></div>
                            
                            <div className={`relative z-10 transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`} style={{ transitionDelay: '300ms' }}>
                                <span className="inline-block px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-purple-100">
                                    Our Mission
                                </span>
                                <h3 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-[1] tracking-tighter">
                                    Caring Beyond Limits — One Patient, One Home.
                                </h3>
                            </div>

                            <p className={`relative z-10 text-gray-600 text-lg md:text-xl font-medium leading-relaxed mb-10 transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`} style={{ transitionDelay: '600ms' }}>
                                At Olympia Home Health, our mission is to deliver exceptional, compassionate healthcare directly to our patients' homes. We believe everyone deserves <span className="text-purple-700 font-extrabold underline decoration-purple-200 underline-offset-4">high-quality care</span> in the dignity of their own environment.
                            </p>

                            <div className={`relative z-10 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: '900ms' }}>
                                <a 
                                    href="#contact" 
                                    className="group/btn inline-flex items-center gap-4 px-12 py-5 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-full hover:shadow-2xl hover:scale-105 transition-all font-black text-xs uppercase tracking-[0.2em]"
                                >
                                    Initiate Consultation
                                    <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                                </a>
                            </div>

                            {/* Background Clinical Grid (Subtle) */}
                            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-100 rounded-full filter blur-[100px] opacity-20 pointer-events-none"></div>
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