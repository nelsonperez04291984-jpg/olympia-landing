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

    // Upgraded Input Classes for Visibility on Purple
    const inputClasses = "mt-2 w-full rounded-2xl p-4 text-gray-900 bg-white/95 border border-purple-200 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 placeholder-gray-400 outline-none shadow-inner"
    const fileInputClasses = "hidden"

    return (
        <section id="contact" className="py-24 bg-gradient-to-br from-purple-800 via-purple-700 to-indigo-900 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full filter blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-400/10 rounded-full filter blur-[100px] pointer-events-none"></div>

            <div ref={ref} className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-20">

                    {/* Left Column: Form */}
                    <div className={`transition-all duration-[1500ms] ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        <div className="flex items-center gap-3 mb-10">
                            {[
                                { id: 'family', label: 'Patient/Family', icon: User },
                                { id: 'professional', label: 'Clinical Provider', icon: Stethoscope }
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setEntryMode(mode.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${entryMode === mode.id ? 'bg-white text-purple-900 shadow-2xl' : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'}`}
                                >
                                    <mode.icon size={14} />
                                    {mode.label}
                                </button>
                            ))}
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                            {entryMode === 'family' ? 'Get Started' : 'Referral Portal'}
                        </h2>

                        <p className="text-purple-100 font-medium leading-relaxed mb-12 max-w-lg opacity-80">
                            {entryMode === 'family'
                                ? "Fill out the form below to initiate your care path. Our team will contact you shortly."
                                : "Submit clinical packets through our secure intake coordination system for priority assessment."}
                        </p>

                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {/* Input Grid */}
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white ml-1">Patient Name</label>
                                    <input required name="Patient_Name" placeholder="Full Name" className={inputClasses} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white ml-1">Phone Number</label>
                                    <input required type="tel" name="Phone" placeholder="(555) 000-0000" className={inputClasses} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white ml-1">Secure Email</label>
                                <input required type="email" name="Email" placeholder="email@address.com" className={inputClasses} />
                            </div>

                            {/* Professional Path Extension */}
                            {entryMode === 'professional' && (
                                <div className="animate-fadeInUp space-y-8 pt-4">
                                    <div className="p-8 rounded-[32px] bg-white/10 border border-white/10 space-y-8 shadow-inner">
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-200 ml-1">Physician Name</label>
                                                <input required name="Physician_Name" placeholder="Dr. Full Name" className={inputClasses} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-200 ml-1">NPI Number</label>
                                                <input required name="NPI_Number" placeholder="10 Digits" maxLength={10} className={inputClasses} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white opacity-60">Attachment Packet</label>
                                            {isUploading && <span className="text-[8px] font-black text-white uppercase animate-pulse">Syncing...</span>}
                                        </div>
                                        <input id="public_upload" type="file" multiple onChange={handleFileUpload} className="hidden" />
                                        <label htmlFor="public_upload" className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/20 rounded-[28px] cursor-pointer hover:border-white/50 hover:bg-white/10 transition-all group/upload">
                                            <UploadCloud size={32} className="text-white opacity-20 group-hover/upload:opacity-100 transition-opacity mb-4" />
                                            <span className="text-xs font-black text-white opacity-60">Click to upload packets</span>
                                        </label>

                                        {uploadedDocs.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {uploadedDocs.map((url, i) => (
                                                    <div key={i} className="bg-white text-purple-900 px-4 py-2 rounded-xl text-[10px] font-black">
                                                        UPLOADED_{i + 1}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white ml-1">Comments</label>
                                <textarea required name="Message" rows="4" placeholder="Briefly describe required services" className={inputClasses} />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending' || status === 'sent'}
                                className={`w-full py-5 rounded-full font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-500 hover:scale-105 ${status === 'sent' ? 'bg-green-500 text-white shadow-2xl' : 'bg-white text-purple-900 shadow-2xl hover:bg-gray-100'}`}
                            >
                                {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Referral Received' : 'Send Secure Message'}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Info Pods */}
                    <div className={`space-y-8 transition-all duration-[1500ms] delay-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}>
                        <div className="bg-white/10 backdrop-blur-3xl rounded-[48px] p-12 border border-white/10 h-fit shadow-2xl">
                            <h3 className="text-3xl font-black text-white mb-8 tracking-tighter">Coordination Hub</h3>
                            <div className="space-y-12">
                                {[
                                    { label: 'Direct Line', value: '(657) 377-0776', icon: Phone, sub: 'Intake available 9AM–5PM' },
                                    { label: 'Secure Email', value: 'olympiahomehealthinc@gmail.com', icon: Mail, sub: 'Clinical Response within 2hrs' },
                                    { label: 'Operations', value: 'Huntington Beach, CA', icon: MapPin, sub: 'Regional Hub' }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 group/info">
                                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover/info:bg-white/20 transition-all">
                                            <item.icon className="text-white" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{item.label}</p>
                                            <p className="text-lg font-black text-white mb-1">{item.value}</p>
                                            <p className="text-xs text-purple-200 opacity-60 font-medium">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Calendly Integration */}
                            <div className="mt-16 pt-12 border-t border-white/10">
                                <h4 className="text-xl font-black text-white mb-4 tracking-tighter">Schedule Strategy Call</h4>
                                <p className="text-sm text-purple-100 opacity-60 font-medium mb-8">Access our clinical calendars to book a priority video consultation.</p>
                                <CalendlyEmbed />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
