import React, { useState, useEffect } from 'react';
import {
    PlusCircle,
    History,
    User,
    ChevronRight,
    FilePlus,
    Activity,
    CheckCircle2,
    Clock,
    LogOut,
    Stethoscope,
    Phone,
    Calendar,
    ClipboardList,
    AlertCircle,
    Search,
    Plus,
    ShieldCheck,
    Zap,
    DollarSign,
    TrendingUp,
    Info,
    ChevronLeft,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ICD10Search from '../components/ICD10Search';

const ProviderDashboard = () => {

    const [provider, setProvider] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [activeView, setActiveView] = useState('new');
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState({ type: '', message: '' });
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        patient_name: '',
        patient_dob: '',
        patient_phone: ''
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [primaryDiagnosis, setPrimaryDiagnosis] = useState(null);
    const [secondaryDiagnoses, setSecondaryDiagnoses] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTarget, setSearchTarget] = useState('primary');

    const AVAILABLE_SERVICES = [
        "Skilled Nursing",
        "Physical Therapy",
        "Occupational Therapy",
        "Speech Therapy",
        "Wound Care",
        "Medication Management"
    ];

    const toggleService = (service) => {
        setSelectedServices(prev =>
            prev.includes(service)
                ? prev.filter(s => s !== service)
                : [...prev, service]
        );
    };

    useEffect(() => {
        const token = localStorage.getItem('olympia_token');
        const storedProvider = localStorage.getItem('olympia_provider');

        if (!token) {
            navigate('/provider-login');
            return;
        }

        if (storedProvider) {
            setProvider(JSON.parse(storedProvider));
        }

        fetchReferrals(token);
    }, []);

    const fetchReferrals = async (token) => {
        try {
            const res = await fetch('/api/referrals/my', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setReferrals(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('olympia_token');
        localStorage.removeItem('olympia_provider');
        navigate('/provider-login');
    };

    const handleSubmit = async () => {

        if (!formData.patient_name || !formData.patient_dob || !primaryDiagnosis) {
            setStatus({
                type: 'error',
                message: 'Patient Name, DOB, and Primary Diagnosis are required.'
            });
            return;
        }

        setStatus({ type: 'loading', message: 'Submitting referral...' });

        const token = localStorage.getItem('olympia_token');

        const payload = {
            ...formData,
            diagnosis: primaryDiagnosis.code + ' - ' + primaryDiagnosis.description,
            secondary_diagnoses: secondaryDiagnoses.map(d => d.code),
            services_needed: selectedServices.join(', ')
        };

        try {
            const res = await fetch('/api/referrals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {

                setStatus({
                    type: 'success',
                    message: 'Referral submitted successfully.'
                });

                setFormData({
                    patient_name: '',
                    patient_dob: '',
                    patient_phone: ''
                });

                setPrimaryDiagnosis(null);
                setSecondaryDiagnoses([]);
                setSelectedServices([]);
                setCurrentStep(1);

                fetchReferrals(token);

                setTimeout(() => {
                    setActiveView('history');
                }, 1500);

            } else {
                setStatus({ type: 'error', message: data.error });
            }

        } catch (err) {
            setStatus({ type: 'error', message: 'Network error.' });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Activity className="animate-spin text-teal-500 w-10 h-10" />
            </div>
        );
    }

    return (

        <div className="min-h-screen bg-slate-50 flex">

            {/* SIDEBAR */}

            <div className="w-80 bg-white border-r p-8 flex flex-col">

                <div className="flex items-center gap-3 mb-10">
                    <Stethoscope className="text-teal-500" />
                    <h1 className="font-black text-xl">Olympia Portal</h1>
                </div>

                <button
                    onClick={() => setActiveView('new')}
                    className="flex items-center gap-3 mb-3 p-3 rounded-xl hover:bg-slate-100"
                >
                    <FilePlus size={18} />
                    New Referral
                </button>

                <button
                    onClick={() => setActiveView('history')}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100"
                >
                    <History size={18} />
                    Submission History
                </button>

                <div className="mt-auto">

                    <div className="text-sm mb-4">
                        <div className="font-bold">{provider?.name}</div>
                        <div className="text-xs text-slate-500">
                            {provider?.provider_id}
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-500"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>

                </div>

            </div>

            {/* MAIN */}

            <div className="flex-1 p-10">

                {activeView === 'new' ? (

                    <div className="max-w-3xl">

                        <h2 className="text-3xl font-black mb-6">
                            Patient Referral
                        </h2>

                        {/* STEP 1 */}

                        {currentStep === 1 && (
                            <div className="space-y-6">

                                <input
                                    placeholder="Patient Name"
                                    value={formData.patient_name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            patient_name: e.target.value
                                        })
                                    }
                                    className="w-full p-4 border rounded-xl"
                                />

                                <input
                                    type="date"
                                    value={formData.patient_dob}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            patient_dob: e.target.value
                                        })
                                    }
                                    className="w-full p-4 border rounded-xl"
                                />

                                <input
                                    placeholder="Phone"
                                    value={formData.patient_phone}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            patient_phone: e.target.value
                                        })
                                    }
                                    className="w-full p-4 border rounded-xl"
                                />

                                <button
                                    onClick={() => setCurrentStep(2)}
                                    className="bg-slate-900 text-white px-6 py-3 rounded-xl"
                                >
                                    Continue
                                </button>

                            </div>
                        )}

                        {/* STEP 2 */}

                        {currentStep === 2 && (
                            <div>

                                {!primaryDiagnosis ? (
                                    <button
                                        onClick={() => setIsSearching(true)}
                                        className="border-dashed border p-8 w-full rounded-xl"
                                    >
                                        Search Diagnosis
                                    </button>
                                ) : (
                                    <div className="border p-6 rounded-xl flex justify-between">

                                        <div>
                                            <div className="font-bold">
                                                {primaryDiagnosis.code}
                                            </div>
                                            <div className="text-sm">
                                                {primaryDiagnosis.description}
                                            </div>
                                        </div>

                                        <button onClick={() => setPrimaryDiagnosis(null)}>
                                            <X />
                                        </button>

                                    </div>
                                )}

                                {isSearching && (
                                    <ICD10Search
                                        isEmbedded={true}
                                        onSelect={(code) => {
                                            setPrimaryDiagnosis(code);
                                            setIsSearching(false);
                                        }}
                                    />
                                )}

                                <button
                                    onClick={() => setCurrentStep(3)}
                                    className="mt-6 bg-slate-900 text-white px-6 py-3 rounded-xl"
                                >
                                    Continue
                                </button>

                            </div>
                        )}

                        {/* STEP 3 */}

                        {currentStep === 3 && (

                            <div className="grid grid-cols-2 gap-4">

                                {AVAILABLE_SERVICES.map(service => (

                                    <button
                                        key={service}
                                        onClick={() => toggleService(service)}
                                        className={`p-5 border rounded-xl ${selectedServices.includes(service)
                                            ? 'bg-teal-100'
                                            : ''
                                            }`}
                                    >
                                        {service}
                                    </button>

                                ))}

                                <button
                                    onClick={() => setCurrentStep(4)}
                                    className="col-span-2 mt-4 bg-slate-900 text-white p-4 rounded-xl"
                                >
                                    Continue
                                </button>

                            </div>

                        )}

                        {/* STEP 4 */}

                        {currentStep === 4 && (

                            <div className="space-y-6">

                                <div className="p-6 border rounded-xl">

                                    <div className="font-bold mb-2">
                                        {formData.patient_name}
                                    </div>

                                    <div className="text-sm text-slate-500">
                                        {formData.patient_dob}
                                    </div>

                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="bg-slate-900 text-white px-10 py-4 rounded-xl"
                                >
                                    Submit Referral
                                </button>

                                {status.message && (
                                    <div className="text-sm">
                                        {status.message}
                                    </div>
                                )}

                            </div>

                        )}

                    </div>

                ) : (

                    /* HISTORY VIEW */

                    <div>

                        <h2 className="text-3xl font-black mb-6">
                            Submission History
                        </h2>

                        <div className="space-y-4">

                            {referrals.length === 0 && (
                                <div className="text-slate-500">
                                    No referrals submitted yet.
                                </div>
                            )}

                            {referrals.map((r) => (

                                <div
                                    key={r.id}
                                    className="border rounded-xl p-6 flex justify-between"
                                >

                                    <div>

                                        <div className="font-bold">
                                            {r.patient_name}
                                        </div>

                                        <div className="text-sm text-slate-500">
                                            {r.diagnosis}
                                        </div>

                                    </div>

                                    <div className="text-xs text-slate-400">
                                        {r.status || "Submitted"}
                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
};

export default ProviderDashboard;
