import React, { useState, useEffect, useRef } from 'react'
import { Mail, Phone, MapPin, Loader2, CheckCircle } from 'lucide-react'
import CalendlyEmbed from '../widgets/CalendlyEmbed' 

// --- Resettable Intersection Observer hook (Assuming this is a local utility now) ---
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

// Uses Formspree. Replace YOUR_FORMSPREE_ID with your form endpoint id
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORMSPREE_ID';

export default function Contact(){
    const [status, setStatus] = useState(null) // null, 'sending', 'sent', 'error'
    const [ref, isInView] = useInView(0.2) // Increased threshold for a smoother trigger

    const handleSubmit = async (e)=>{
        e.preventDefault()
        const form = e.target
        const data = new FormData(form)
        setStatus('sending')
        
        try{
            const res = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            })
            if(res.ok){
                setStatus('sent')
                form.reset()
            } else {
                setStatus('error')
            }
        } catch{
            setStatus('error')
        }
    }

    const isSending = status === 'sending';
    const isSent = status === 'sent';
    const isError = status === 'error';

    // Tailwind Class for Inputs
    const inputClasses = "mt-1 w-full rounded-lg p-3 text-gray-800 bg-white/90 border border-purple-300 focus:ring-2 focus:ring-purple-200 transition duration-300 placeholder-gray-500"

    return (
        <section id="contact" className="py-24 bg-gradient-to-br from-purple-700 to-purple-900 text-white relative overflow-hidden">
            {/* Decorative background circle */}
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600 rounded-full filter blur-3xl opacity-20"></div>

            <div ref={ref} className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 relative z-10">
                
                {/* Contact Form Section (Animated) */}
                <div 
                    className={`transition-all duration-[1500ms] ease-out ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`} 
                    style={{ transitionDelay: '300ms' }}
                >
                    <span className="inline-block px-4 py-1 bg-purple-500/50 text-purple-100 rounded-full text-sm font-semibold mb-4">
                        Contact Us
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h2>
                    <p className="mt-3 text-purple-200 leading-relaxed">
                        Have questions or need to discuss specific care requirements? Send us a message, and our compassionate team will respond promptly.
                    </p>

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-purple-100">Full name</label>
                            <input 
                                id="name"
                                required 
                                name="name" 
                                placeholder="John Doe"
                                className={inputClasses} 
                                disabled={isSending}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-purple-100">Email</label>
                            <input 
                                id="email"
                                required 
                                type="email" 
                                name="email" 
                                placeholder="you@example.com"
                                className={inputClasses} 
                                disabled={isSending}
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-purple-100">Phone (Optional)</label>
                            <input 
                                id="phone"
                                type="tel" 
                                name="phone" 
                                placeholder="(555) 123-4567"
                                className={inputClasses} 
                                disabled={isSending}
                            />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-purple-100">Message</label>
                            <textarea 
                                id="message"
                                required 
                                name="message" 
                                rows="4" 
                                placeholder="I need assistance with..."
                                className={inputClasses} 
                                disabled={isSending}
                            />
                        </div>

                        <div>
                            <button 
                                type="submit" 
                                disabled={isSending || isSent}
                                className={`
                                    inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold transition-all duration-300 transform 
                                    ${isSent 
                                        ? 'bg-green-500 text-white cursor-not-allowed'
                                        : isSending
                                        ? 'bg-purple-300 text-purple-900 cursor-wait'
                                        : 'bg-white text-purple-800 hover:bg-purple-100 hover:scale-[1.02]'
                                    }
                                `}
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Sending...
                                    </>
                                ) : isSent ? (
                                    <>
                                        <CheckCircle size={20} />
                                        Message Sent!
                                    </>
                                ) : (
                                    <>
                                        <Mail size={20} />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </div>

                        {isError && <p className="text-yellow-300 mt-4 flex items-center gap-2">⚠️ There was a problem. Please try again or call us.</p>}
                    </form>

                </div>

                {/* Calendly & Info Section (Animated) */}
                <div 
                    className={`transition-all duration-[1500ms] ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                    style={{ transitionDelay: '600ms' }}
                >
                    <h3 className="text-3xl font-semibold mb-2">Book Your Free Consultation</h3>
                    <p className="mt-2 text-purple-200">
                        Use our calendar to instantly select a convenient date and time for an initial assessment or consultation.
                    </p>
                    
                    {/* Reverted to original Calendly wrapper div */}
                    <div className="mt-4">
                        <CalendlyEmbed />
                    </div>

                    {/* Contact Details */}
                    <div className="mt-8 space-y-3 text-purple-100 text-base">
                        <div className="flex items-center gap-3">
                            <MapPin size={20} className="text-purple-300"/>
                            <p>Office: 123 Care Lane, Hometown</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone size={20} className="text-purple-300"/>
                            <p>Phone: <a href="tel:5555555555" className="hover:text-white transition">(555) 555-5555</a></p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail size={20} className="text-purple-300"/>
                            <p>Email: <a href="mailto:info@olympia.example" className="hover:text-white transition">info@olympia.example</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}