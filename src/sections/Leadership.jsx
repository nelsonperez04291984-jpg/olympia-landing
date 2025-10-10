import React from 'react'
import { Linkedin, Mail } from 'lucide-react'

const Leadership = () => {
  return (
    <section id="leadership" className="py-24 bg-gradient-to-br from-purple-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-20"></div>
      
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
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
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Image Section */}
            <div className="md:col-span-2 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent"></div>
              <img 
                src="/jeonalyn.jpg" 
                alt="Jeonalyn Ashby" 
                className="w-full h-full object-cover min-h-[400px]"
              />
            </div>

            {/* Content Section */}
            <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center">
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Jeonalyn Ashby
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    President & Founder
                  </span>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">
                With a deep passion for healthcare and community service, Jeonalyn leads Olympia Home Health with unwavering dedication to excellence and compassionate care. Her vision has transformed the organization into a trusted provider of quality home health services.
              </p>

              <p className="text-gray-600 leading-relaxed mb-8">
                Under her leadership, Olympia Home Health has grown to become a beacon of hope and healing for countless families, combining clinical excellence with genuine human compassion.
              </p>

              {/* Key Highlights */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Healthcare Excellence</div>
                    <div className="text-sm text-gray-600">10+ years experience</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Community Focus</div>
                    <div className="text-sm text-gray-600">Patient-centered care</div>
                  </div>
                </div>
              </div>

              {/* Contact Links */}
              <div className="flex gap-4">
                <a 
                  href="#contact" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-full hover:bg-purple-800 transition-all hover:shadow-lg font-semibold"
                >
                  <Mail size={18} />
                  Get in Touch
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Optional: Team Quote or Mission */}
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
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