import React from 'react'
import { Shield, Heart, Users, Award } from 'lucide-react'

const values = [
  {
    icon: Heart,
    title: 'Compassionate',
    description: 'We treat every patient with dignity, respect, and genuine care'
  },
  {
    icon: Shield,
    title: 'Professional',
    description: 'Highly trained staff delivering evidence-based care'
  },
  {
    icon: Users,
    title: 'Person-Centered',
    description: 'Tailored care plans that honor individual needs and preferences'
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'Committed to the highest standards of quality and service'
  }
]

const About = () => {
  return (
    <section id="about" className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-0 w-72 h-72 bg-emerald-100 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-20"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
              About Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Dedicated to Your <span className="text-purple-700">Well-Being</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Olympia Home Health Inc. is dedicated to delivering exceptional home health care services that enhance the quality of life for our patients and their families.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Our team of experienced professionals brings compassion, expertise, and personalized attention to every interaction. We believe that quality care goes beyond medical treatment—it's about building relationships, fostering independence, and supporting overall wellness.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-700 mb-1">10+</div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-700 mb-1">500+</div>
                <div className="text-sm text-gray-600">Patients Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-700 mb-1">98%</div>
                <div className="text-sm text-gray-600">Satisfaction Rate</div>
              </div>
            </div>

            <a 
              href="#contact" 
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-purple-700 rounded-full hover:bg-purple-800 transition-all hover:shadow-lg"
            >
              Partner With Us
            </a>
          </div>

          {/* Right Content - Values Grid */}
          <div className="grid grid-cols-2 gap-6">
            {values.map((value, i) => {
              const IconComponent = value.icon
              return (
                <div 
                  key={i}
                  className="bg-gradient-to-br from-white to-purple-50/50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  <div className="w-12 h-12 bg-purple-700 rounded-xl flex items-center justify-center mb-4 shadow-md">
                    <IconComponent className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default About