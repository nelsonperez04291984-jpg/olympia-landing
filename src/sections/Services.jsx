import React from 'react'
import { Heart, Users, Activity, ArrowRight } from 'lucide-react'

const services = [
  { 
    title: 'Skilled Nursing', 
    icon: Heart,
    desc: 'Licensed nursing services including wound care, medication management, and clinical assessments.',
    features: ['Wound Care', 'Medication Management', 'Clinical Assessments']
  },
  { 
    title: 'Personal Care Assistance', 
    icon: Users,
    desc: 'Assistance with daily living activities to maintain comfort, dignity and independence.',
    features: ['Daily Living Support', 'Personal Hygiene', 'Mobility Assistance']
  },
  { 
    title: 'Therapy Services', 
    icon: Activity,
    desc: 'Physical, occupational and speech therapy to support recovery and mobility.',
    features: ['Physical Therapy', 'Occupational Therapy', 'Speech Therapy']
  }
]

const Services = () => {
  return (
    <section id="services" className="py-24 bg-gradient-to-br from-white via-purple-50/30 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-20"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
            What We Offer
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive home health care solutions tailored to your unique needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const IconComponent = service.icon
            return (
              <div 
                key={i} 
                className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
              >
                {/* Icon */}
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="text-white" size={32} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-20 h-20 bg-purple-100 rounded-2xl -z-10 group-hover:scale-110 transition-transform duration-300"></div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.desc}
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Learn More Link */}
                <a 
                  href="#contact" 
                  className="inline-flex items-center text-purple-700 font-semibold group-hover:gap-3 transition-all"
                >
                  Learn More
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                </a>

                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">Need personalized care solutions?</p>
          <a 
            href="#contact" 
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-purple-700 rounded-full hover:bg-purple-800 transition-all hover:shadow-xl hover:scale-105"
          >
            Schedule a Consultation
          </a>
        </div>
      </div>
    </section>
  )
}

export default Services