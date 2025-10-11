import React, { useState, useEffect, useRef } from 'react'
import { Shield, Heart, Users, Award, ChevronDown } from 'lucide-react'

// --- 1. REVISED Intersection Observer hook (Resets on scroll out) ---
const useInView = (threshold = 0.1) => {
    const [isInView, setIsInView] = useState(false)
    const ref = useRef(null)
    
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            // Key Change: We update the state based on the current intersection status.
            // When isIntersecting is true, isInView is true (animation starts).
            // When isIntersecting is false, isInView is false (animation resets).
            setIsInView(entry.isIntersecting)
            
        }, { threshold }) // Use the threshold passed in (default 0.1)
        
        if (ref.current) {
            observer.observe(ref.current)
        }
        
        // Cleanup: Stop observing when the component unmounts
        return () => {
            if (ref.current) {
                observer.unobserve(ref.current)
            }
        }
    }, [threshold])
    
    return [ref, isInView]
}

// --- 2. Custom Hook for Number Animation (Remains the same, but now resets) ---
const useAnimateNumber = (targetValue, duration = 1000, trigger) => {
    const [count, setCount] = useState(0)
    const timerRef = useRef(null) // Use a ref to hold the interval ID

    useEffect(() => {
        // Clear any running timer when the trigger changes or component unmounts
        if (timerRef.current) {
            clearInterval(timerRef.current)
            setCount(0) // Reset count when trigger becomes false
        }
        
        if (!trigger) {
            setCount(0) // Explicitly reset count when scrolling out
            return
        }
        
        const start = 0
        const end = parseFloat(targetValue.replace('+', '').replace('%', ''))
        const increment = (end - start) / (duration / 16) // ~60fps

        let current = start
        timerRef.current = setInterval(() => {
            current += increment
            if (current >= end) {
                clearInterval(timerRef.current)
                setCount(end)
            } else {
                setCount(current)
            }
        }, 16)

        return () => clearInterval(timerRef.current)
    }, [targetValue, duration, trigger]) // Trigger change will now cause reset and restart

    // Format the number back with '+' or '%'
    const formattedCount = Math.floor(count).toLocaleString()
    if (targetValue.includes('+')) return `${formattedCount}+`
    if (targetValue.includes('%')) return `${formattedCount}%`
    return formattedCount
}


const About = () => {
    // Note: If you want the animation to reset only when 0% of the element is visible, 
    // you could call useInView(0) here, otherwise use the default (0.1).
    const [ref, isInView] = useInView() 
    const [activeValue, setActiveValue] = useState(null) 

    const values = [
        {
            id: 'compassion', 
            icon: Heart,
            title: 'Compassionate',
            image: '/compassionate.png',
            description: 'We treat every patient with dignity, respect, and genuine care.',
            detail: 'Our caregivers are trained to connect on a human level, providing emotional support alongside medical assistance. This is the foundation of the Olympia difference.'
        },
        {
            id: 'professional',
            icon: Shield,
            title: 'Professional',
            image: '/professional.png',
            description: 'Highly trained staff delivering evidence-based care.',
            detail: 'Our team includes certified nurses, therapists, and aides who stay current with the latest medical protocols, ensuring you receive the highest standard of evidence-based care right at home.'
        },
        {
            id: 'person-centered',
            icon: Users,
            title: 'Person-Centered',
            image: '/person.png',
            description: 'Tailored care plans that honor individual needs and preferences.',
            detail: 'We collaborate with patients and families to create care plans that fit their unique lifestyle, cultural needs, and recovery goals. Your preference is our priority.'
        },
        {
            id: 'excellence',
            icon: Award,
            title: 'Excellence',
            image: '/excellence.png',
            description: 'Committed to the highest standards of quality and service.',
            detail: 'Excellence is not a goal; it\'s our standard. We continually measure and improve our services, ensuring a smooth, reliable, and high-quality home health experience every single day.'
        }
    ]
    
    const stats = [
        { value: '10+', label: 'Years Experience' },
        { value: '500+', label: 'Patients Served' },
        { value: '98%', label: 'Satisfaction Rate' }
    ]

    return (
        <section id="about" className="py-24 bg-white relative overflow-hidden">
            {/* Background Elements (Good as-is) */}
            <div className="absolute top-20 left-0 w-96 h-96 bg-emerald-100 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-20 right-0 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-20"></div>
            
            <div ref={ref} className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-2 gap-16 items-start"> 
                    
                    {/* Left Content */}
                    {/* When isInView becomes FALSE, it instantly reverts to the hidden state (opacity-0, -translate-x-12) */}
                    <div className={`transition-all duration-1000 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
                        <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
                            About Us
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            Dedicated to Your <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Well-Being</span>
                        </h2>
                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            Olympia Home Health Inc. is dedicated to delivering exceptional home health care services that enhance the quality of life for our patients and their families.
                        </p>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Our team of experienced professionals brings compassion, expertise, and personalized attention to every interaction. We believe that quality care goes beyond medical treatment—it's about building relationships, fostering independence, and supporting overall wellness.
                        </p>

                        {/* Animated Stats */}
                        <div className="grid grid-cols-3 gap-6 mb-8">
                            {stats.map((stat, i) => (
                                <StatCard 
                                    key={i} 
                                    stat={stat} 
                                    isInView={isInView} // This prop changing to false will reset the count animation
                                />
                            ))}
                        </div>

                        <a 
                            href="#contact" 
                            className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-800 rounded-full hover:shadow-xl transition-all hover:scale-105"
                        >
                            Partner With Us
                        </a>
                    </div>

                    {/* Right Content - Values Grid (Now Interactive) */}
                    {/* Resets similarly to the left content */}
                    <div className={`space-y-6 transition-all duration-1000 delay-300 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
                        {values.map((value, i) => (
                            <InteractiveValueCard
                                key={i}
                                value={value}
                                isActive={activeValue === value.id}
                                onClick={() => setActiveValue(activeValue === value.id ? null : value.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

// --- Component for Animated Stat (Unchanged) ---
const StatCard = ({ stat, isInView }) => {
    const animatedValue = useAnimateNumber(stat.value, 1500, isInView) 

    return (
        <div className="text-center group cursor-pointer p-2 rounded-lg hover:bg-purple-50 transition-colors">
            <div className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-1 group-hover:scale-105 transition-transform">
                {animatedValue}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
        </div>
    )
}

// --- Component for Interactive Value Card (Unchanged) ---
const InteractiveValueCard = ({ value, isActive, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className={`
                bg-white rounded-2xl p-6 shadow-md transition-all duration-500 border-2
                ${isActive 
                    ? 'shadow-2xl border-purple-400 bg-purple-50/70' 
                    : 'hover:shadow-lg border-gray-100 hover:-translate-y-1 hover:border-purple-200'
                } 
                cursor-pointer
            `}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="w-10 h-10 mr-4 flex-shrink-0">
                        <img 
                            src={value.image} 
                            alt={value.title} 
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div>
                        <h3 className={`text-xl font-bold text-gray-900 ${isActive ? 'text-purple-700' : ''}`}>{value.title}</h3>
                        <p className="text-sm text-gray-500">{value.description}</p>
                    </div>
                </div>
                <ChevronDown 
                    className={`w-6 h-6 text-purple-600 transition-transform duration-300 ${isActive ? 'rotate-180' : 'rotate-0'}`}
                />
            </div>

            <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out`}
                style={{ maxHeight: isActive ? '500px' : '0' }} 
            >
                <div className="pt-4 mt-4 border-t border-purple-200">
                    <p className="text-base text-gray-700 leading-relaxed font-medium">
                        {value.detail}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default About