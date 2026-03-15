import React, { useState, useEffect, useRef } from 'react'
import { Mail, Phone, MapPin, Loader2, CheckCircle, User, Stethoscope, UploadCloud } from 'lucide-react'
import CalendlyEmbed from '../widgets/CalendlyEmbed' 

// --- Resettable Intersection Observer hook ---
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

// Uses Formspree. Replace YOUR_FORMSPREE_ID with your form endpoint id.
// NOTE ON FILE UPLOADS: If using Formspree, ensure your account plan supports file uploads
// and that your form is configured to accept them.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xbdzaokz';

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
                // Do not set 'Content-Type': 'multipart/form-data' here; FormData does it.
            })
            if(res.ok){
                setStatus('sent')
                form.reset()
            } else {
                setStatus('error')
            }
        } catch(error){
            console.error("Form submission error:", error);
            setStatus('error')
        }
    }

    const isSending = status === 'sending';
    const isSent = status === 'sent';
    const isError = status === 'error';

    // Tailwind Class for Inputs
    const inputClasses = "mt-1 w-full rounded-lg p-3 text-gray-800 bg-white/90 border border-purple-300 focus:ring-2 focus:ring-purple-200 transition duration-300 placeholder-gray-500"
    // Tailwind Class for File Input
    const fileInputClasses = "mt-1 w-full rounded-lg p-3 text-gray-800 bg-white/90 border border-purple-300 focus:ring-2 focus:ring-purple-200 transition duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"


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
                        Begin Care Coordination
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">Start Your Admission</h2>
                    
                    {/* COPY TO REFLECT FILE UPLOAD REQUIREMENT */}
                    <p className="mt-3 text-purple-200 leading-relaxed border-l-4 border-emerald-400 pl-4 py-2 italic">
                        As a certified Home Health Agency, we require a **Physician's Referral** to initiate services. Please complete the form and **upload the required document** below. Our intake coordinator will then confirm details with the referring physician.
                    </p>

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                        
                        {/* 1. PATIENT AND PRIMARY CONTACT INFORMATION */}
                        <div className="p-5 rounded-xl bg-purple-800/40 border border-purple-600 space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <User size={20} className='text-emerald-300'/> Patient/Family Contact Details
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {/* Patient Name */}
                                <div>
                                    <label htmlFor="patient_name" className="block text-sm font-medium text-purple-100">Patient's Full Name*</label>
                                    <input 
                                        id="patient_name"
                                        required 
                                        name="Patient_Name" 
                                        placeholder="Jane Doe"
                                        className={inputClasses} 
                                        disabled={isSending}
                                    />
                                </div>
                                {/* Contact Name (Optional) */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-purple-100">Contact Person Name (Your Name)</label>
                                    <input 
                                        id="name"
                                        name="Contact_Name" 
                                        placeholder="John Doe"
                                        className={inputClasses} 
                                        disabled={isSending}
                                    />
                                </div>
                            </div>
                            
                            <div className="grid sm:grid-cols-2 gap-4">
                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-purple-100">Email*</label>
                                    <input 
                                        id="email"
                                        required 
                                        type="email" 
                                        name="Email" 
                                        placeholder="you@example.com"
                                        className={inputClasses} 
                                        disabled={isSending}
                                    />
                                </div>
                                {/* Phone */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-purple-100">Contact Phone*</label>
                                    <input 
                                        id="phone"
                                        required
                                        type="tel" 
                                        name="Phone" 
                                        placeholder="(555) 123-4567"
                                        className={inputClasses} 
                                        disabled={isSending}
                                    />
                                </div>
                            </div>
                        </div>


                        {/* 2. REFERRING PHYSICIAN INFORMATION (UPDATED WITH NPI) */}
                        <div className="p-5 rounded-xl bg-purple-800/40 border border-purple-600 space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Stethoscope size={20} className='text-emerald-300'/> Referring Physician's Information
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {/* Physician Name */}
                                <div>
                                    <label htmlFor="dr_name" className="block text-sm font-medium text-purple-100">Physician's Full Name*</label>
                                    <input 
                                        id="dr_name"
                                        required 
                                        name="Physician_Name" 
                                        placeholder="Dr. Smith"
                                        className={inputClasses} 
                                        disabled={isSending}
                                    />
                                </div>
                                {/* Physician Phone */}
                                <div>
                                    <label htmlFor="dr_phone" className="block text-sm font-medium text-purple-100">Physician's Phone Number*</label>
                                    <input 
                                        id="dr_phone"
                                        required 
                                        type="tel" 
                                        name="Physician_Phone" 
                                        placeholder="(555) 987-6543"
                                        className={inputClasses} 
                                        disabled={isSending}
                                    />
                                </div>
                            </div>
                            
                            {/* NPI Number (NEW FIELD) */}
                            <div>
                                <label htmlFor="npi_number" className="block text-sm font-medium text-purple-100">NPI Number*</label>
                                <input 
                                    id="npi_number"
                                    required 
                                    type="text" 
                                    name="NPI_Number" 
                                    placeholder="10-digit NPI (e.g., 1234567890)"
                                    className={inputClasses} 
                                    maxLength={10}
                                    pattern="\d{10}"
                                    title="NPI must be 10 digits"
                                    disabled={isSending}
                                />
                            </div>

                        </div>

                        {/* 3. FILE UPLOAD SECTION */}
                        <div className="p-5 rounded-xl bg-emerald-700/40 border border-emerald-500 space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <UploadCloud size={20} className='text-white'/> Upload Referral Document
                            </h3>
                            <div>
                                <label htmlFor="referral_file" className="block text-sm font-medium text-white mb-2">
                                    Physician's Referral (Required)*
                                </label>
                                <input 
                                    id="referral_file"
                                    required 
                                    type="file" 
                                    name="Referral_Document" 
                                    accept=".pdf,.doc,.docx,.jpg,.png"
                                    className={fileInputClasses} 
                                    disabled={isSending}
                                />
                                <p className="text-xs text-white/70 mt-2">Accepted formats: PDF, DOC, DOCX, JPG, PNG. File size limit may apply depending on your form service.</p>
                            </div>
                            <div className="text-center p-2 bg-emerald-800/50 rounded-lg">
                                <p className="text-sm font-semibold text-white">
                                    Your information is kept confidential and secure.
                                </p>
                            </div>
                        </div>
                        
                        {/* 4. MESSAGE / CARE NEEDS */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-purple-100">Describe Care Needs / Message*</label>
                            <textarea 
                                id="message"
                                required 
                                name="Message" 
                                rows="4" 
                                placeholder="E.g., Patient requires post-surgery wound care and physical therapy."
                                className={inputClasses} 
                                disabled={isSending}
                            />
                        </div>

                        {/* SUBMIT BUTTON */}
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
                                        Sending Referral...
                                    </>
                                ) : isSent ? (
                                    <>
                                        <CheckCircle size={20} />
                                        Referral Received!
                                    </>
                                ) : (
                                    <>
                                        <Mail size={20} />
                                        Submit Care Request
                                    </>
                                )}
                            </button>
                        </div>

                        {isError && <p className="text-yellow-300 mt-4 flex items-center gap-2">⚠️ There was a problem submitting your request. Please try again or call us immediately at (657) 377-0776.</p>}
                    </form>

                </div>
                
                {/* Right Column: Contact Info / Scheduling */}
                <div 
                    className={`transition-all duration-[1500ms] ease-out ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`} 
                    style={{ transitionDelay: '500ms' }}
                >
                    <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-sm shadow-xl h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-3xl font-bold mb-6">Need Immediate Assistance?</h3>
                            <p className="text-purple-100 mb-8">
                                For urgent matters or to speak directly with an intake specialist, please use the contact details below. Our team is available 24/7 for emergency scheduling.
                            </p>
                            
                            <div className="space-y-6">
                                {/* Phone Number */}
                                <div className="flex items-start gap-4">
                                    <Phone size={24} className="flex-shrink-0 mt-1 text-emerald-300" />
                                    <div>
                                        <p className="text-lg font-semibold">24/7 Phone Line</p>
                                        <a href="tel:6573770776" className="text-xl font-bold text-white hover:text-emerald-300 transition-colors">(657) 377-0776</a>
                                    </div>
                                </div>
                                {/* Email */}
                                <div className="flex items-start gap-4">
                                    <Mail size={24} className="flex-shrink-0 mt-1 text-emerald-300" />
                                    <div>
                                        <p className="text-lg font-semibold">General Inquiries</p>
                                        <a href="mailto:olympiahomehealthinc@gmail.com" className="text-white hover:text-emerald-300 transition-colors">olympiahomehealthinc@gmail.com</a>
                                    </div>
                                </div>
                                {/* Address */}
                                <div className="flex items-start gap-4">
                                    <MapPin size={24} className="flex-shrink-0 mt-1 text-emerald-300" />
                                    <div>
                                        <p className="text-lg font-semibold">Office Location</p>
                                        <p className="text-white">2044 Beach Blvd, Suite 320, Huntington Beach, CA 92648</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Calendly CTA (if enabled) */}
                        <div className="mt-10 pt-6 border-t border-purple-600">
                            <h4 className="text-xl font-bold mb-4">Book a Discovery Call</h4>
                            <p className="text-purple-200 mb-4">You can also use our convenient online scheduler to book a quick call with our intake team.</p>
                            <CalendlyEmbed />
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}