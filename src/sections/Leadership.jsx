import React, { useState, useEffect } from 'react'
import { Mail } from 'lucide-react'

// Intersection Observer hook
const useInView = () => {
  const [isInView, setIsInView] = useState(false)
  const ref = React.useRef(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
      }
    }, { threshold: 0.1 })
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])
  
  return [ref, isInView]
}

const Leadership = () => {
  const [ref, isInView] = useInView()

  return (
    <section id="leadership" className="py-24 bg-gradient-to-br from-purple-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      
      <div ref={ref} className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
            Our Leadership
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Meet Our President
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experienced leadership dedicated to excellence in home health care
          </p>
        </div>

        {/* Leadership Card */}
        <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-purple-200 transition-all duration-500 ${isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="grid md:grid-cols-5 gap-8">
            {/* Image Section */}
            <div className="md:col-span-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent z-10 group-hover:from-purple-600/30 transition-all"></div>
              <img 
                src="/jeonalyn.jpg" 
                alt="Jeonalyn Ashby" 
                className="w-full h-full object-cover min-h-[400px] group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Content Section */}
            <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center">
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-2 hover:text-purple-700 transition-colors">
                  Jeonalyn Ashby
                </h3>
                <span className="inline-block px-4 py-1 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 rounded-full text-sm font-semibold">
                  President & Founder
                </span>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">
                With a deep passion for healthcare and community service, Jeonalyn leads Olympia Home Health with unwavering dedication to excellence and compassionate care. Her vision has transformed the organization into a trusted provider of quality home health services.
              </p>

              <p className="text-gray-600 leading-relaxed mb-8">
                Under her leadership, Olympia Home Health has grown to become a beacon of hope and healing for countless families, combining clinical excellence with genuine human compassion.
              </p>

              {/* Key Highlights */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { title: 'Healthcare Excellence', subtitle: '10+ years experience' },
                  { title: 'Community Focus', subtitle: 'Patient-centered care' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 group cursor-pointer">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 group-hover:scale-150 transition-transform"></div>
                    <div>
                      <div className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Link */}
              <a 
                href="#contact" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-full hover:shadow-2xl transition-all hover:scale-105 font-semibold w-fit"
              >
                <Mail size={18} />
                Get in Touch
              </a>
            </div>
          </div>
        </div>

        {/* Team Quote */}
        <div className={`mt-16 transition-all duration-1000 delay-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100 hover:shadow-2xl transition-all">
            <div className="text-5xl text-purple-300 mb-4">"</div>
            <p className="text-xl text-gray-700 italic mb-4 leading-relaxed">
              Our mission is simple: to provide compassionate, professional care that empowers our patients to live their best lives at home.
            </p>
            <p className="text-purple-700 font-semibold">— Jeonalyn Ashby</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Leadership