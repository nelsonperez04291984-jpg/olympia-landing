import React, { useState } from 'react';
import { X, User, FileText, CheckCircle, Loader2, Hospital, ArrowRight, ArrowLeft } from 'lucide-react';

const ProviderPortal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [status, setStatus] = useState(null); // 'sending', 'sent', 'error'

    if (!isOpen) return null;

    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xbdzaokz'; // Reusing the same endpoint for now

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const data = new FormData(form);
        
        // Add a hidden field to explicitly tag this as a Provider Referral
        data.append("Source", "B2B Provider Portal");
        
        setStatus('sending');

        try {
            const res = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                setStatus('sent');
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error("Portal submission error:", error);
            setStatus('error');
        }
    };

    const inputClasses = "mt-1 w-full rounded-lg p-3 text-gray-800 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-1";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 text-white flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Hospital className="text-blue-300" />
                            Provider Referral Portal
                        </h2>
                        <p className="text-blue-200 text-sm mt-1">Secure, direct intake for physicians and case managers.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        aria-label="Close Portal"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body & Form content */}
                <div className="p-6 md:p-8 overflow-y-auto flex-grow bg-slate-50">
                    
                    {status === 'sent' ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center animate-fadeIn">
                            <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">Referral Received</h3>
                            <p className="text-lg text-gray-600 max-w-md">
                                Thank you for trusting Olympia Home Health with your patient's care. Our intake coordinators will review the documentation and contact your office shortly.
                            </p>
                            <button 
                                onClick={onClose}
                                className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition"
                            >
                                Close Portal
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} id="provider-referral-form">
                            
                            {/* Step Indicator */}
                            <div className="flex items-center justify-between mb-8 relative">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 transition-all duration-500`} style={{ width: `${(step - 1) * 50}%` }}></div>
                                
                                {[1, 2, 3].map((num) => (
                                    <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors duration-500 ${step >= num ? 'bg-blue-600 border-blue-100 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                                        {num}
                                    </div>
                                ))}
                            </div>

                            {/* STEP 1: Provider Info */}
                            <div className={`transition-all duration-300 ${step === 1 ? 'block animate-fadeIn' : 'hidden'}`}>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-2">
                                    <Hospital className="text-blue-600 w-5 h-5"/> 1. Referring Provider Details
                                </h3>
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClasses}>Referring Physician/Sender Name*</label>
                                        <input required type="text" name="Physician_Name" className={inputClasses} placeholder="Dr. Jane Smith" />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Facility/Clinic Name*</label>
                                        <input required type="text" name="Facility_Name" className={inputClasses} placeholder="Orange County Medical Center" />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>NPI Number*</label>
                                        <input required type="text" name="NPI_Number" className={inputClasses} placeholder="10-digit NPI" maxLength={10} pattern="\d{10}" />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Direct Callback Number*</label>
                                        <input required type="tel" name="Provider_Phone" className={inputClasses} placeholder="(555) 123-4567" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClasses}>Secure Contact Email*</label>
                                        <input required type="email" name="Provider_Email" className={inputClasses} placeholder="doctor@clinic.com" />
                                    </div>
                                </div>
                            </div>

                            {/* STEP 2: Patient Info */}
                            <div className={`transition-all duration-300 ${step === 2 ? 'block animate-fadeIn' : 'hidden'}`}>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-2">
                                    <User className="text-blue-600 w-5 h-5"/> 2. Patient Demographics & Needs
                                </h3>
                                
                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className={labelClasses}>Patient Full Name*</label>
                                        <input type="text" name="Patient_Name" className={inputClasses} placeholder="John Doe" required={step === 2} />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Date of Birth*</label>
                                        <input type="date" name="Patient_DOB" className={inputClasses} required={step === 2} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClasses}>Patient Address (City/Zip required)*</label>
                                        <input type="text" name="Patient_Address" className={inputClasses} placeholder="123 Main St, Huntington Beach, CA 92648" required={step === 2} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClasses}>Primary Diagnosis / Reason for Referral*</label>
                                        <input type="text" name="Primary_Diagnosis" className={inputClasses} placeholder="e.g. Post-op knee replacement, exacerbation of CHF" required={step === 2} />
                                    </div>
                                </div>

                                {/* Services Requested Checkboxes */}
                                <div>
                                    <label className={labelClasses}>Requested Services (Check all that apply)</label>
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        {['Skilled Nursing (SN)', 'Physical Therapy (PT)', 'Occupational Therapy (OT)', 'Speech Therapy (ST)', 'Medical Social Worker (MSW)', 'Home Health Aide (HHA)'].map(service => (
                                            <label key={service} className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition">
                                                <input type="checkbox" name="Requested_Services" value={service} className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm text-gray-700">{service}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* STEP 3: Uploads */}
                            <div className={`transition-all duration-300 ${step === 3 ? 'block animate-fadeIn' : 'hidden'}`}>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-2">
                                    <FileText className="text-blue-600 w-5 h-5"/> 3. Clinical Documentation
                                </h3>
                                
                                <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-8 text-center mb-6">
                                    <FileText className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                                    <p className="text-gray-700 mb-2 font-medium">Upload necessary clinical documents below.</p>
                                    <p className="text-sm text-gray-500 mb-4">Please include Face-to-Face documentation, H&P, and Medication Profile if available.</p>
                                    
                                    <input 
                                        type="file" 
                                        name="Clinical_Documents" 
                                        multiple 
                                        className="block w-full max-w-sm mx-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition"
                                        required={step === 3}
                                    />
                                </div>
                                
                                <div>
                                    <label className={labelClasses}>Additional Notes / Specific Physician Orders</label>
                                    <textarea name="Additional_Notes" rows="3" className={inputClasses} placeholder="Enter any specific instructions or precautions here..."></textarea>
                                </div>
                                
                                {status === 'error' && (
                                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                                        ⚠️ There was an error sending the referral. Please try again.
                                    </div>
                                )}
                            </div>

                        </form>
                    )}
                </div>
                
                {/* Footer / Controls */}
                {status !== 'sent' && (
                    <div className="bg-white border-t p-6 flex justify-between items-center flex-shrink-0 rounded-b-2xl">
                        <button 
                            type="button"
                            onClick={() => setStep(step - 1)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <ArrowLeft size={18} /> Back
                        </button>
                        
                        {step < 3 ? (
                            <button 
                                type="button"
                                onClick={() => setStep(step + 1)}
                                className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                            >
                                Continue <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button 
                                type="submit"
                                form="provider-referral-form"
                                disabled={status === 'sending'}
                                className="flex items-center gap-2 px-8 py-2.5 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition shadow-lg shadow-green-200 disabled:opacity-70"
                            >
                                {status === 'sending' ? (
                                    <><Loader2 className="animate-spin" size={18}/> Sending...</>
                                ) : (
                                    <><CheckCircle size={18}/> Submit Referral</>
                                )}
                            </button>
                        )}
                    </div>
                )}
                
            </div>
        </div>
    );
};

export default ProviderPortal;
