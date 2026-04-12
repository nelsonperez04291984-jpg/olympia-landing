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
    const [entryMode, setEntryMode] = useState('family') // 'family' or 'professional'
    const [uploadedDocs, setUploadedDocs] = useState([])
    const [isUploading, setIsUploading] = useState(false)
    const [ref, isInView] = useInView(0.2)

    const handleSubmit = async (e)=>{
        e.preventDefault()
        const form = e.target
        const formData = new FormData(form)
        const data = Object.fromEntries(formData.entries())
        
        setStatus('sending')
        
        try {
            const payload = {
                patient_name: data.Patient_Name,
                email: data.Email,
                patient_phone: data.Phone,
                contact_name: data.Contact_Name,
                physician_name: data.Physician_Name,
                physician_phone: data.Physician_Phone,
                npi_number: data.NPI_Number,
                message: data.Message,
                document_urls: uploadedDocs,
                source: entryMode === 'professional' ? 'Public Portal (Pro)' : 'Public Lead'
            }

            const res = await fetch('/api/public/referrals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                setStatus('sent')
                form.reset()
                setUploadedDocs([])
            } else {
                setStatus('error')
            }
        } catch (error) {
            console.error("Form submission error:", error);
            setStatus('error')
        }
    }

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return
        
        setIsUploading(true)
        const formDataUpload = new FormData()
        files.forEach(file => formDataUpload.append('files', file))
        
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formDataUpload
            })
            if (res.ok) {
                const data = await res.json()
                setUploadedDocs(prev => [...prev, ...data.files.map(f => f.url)])
            }
        } catch (err) {
            console.error("Upload failed", err)
        } finally {
            setIsUploading(false)
        }
    }

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
                    <div className="flex items-center gap-4 mb-6">
                        <button 
                            onClick={() => setEntryMode('family')}
                            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${entryMode === 'family' ? 'bg-white text-purple-800 shadow-lg' : 'bg-purple-600/30 text-purple-200 hover:bg-purple-500/40'}`}
                        >
                            Patient/Family
                        </button>
                        <button 
                            onClick={() => setEntryMode('professional')}
                            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${entryMode === 'professional' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-purple-600/30 text-purple-200 hover:bg-purple-500/40'}`}
                        >
                            Healthcare Professional
                        </button>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        {entryMode === 'family' ? 'Get Started' : 'Professional Referral'}
                    </h2>
                    
                    <p className={`mt-3 leading-relaxed border-l-4 pl-4 py-2 italic transition-colors ${entryMode === 'family' ? 'text-purple-200 border-purple-400' : 'text-emerald-100 border-emerald-400'}`}>
                        {entryMode === 'family' 
                            ? "Request info for yourself or a loved one. Our intake specialist will reach out within 24 hours." 
                            : "Physicians and Discharge Planners: Submit clinical data securely for immediate coordination."}
                    </p>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {/* Shared Contact Info */}
                        <div className={`p-6 rounded-[24px] border transition-all ${entryMode === 'family' ? 'bg-purple-800/40 border-purple-600' : 'bg-white/5 border-white/10 shadow-xl backdrop-blur-md'}`}>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                                <User size={20} className={entryMode === 'family' ? 'text-purple-300' : 'text-emerald-300'}/> 
                                Basic Contact Details
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-purple-200 mb-2">Patient's Name*</label>
                                    <input required name="Patient_Name" placeholder="Jane Doe" className={inputClasses} disabled={status === 'sending'} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-purple-200 mb-2">Contact Phone*</label>
                                    <input required type="tel" name="Phone" placeholder="(555) 123-4567" className={inputClasses} disabled={status === 'sending'} />
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-6 mt-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-purple-200 mb-2">Email Address*</label>
                                    <input required type="email" name="Email" placeholder="you@example.com" className={inputClasses} disabled={status === 'sending'} />
                                </div>
                                {entryMode === 'family' && (
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-purple-200 mb-2">Your Relation to Patient</label>
                                        <input name="Contact_Name" placeholder="e.g. Daughter, Spouse" className={inputClasses} disabled={status === 'sending'} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Professional-only Path */}
                        {entryMode === 'professional' && (
                            <div className="animate-fadeIn space-y-6">
                                <div className="p-6 rounded-[24px] bg-emerald-900/30 border border-emerald-500/30 space-y-6">
                                    <h3 className="text-xl font-bold text-emerald-300 flex items-center gap-2">
                                        <Stethoscope size={20}/> Physician Details
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-2">Physician Name*</label>
                                            <input required name="Physician_Name" placeholder="Dr. Robert Smith" className={inputClasses} disabled={status === 'sending'} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-2">10-Digit NPI*</label>
                                            <input required name="NPI_Number" placeholder="1234567890" maxLength={10} className={inputClasses} disabled={status === 'sending'} />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-[24px] bg-white text-slate-900 shadow-2xl space-y-4">
                                    <h3 className="text-xl font-black flex items-center gap-2">
                                        <UploadCloud size={20} className='text-purple-600'/> Attach Referral Docs
                                    </h3>
                                    <div className="relative">
                                        <input 
                                            id="public_upload"
                                            type="file" 
                                            multiple
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            disabled={isUploading}
                                        />
                                        <label htmlFor="public_upload" className={`flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all ${isUploading ? 'opacity-50' : ''}`}>
                                            <UploadCloud size={32} className="text-slate-300 mb-2" />
                                            <span className="text-sm font-bold text-slate-600">{isUploading ? 'Uploading to Secure Vault...' : 'Click to Upload Patient Packet'}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">PDF, JPG, or DOC (Max 10MB)</span>
                                        </label>
                                        
                                        {uploadedDocs.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {uploadedDocs.map((url, i) => (
                                                    <div key={i} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-black border border-emerald-100 flex items-center gap-2">
                                                        Doc_{i+1}.pdf <CheckCircle size={12} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-purple-200 mb-2">Describe Care Needs*</label>
                            <textarea required name="Message" rows="4" placeholder="How can we help?" className={inputClasses} disabled={status === 'sending'} />
                        </div>

                        <button 
                            type="submit" 
                            disabled={status === 'sending' || status === 'sent'}
                            className={`
                                w-full inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full font-black uppercase tracking-widest transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98]
                                ${status === 'sent' ? 'bg-emerald-500 text-white' : status === 'sending' ? 'bg-purple-300 text-purple-900' : 'bg-white text-purple-800'}
                            `}
                        >
                            {status === 'sending' ? (
                                <><Loader2 size={20} className="animate-spin" /> Synchronizing...</>
                            ) : status === 'sent' ? (
                                <><CheckCircle size={20} /> Application Received</>
                            ) : (
                                <><Mail size={20} /> {entryMode === 'family' ? 'Send Request' : 'Submit Professional Referral'}</>
                            )}
                        </button>

                        {status === 'error' && <p className="text-rose-300 text-xs font-bold mt-4 text-center">Submission failed. Please call (657) 377-0776 for assistance.</p>}
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
                                For urgent matters or to speak directly with an intake specialist, please use the contact details below. Our team is available Monday–Friday, 9AM–5PM.
                            </p>
                            
                            <div className="space-y-6">
                                {/* Phone Number */}
                                <div className="flex items-start gap-4">
                                    <Phone size={24} className="flex-shrink-0 mt-1 text-emerald-300" />
                                    <div>
                                        <p className="text-lg font-semibold">Office Phone Line</p>
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
                                        <p className="text-white">20422 Beach Blvd, Suite 320, Huntington Beach, CA 92648</p>
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