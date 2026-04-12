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

export default function Contact() {
    const [status, setStatus] = useState(null) // null, 'sending', 'sent', 'error'
    const [entryMode, setEntryMode] = useState('family') // 'family' or 'professional'
    const [uploadedDocs, setUploadedDocs] = useState([])
    const [isUploading, setIsUploading] = useState(false)
    const [ref, isInView] = useInView(0.2)

    const handleSubmit = async (e) => {
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

    // Advanced Clinical Input Classes
    const inputClasses = "mt-2 w-full rounded-2xl p-4 text-white bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 placeholder-gray-600 outline-none"
    const fileInputClasses = "hidden"

    return (
        <section id="contact" className="py-24 bg-[#0a0a0a] relative overflow-hidden">
            {/* Cinematic Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/5 rounded-full filter blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full filter blur-[120px] pointer-events-none"></div>

            <div ref={ref} className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-20">

                    {/* Left Column: Sophisticated Form */}
                    <div className={`transition-all duration-[1500ms] ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        <div className="flex items-center gap-3 mb-10">
                            {[
                                { id: 'family', label: 'Patient/Family', icon: User },
                                { id: 'professional', label: 'Clinical Provider', icon: Stethoscope }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setEntryMode(mode.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${entryMode === mode.id ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'}`}
                                >
                                    <mode.icon size={14} />
                                    {mode.label}
                                </button>
                            ))}
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                            {entryMode === 'family' ? 'Initiate Your Care Path' : 'Professional Referral Interface'}
                        </h2>

                        <p className="text-gray-400 font-medium leading-relaxed mb-12 max-w-lg">
                            {entryMode === 'family'
                                ? "Experience clinical excellence from your first interaction. Request information for localized home care."
                                : "Submit clinical packets through our secure coordination portal for priority patient assessment."}
                        </p>

                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {/* Input Grid: Shared Details */}
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 ml-1">Patient Identity</label>
                                    <input required name="Patient_Name" placeholder="Full Name" className={inputClasses} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 ml-1">Secure Phone</label>
                                    <input required type="tel" name="Phone" placeholder="(555) 000-0000" className={inputClasses} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 ml-1">Contact Email</label>
                                <input required type="email" name="Email" placeholder="clinical-inquiry@provider.com" className={inputClasses} />
                            </div>

                            {/* Conditional Professional Path */}
                            {entryMode === 'professional' && (
                                <div className="animate-fadeInUp space-y-8 pt-4">
                                    <div className="p-8 rounded-[32px] bg-emerald-500/5 border border-emerald-500/20 space-y-8">
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 ml-1">Physician Lead</label>
                                                <input required name="Physician_Name" placeholder="Dr. Full Name" className={inputClasses} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 ml-1">NPI Identification</label>
                                                <input required name="NPI_Number" placeholder="10 Digits" maxLength={10} className={inputClasses} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/10 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Clinical Documentation</label>
                                            {isUploading && <span className="text-[8px] font-black text-emerald-400 uppercase animate-pulse">Encoding Docs...</span>}
                                        </div>
                                        <input id="public_upload" type="file" multiple onChange={handleFileUpload} className="hidden" />
                                        <label htmlFor="public_upload" className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-[28px] cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all group/upload">
                                            <UploadCloud size={32} className="text-white/20 group-hover/upload:text-purple-400 transition-colors mb-4" />
                                            <span className="text-xs font-black text-white/60">Attach Patient Packet</span>
                                        </label>

                                        {uploadedDocs.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {uploadedDocs.map((url, i) => (
                                                    <div key={i} className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black border border-emerald-500/20">
                                                        UPLOAD_READY_{i + 1}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 ml-1">Clinical Context</label>
                                <textarea required name="Message" rows="4" placeholder="Briefly describe patient condition or required services" className={inputClasses} />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending' || status === 'sent'}
                                className={`w-full py-5 rounded-full font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-500 hover:scale-105 ${status === 'sent' ? 'bg-emerald-500 text-white' : 'bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-white/20'}`}
                            >
                                {status === 'sending' ? 'Synchronizing Data...' : status === 'sent' ? 'Referral Verified' : 'Initiate Secure Transfer'}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Information Pods */}
                    <div className={`space-y-8 transition-all duration-[1500ms] delay-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}>
                        {/* Interactive Info Pod */}
                        <div className="bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-3xl rounded-[48px] p-12 border border-white/10 h-fit">
                            <h3 className="text-3xl font-black text-white mb-8 tracking-tighter">Coordination Hub</h3>
                            <div className="space-y-12">
                                {[
                                    { label: 'Direct Line', value: '(657) 377-0776', icon: Phone, sub: 'Intake available 9AM–5PM' },
                                    { label: 'Cloud Mail', value: 'olympiahomehealthinc@gmail.com', icon: Mail, sub: 'Response within 120min' },
                                    { label: 'Base Command', value: 'Huntington Beach, CA', icon: MapPin, sub: 'Regional Operations Center' }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 group/info">
                                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover/info:border-purple-500/50 transition-colors">
                                            <item.icon className="text-purple-400" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{item.label}</p>
                                            <p className="text-lg font-black text-white mb-1">{item.value}</p>
                                            <p className="text-xs text-gray-500 font-medium">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Integrated Calendly Section */}
                            <div className="mt-16 pt-12 border-t border-white/5">
                                <h4 className="text-xl font-black text-white mb-4 tracking-tighter">Schedule a Strategy Call</h4>
                                <p className="text-sm text-gray-500 font-medium mb-8">Access our clinical calendars directly to book a priority video consultation.</p>
                                <CalendlyEmbed />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
