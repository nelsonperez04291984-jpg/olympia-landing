import React, { useState, useEffect } from 'react'
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react'

const Hero = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Modern Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-2xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                {/* FIX: removed rounded-full and ring classes from img; the logo is already circular */}
                <img src="/log_latest.png" alt="Olympia Logo" className="relative w-12 h-12 object-contain" />
              </div>
              <span className={`font-bold text-xl transition-all duration-300 ${scrolled ? 'text-purple-700' : 'text-white drop-shadow-lg'}`}>
                Olympia Home Health
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {['About', 'Services', 'Leadership'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className={`relative font-medium transition-colors group ${scrolled ? 'text-gray-700' : 'text-white'}`}
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
              <a href="#contact" className="relative px-6 py-2.5 rounded-full font-semibold text-white overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-800 transition-transform group-hover:scale-105"></div>
                <span className="relative z-10">Contact Us</span>
              </a>
              <a
                href="/provider-login"
                target="_blank"
                rel="noopener noreferrer"
                className="relative px-6 py-2.5 rounded-full font-semibold text-blue-900 bg-blue-100 hover:bg-white hover:shadow-lg transition-all border border-blue-200"
              >
                Provider Portal
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-purple-700' : 'text-white'}`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3 animate-fadeIn">
              {['About', 'Services', 'Leadership'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block text-gray-700 hover:text-purple-700 transition-colors font-medium py-2 hover:pl-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <a
                href="#contact"
                className="block bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-2.5 rounded-full text-center hover:shadow-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </a>
              <a
                href="/provider-login"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full mt-2 bg-blue-100 text-blue-900 border border-blue-200 px-6 py-2.5 rounded-full text-center hover:bg-blue-200 transition-all font-semibold"
              >
                Provider Portal
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Sophisticated Glass Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-700 ${scrolled ? 'bg-[#020617]/80 backdrop-blur-2xl border-b border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-700"></div>
                <img src="/log_latest.png" alt="Olympia Logo" className="relative w-12 h-12 object-contain transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" />
              </div>
              <div className="flex flex-col">
                <span className={`font-black text-xl tracking-tighter transition-all duration-500 ${scrolled ? 'text-white' : 'text-white'}`}>
                  OLYMPIA
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-purple-400 opacity-80">Home Health Inc</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-10">
              {['About', 'Services', 'Leadership'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="relative text-[11px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors group"
                >
                  {item}
                  <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-emerald-500 group-hover:w-full transition-all duration-500"></span>
                </a>
              ))}
              
              <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                <a href="#contact" className="relative px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest text-white overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-800 to-indigo-950 transition-transform group-hover:scale-110"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    Direct Intake <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>
                <a
                  href="/provider-login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest text-indigo-200 border border-indigo-500/30 hover:bg-indigo-500/10 hover:text-white hover:border-indigo-400 transition-all backdrop-blur-md"
                >
                  Provider Portal
                </a>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 rounded-2xl bg-white/5 border border-white/10 text-white"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section: Cinematic Entrance */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617]">
        {/* Dynamic Mesh & Particles */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 mesh-background opacity-40 mix-blend-color-dodge"></div>
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${10 + Math.random() * 20}s`
              }}
            />
          ))}
        </div>

        {/* Cinematic Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-purple-600/20 rounded-full filter blur-[150px] animate-blob"></div>
          <div className="absolute top-1/2 -right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full filter blur-[120px] animate-blob animation-delay-2000"></div>
        </div>

        {/* Hero Content: Aggressive Parallax */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center" style={{ transform: `translateY(${scrollY * 0.4}px)`, opacity: 1 - (scrollY / 800) }}>
          <div className="mb-12 inline-block animate-fadeInUp">
            <div className="relative group cursor-none">
              <div className="absolute inset-0 bg-purple-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
              <img
                src="/log_latest.png"
                alt="Olympia Logo"
                className="relative w-40 h-40 object-contain shadow-2xl mx-auto transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700"
              />
            </div>
          </div>

          <div className="space-y-6 mb-12">
            <h1 className="text-6xl md:text-9xl font-black text-white leading-tight tracking-tighter animate-fadeInUp animation-delay-200">
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                OLYMPIA
              </span>
            </h1>
            <div className="flex items-center justify-center gap-4 animate-fadeInUp animation-delay-400">
              <span className="h-px w-12 bg-purple-500/50"></span>
              <p className="text-xs md:text-sm font-black text-purple-400 uppercase tracking-[0.6em]">
                Advanced Home Health Care
              </p>
              <span className="h-px w-12 bg-purple-500/50"></span>
            </div>
          </div>

          <p className="text-xl md:text-2xl text-gray-400 mb-16 max-w-3xl mx-auto font-medium leading-relaxed animate-fadeInUp animation-delay-600">
            Precision medicine and compassionate nursing coordinated through our <br className="hidden md:block" /> 
            <span className="text-white">proprietary clinical ecosystem.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fadeInUp animation-delay-800">
            <a
              href="#contact"
              className="group relative inline-flex items-center justify-center px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-white bg-white/5 rounded-full overflow-hidden border border-white/20 transition-all duration-500 hover:bg-white hover:text-black hover:scale-105"
            >
              <span className="relative z-10">Get Started</span>
              <ArrowRight className="relative z-10 ml-3 group-hover:translate-x-1 transition-transform" size={16} />
            </a>

            <a
              href="#services"
              className="px-12 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all duration-500"
            >
              Explore Services
            </a>
          </div>

          {/* ACHC Accreditation: Floating Badge */}
          <div className="mt-20 flex flex-col items-center animate-fadeInUp animation-delay-1000 opacity-80">
            <div className="achc-seal-container achc-seal-shadow-dark w-20 h-20 md:w-24 md:h-24 hover:scale-110 transition-transform cursor-pointer grayscale group-hover:grayscale-0">
              <img src="/ACHC.png" alt="ACHC Accredited" />
            </div>
          </div>
        </div>

        {/* Cinematic Bottom Gradient */}
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#020617] to-transparent z-20"></div>

        {/* Scroll Indicator: Minimalist */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-30 opacity-50">
          <div className="w-px h-16 bg-gradient-to-b from-purple-500 to-transparent animate-bounce"></div>
        </div>
      </header>
    </>
  )
}

export default Hero