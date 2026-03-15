import React, { useState, useEffect, useRef } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

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

const Testimonials = () => {
    const [ref, isInView] = useInView();
    const [activeIndex, setActiveIndex] = useState(0);

    const testimonials = [
        {
            text: "Olympia Home Health was a godsend after my mother's surgery. The nurses were not only incredibly professional but showed genuine compassion every single day. I couldn't have asked for a better team to support her recovery at home.",
            author: "Sarah M.",
            location: "Huntington Beach",
            rating: 5
        },
        {
            text: "The physical therapy team helped my husband regain his mobility faster than we ever thought possible. They were patient, encouraging, and highly skilled. We are forever grateful to Olympia.",
            author: "Robert T.",
            location: "Irvine",
            rating: 5
        },
        {
            text: "From the very first intake call to the daily visits, the entire staff has been exceptional. They handle all the complicated medical details so I can just focus on spending quality time with my father.",
            author: "Emily K.",
            location: "Costa Mesa",
            rating: 5
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % testimonials.length);
        }, 8000); // Auto-rotate every 8 seconds
        return () => clearInterval(interval);
    }, [testimonials.length]);

    const nextTestimonial = () => {
        setActiveIndex((current) => (current + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <section id="testimonials" className="py-24 bg-gradient-to-tr from-purple-900 via-purple-800 to-indigo-900 text-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>

            <div ref={ref} className="max-w-6xl mx-auto px-6 relative z-10">
                
                <div className={`text-center mb-16 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm text-purple-100 border border-white/20 rounded-full text-sm font-semibold mb-4">
                        Patient Stories
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Trusted by Families
                    </h2>
                    <p className="text-lg text-purple-200 max-w-2xl mx-auto">
                        Don't just take our word for it. Hear from those who have experienced our care firsthand.
                    </p>
                </div>

                {/* Carousel Container */}
                <div className={`max-w-4xl mx-auto relative transition-all duration-1000 delay-300 ${isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    
                    {/* Navigation Buttons */}
                    <button 
                        onClick={prevTestimonial}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all focus:outline-none"
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    
                    <button 
                        onClick={nextTestimonial}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all focus:outline-none"
                        aria-label="Next testimonial"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Testimonial Cards */}
                    <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-12 shadow-2xl">
                        <Quote className="absolute top-8 right-8 text-purple-400/20 w-24 h-24" />
                        
                        <div className="relative min-h-[220px] flex flex-col justify-center">
                            {testimonials.map((test, idx) => (
                                <div 
                                    key={idx}
                                    className={`transition-all duration-500 absolute w-full inset-0 flex flex-col justify-center ${
                                        idx === activeIndex 
                                            ? 'opacity-100 translate-x-0 pointer-events-auto' 
                                            : idx < activeIndex 
                                                ? 'opacity-0 -translate-x-20 pointer-events-none' 
                                                : 'opacity-0 translate-x-20 pointer-events-none'
                                    }`}
                                >
                                    <div className="flex gap-1 mb-6 text-yellow-400">
                                        {[...Array(test.rating)].map((_, i) => (
                                            <Star key={i} size={20} fill="currentColor" />
                                        ))}
                                    </div>
                                    
                                    <p className="text-xl md:text-2xl font-light leading-relaxed mb-8 text-purple-50 italic">
                                        "{test.text}"
                                    </p>
                                    
                                    <div>
                                        <p className="font-bold text-lg">{test.author}</p>
                                        <p className="text-purple-300">{test.location}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex justify-center gap-3 mt-8">
                        {testimonials.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    idx === activeIndex ? 'w-8 bg-purple-400' : 'w-2 bg-purple-400/30'
                                }`}
                                aria-label={`Go to testimonial ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Testimonials;
