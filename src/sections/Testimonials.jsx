import React, { useState, useEffect, useRef } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight, X, Loader2, CheckCircle, MessageSquarePlus } from 'lucide-react';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formStatus, setFormStatus] = useState(null); // 'sending', 'sent', 'error'

    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xbdzaokz';

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = new FormData(form);
        data.append("Source", "Website Testimonial Submission");
        
        setFormStatus('sending');

        try {
            const res = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            });
            if (res.ok) {
                setFormStatus('sent');
                setTimeout(() => {
                    setIsModalOpen(false);
                    setFormStatus(null);
                }, 3000); // Close modal automatically after 3 seconds on success
            } else {
                setFormStatus('error');
            }
        } catch (error) {
            console.error("Testimonial submission error:", error);
            setFormStatus('error');
        }
    };

    const testimonials = [];

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
        <section id="testimonials" className="py-12 bg-gradient-to-tr from-purple-900 via-purple-800 to-indigo-900 text-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-20 -left-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>

            <div ref={ref} className="max-w-6xl mx-auto px-6 relative z-10">
                
                <div className={`text-center mb-10 transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <span className="h-px w-8 bg-purple-400/50"></span>
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-purple-100">Patient Stories</span>
                        <span className="h-px w-8 bg-purple-400/50"></span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black mb-3 tracking-tighter">
                        Trusted by Families
                    </h2>
                    <p className="text-sm text-purple-200 max-w-2xl mx-auto font-medium">
                        Hear from those who have experienced our care firsthand.
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
                    <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-10 shadow-2xl">
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
                                    
                                    <p className="text-lg md:text-xl font-light leading-relaxed mb-6 text-purple-50 italic">
                                        "{test.text}"
                                    </p>
                                    
                                    <div>
                                        <p className="font-bold text-base">{test.author}</p>
                                        <p className="text-purple-300 text-xs">{test.location}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex justify-center gap-3 mt-6">
                        {testimonials.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === activeIndex ? 'w-6 bg-purple-400' : 'w-1.5 bg-purple-400/30'
                                }`}
                                aria-label={`Go to testimonial ${idx + 1}`}
                            />
                        ))}
                    </div>

                    {/* Add Review Button */}
                    <div className="flex justify-center mt-8">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="group flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 rounded-full font-black text-[9px] uppercase tracking-widest transition-all hover:scale-105 shadow-lg"
                        >
                            <MessageSquarePlus className="text-purple-300 group-hover:text-white transition-colors" size={14} />
                            <span>Share Your Experience</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Testimonial Submission Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 text-gray-800">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp">
                        
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                <Star className="text-yellow-400 fill-yellow-400 w-6 h-6" />
                                Leave a Review
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 md:p-8">
                            {formStatus === 'sent' ? (
                                <div className="text-center py-8 animate-fadeIn">
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Thank you!</h4>
                                    <p className="text-gray-600">Your experience has been sent to our team.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleReviewSubmit} className="space-y-5">
                                    <p className="text-gray-600 text-sm mb-6">
                                        We value your feedback. Please share your experience with Olympia Home Health. (Your review will be sent to our team for approval before appearing on the site).
                                    </p>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name/Initials*</label>
                                            <input required type="text" name="Reviewer_Name" className="w-full rounded-lg p-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition outline-none" placeholder="e.g. John D." />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">City*</label>
                                            <input required type="text" name="Reviewer_City" className="w-full rounded-lg p-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition outline-none" placeholder="e.g. Irvine" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Star Rating</label>
                                        <select name="Star_Rating" className="w-full rounded-lg p-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none">
                                            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                                            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                                            <option value="3">⭐⭐⭐ (3 Stars)</option>
                                            <option value="2">⭐⭐ (2 Stars)</option>
                                            <option value="1">⭐ (1 Star)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Your Story*</label>
                                        <textarea required name="Review_Text" rows="4" className="w-full rounded-lg p-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition outline-none resize-none" placeholder="Tell us about the care you or your loved one received..."></textarea>
                                    </div>

                                    {formStatus === 'error' && (
                                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                                            There was an error sending your review. Please try again.
                                        </div>
                                    )}

                                    <button 
                                        type="submit"
                                        disabled={formStatus === 'sending'}
                                        className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
                                    >
                                        {formStatus === 'sending' ? (
                                            <><Loader2 className="animate-spin" size={20}/> Sending...</>
                                        ) : (
                                            'Submit Experience'
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Testimonials;
