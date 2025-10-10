import React from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'

const Hero = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Modern Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="Olympia Logo" className="w-12 h-12 object-contain rounded-full" />
              <span className={`font-bold text-xl transition-colors ${scrolled ? 'text-purple-700' : 'text-purple-700'}`}>
                Olympia Home Health
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-gray-700 hover:text-purple-700 transition-colors font-medium">About</a>
              <a href="#services" className="text-gray-700 hover:text-purple-700 transition-colors font-medium">Services</a>
              <a href="#leadership" className="text-gray-700 hover:text-purple-700 transition-colors font-medium">Leadership</a>
              <a href="#contact" className="bg-purple-700 text-white px-6 py-2.5 rounded-full hover:bg-purple-800 transition-all hover:shadow-lg">
                Contact Us
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-purple-700"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3">
              <a href="#about" className="block text-gray-700 hover:text-purple-700 transition-colors font-medium py-2">About</a>
              <a href="#services" className="block text-gray-700 hover:text-purple-700 transition-colors font-medium py-2">Services</a>
              <a href="#leadership" className="block text-gray-700 hover:text-purple-700 transition-colors font-medium py-2">Leadership</a>
              <a href="#contact" className="block bg-purple-700 text-white px-6 py-2.5 rounded-full text-center hover:bg-purple-800 transition-all">
                Contact Us
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-50 via-white to-purple-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 text-center">
          <div className="mb-8 inline-block">
            <img 
              src="/logo.jpg" 
              alt="Olympia Logo" 
              className="w-28 h-28 object-contain rounded-full shadow-xl mx-auto ring-4 ring-purple-100" 
            />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
              Olympia Home Health Inc.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto font-light">
            Compassionate Care. Professional Service. Trusted Support.
          </p>
          
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Delivering exceptional home health care with dedication, expertise, and a personal touch
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="#contact" 
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-purple-700 rounded-full overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-purple-900 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </a>
            
            <a 
              href="#services" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-purple-700 bg-white border-2 border-purple-700 rounded-full transition-all duration-300 hover:bg-purple-50 hover:shadow-xl hover:scale-105"
            >
              Our Services
            </a>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="text-purple-700" size={32} />
          </div>
        </div>
      </header>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  )
}

export default Hero