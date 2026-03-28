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

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-900">
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 text-center" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
          <div className="mb-8 inline-block animate-fadeInUp">
            <div className="relative group">
              <div className="absolute inset-0 bg-white rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              {/* FIX: removed rounded-full and ring classes from img; the logo is already circular */}
              <img
                src="/log_latest.png"
                alt="Olympia Logo"
                className="relative w-32 h-32 object-contain shadow-2xl mx-auto group-hover:scale-110 transition-all"
              />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight animate-fadeInUp animation-delay-200">
            <span className="inline-block hover:scale-105 transition-transform">
              Olympia Home Health Inc.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-purple-100 mb-4 max-w-3xl mx-auto font-light animate-fadeInUp animation-delay-400">
            Compassionate Care. Professional Service. Trusted Support.
          </p>

          <p className="text-lg text-purple-200 mb-12 max-w-2xl mx-auto animate-fadeInUp animation-delay-600">
            Delivering exceptional home health care with dedication, expertise, and a personal touch
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeInUp animation-delay-800">
            <a
              href="#contact"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-purple-900 bg-white rounded-full overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-white/50 hover:scale-105"
            >
              <span className="relative z-10">Get Started</span>
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </a>

            <a
              href="#services"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-full transition-all duration-300 hover:bg-white/20 hover:border-white/50 hover:scale-105"
            >
              Our Services
            </a>
          </div>

          {/* ACHC Accreditation Badge */}
          <div className="mt-12 flex flex-col items-center animate-fadeInUp animation-delay-1000">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl group-hover:bg-yellow-400/30 transition-all"></div>
              <div className="achc-seal-container achc-seal-shadow w-24 h-24 md:w-32 md:h-32 transition-transform group-hover:scale-110">
                <img
                  src="/ACHC.png"
                  alt="ACHC Accredited"
                />
              </div>
            </div>
            <p className="mt-4 text-yellow-100 font-semibold tracking-wide uppercase text-sm md:text-base">
              Accredited by the Accreditation Commission for Health Care
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mt-2 opacity-50"></div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="text-white" size={32} />
          </div>
        </div>
      </header>
    </>
  )
}

export default Hero