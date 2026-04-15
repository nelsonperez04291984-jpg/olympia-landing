import React, { useState, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'

const Hero = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      setScrollY(window.scrollY)
    }

    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      })
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <>
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <div className="flex items-center gap-3">
              {/* <img src="/log_latest.png" alt="Olympia Logo" className="w-12 h-12 object-contain" /> */}
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

              <a
                href="#contact"
                className="px-6 py-2.5 rounded-full font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-800 transition-all hover:shadow-lg hover:scale-105"
              >
                Contact Us
              </a>

              <a
                href="/provider-login"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-full font-semibold text-blue-900 bg-blue-100 hover:bg-white hover:shadow-lg transition-all border border-blue-200"
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

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-900">

        {/* Cursor Flashlight Effect */}
        <div
          className="pointer-events-none absolute inset-0 z-10 transition duration-300"
          style={{
            background: `radial-gradient(
              600px circle at ${mousePosition.x}px ${mousePosition.y}px,
              rgba(168,85,247,0.25),
              transparent 40%
            )`
          }}
        />

        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-20 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        {/* Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Hero Content */}
        <div
          className="relative z-20 max-w-5xl mx-auto px-6 py-12 text-center"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        >
          {/* Logo Container - Refined & Centered */}
          <div className="relative group inline-flex justify-center mb-6">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-[40px] group-hover:bg-white/40 transition-all duration-1000 animate-pulse"></div>
            <div className="relative w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 animate-float">
              <img 
                src="/log_latest.png" 
                alt="Olympia Logo" 
                className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.2)] transform transition-all duration-700 group-hover:scale-105" 
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="mb-10">
            <h1 className="text-3XL md:text-5xl lg:text-5xl font-black text-white mb-3 tracking-tight drop-shadow-[0_0_40px_rgba(255,255,255,0.25)]">
              Olympia Home Health
            </h1>

            <p className="text-base md:text-lg text-purple-100 mb-2 font-bold tracking-tight">
              Compassionate Care. <span className="text-white">Trusted Support.</span>
            </p>

            <p className="text-sm md:text-base text-purple-200 mx-auto max-w-2xl font-medium leading-relaxed opacity-90">
              RN-led medical and rehabilitative care serving families across Huntington Beach and all of Southern California.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-12">
            <a
              href="#contact"
              className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-black text-purple-900 bg-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              Request Consultation
              <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-20 blur-xl transition duration-500"></span>
            </a>

            <a
              href="#services"
              className="inline-flex items-center justify-center px-10 py-4 text-base font-bold text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-full transition-all duration-300 hover:bg-white/20 hover:scale-105"
            >
              View Our Services
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-[10px] md:text-xs text-purple-200 font-bold mb-12 border-t border-white/10 pt-8">
            <div className="flex items-center gap-2"><div className="w-1 h-1 bg-white rounded-full"></div> RN-Led Clinical Care</div>
            <div className="flex items-center gap-2"><div className="w-1 h-1 bg-white rounded-full"></div> ACHC Accredited</div>
            <div className="flex items-center gap-2"><div className="w-1 h-1 bg-white rounded-full"></div> Serving Southern California</div>
            <div className="flex items-center gap-2"><div className="w-1 h-1 bg-white rounded-full"></div> Elite In-Home Support</div>
          </div>

          {/* ACHC ACCREDITATION FEATURED BLOCK */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/5 backdrop-blur-3xl rounded-[32px] px-6 py-6 border border-white/10 shadow-3xl relative overflow-hidden group/achc hover:bg-white/10 transition-all duration-700">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full filter blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover/achc:bg-yellow-400/20 transition-all duration-1000"></div>

              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
                  <div className="achc-seal-container achc-seal-shadow w-20 h-20 transform transition-all duration-700 group-hover/achc:rotate-6 group-hover/achc:scale-110">
                    <img src="/ACHC.png" alt="ACHC Accredited" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-yellow-400/20 border border-yellow-400/30 rounded-full mb-3">
                    <div className="w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                    <span className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.2em]">Gold Standard of Care</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight">Accredited Excellence</h3>
                  <p className="text-purple-100 text-[13px] leading-relaxed mb-0.5 font-medium opacity-80">
                    Setting the elite standard for clinical home health in California.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="text-white opacity-50" size={32} />
          </div>

        </div>
      </header>
    </>
  )
}

export default Hero
