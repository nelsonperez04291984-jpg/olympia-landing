import React, { useState } from "react";
import {
    PlusCircle,
    History,
    LogOut,
    Stethoscope,
    Search,
    CheckCircle2,
    X
} from "lucide-react";
import ICD10Search from "../components/ICD10Search";

const ProviderDashboard = () => {

    const [activeView, setActiveView] = useState("new");
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        dob: "",
        phone: ""
    });

    const [primaryDiagnosis, setPrimaryDiagnosis] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);
    const [showSearch, setShowSearch] = useState(false);

    const SERVICES = [
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

    return (

        <div className="flex min-h-screen bg-[#F5F3FF]">

            {/* Sidebar */}

            <aside className="w-72 bg-white border-r flex flex-col p-6">

                <div className="flex items-center gap-3 mb-10">
                    <Stethoscope className="text-[#6A1B9A]" />
                    <h1 className="font-bold text-xl">Olympia Provider</h1>
                </div>

                <button
                    onClick={() => setActiveView("new")}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#EDE7F6]"
                >
                    <PlusCircle size={18} />
                    New Referral
                </button>

                <button
                    onClick={() => setActiveView("history")}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#EDE7F6]"
                >
                    <History size={18} />
                    History
                </button>

                <div className="mt-auto">
                    <button className="flex items-center gap-2 text-red-500">
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>

            </aside>

            {/* Main Content */}

            <main className="flex-1 p-10">

                {activeView === "new" ? (

                    <div className="max-w-4xl mx-auto">

                        <h2 className="text-3xl font-bold mb-8">
                            New Patient Referral
                        </h2>

                        {/* Step indicator */}

                        <div className="flex gap-4 mb-10">

                            {[1, 2, 3, 4].map((s) => (
                                <div
                                    key={s}
                                    className={`px-4 py-2 rounded-full text-sm ${step >= s
                                            ? "bg-[#7B1FA2] text-white"
                                            : "bg-slate-200 text-slate-500"
                                        }`}
                                >
                                    Step {s}
                                </div>
                            ))}

                        </div>

                        {/* STEP 1 PATIENT INFO */}

                        {step === 1 && (

                            <div className="bg-white rounded-xl p-8 shadow space-y-6">

                                <h3 className="font-semibold text-lg">
                                    Patient Information
                                </h3>

                                <div className="grid grid-cols-3 gap-4">

                                    <input
                                        placeholder="First Name"
                                        className="border rounded-lg p-3"
                                        value={formData.first_name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, first_name: e.target.value })
                                        }
                                    />

                                    <input
                                        placeholder="Middle Name"
                                        className="border rounded-lg p-3"
                                        value={formData.middle_name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, middle_name: e.target.value })
                                        }
                                    />

                                    <input
                                        placeholder="Last Name"
                                        className="border rounded-lg p-3"
                                        value={formData.last_name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, last_name: e.target.value })
                                        }
                                    />

                                </div>

                                <div className="grid grid-cols-2 gap-4">

                                    <input
                                        type="date"
                                        className="border rounded-lg p-3"
                                        value={formData.dob}
                                        onChange={(e) =>
                                            setFormData({ ...formData, dob: e.target.value })
                                        }
                                    />

                                    <input
                                        placeholder="Phone Number"
                                        className="border rounded-lg p-3"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                    />

                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    className="bg-[#7B1FA2] hover:bg-[#6A1B9A] text-white px-6 py-3 rounded-lg"
                                >
                                    Continue
                                </button>

                            </div>
                        )}

                        {/* STEP 2 DIAGNOSIS */}

                        {step === 2 && (

                            <div className="bg-white rounded-xl p-8 shadow space-y-6">

                                <h3 className="font-semibold text-lg">
                                    Primary Diagnosis
                                </h3>

                                {!primaryDiagnosis && (
                                    <button
                                        onClick={() => setShowSearch(true)}
                                        className="border-dashed border p-6 rounded-lg w-full text-left hover:bg-[#F5F3FF]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Search size={18} />
                                            Search ICD-10 diagnosis
                                        </div>
                                    </button>
                                )}

                                {primaryDiagnosis && (
                                    <div className="border rounded-lg p-5 flex justify-between bg-[#F5F3FF]">

                                        <div>
                                            <div className="font-semibold">
                                                {primaryDiagnosis.code}
                                            </div>
                                            <div className="text-sm text-slate-600">
                                                {primaryDiagnosis.description}
                                            </div>
                                        </div>

                                        <button onClick={() => setPrimaryDiagnosis(null)}>
                                            <X />
                                        </button>

                                    </div>
                                )}

                                {showSearch && (
                                    <ICD10Search
                                        isEmbedded={true}
                                        onSelect={(code) => {
                                            setPrimaryDiagnosis(code);
                                            setShowSearch(false);
                                        }}
                                    />
                                )}

                                <button
                                    onClick={() => setStep(3)}
                                    className="bg-[#7B1FA2] hover:bg-[#6A1B9A] text-white px-6 py-3 rounded-lg"
                                >
                                    Continue
                                </button>

                            </div>
                        )}

                        {/* STEP 3 SERVICES */}

                        {step === 3 && (

                            <div className="bg-white rounded-xl p-8 shadow">

                                <h3 className="font-semibold text-lg mb-6">
                                    Requested Services
                                </h3>

                                <div className="grid grid-cols-2 gap-4">

                                    {SERVICES.map(service => (
                                        <button
                                            key={service}
                                            onClick={() => toggleService(service)}
                                            className={`p-4 border rounded-lg text-left ${selectedServices.includes(service)
                                                    ? "bg-[#EDE7F6] border-[#8E24AA]"
                                                    : ""
                                                }`}
                                        >
                                            {service}
                                        </button>
                                    ))}

                                </div>

                                <button
                                    onClick={() => setStep(4)}
                                    className="mt-6 bg-[#7B1FA2] hover:bg-[#6A1B9A] text-white px-6 py-3 rounded-lg"
                                >
                                    Continue
                                </button>

                            </div>
                        )}

                        {/* STEP 4 REVIEW */}

                        {step === 4 && (

                            <div className="bg-white rounded-xl p-8 shadow space-y-6">

                                <h3 className="font-semibold text-lg">
                                    Review Referral
                                </h3>

                                <div className="border rounded-lg p-5">

                                    <div className="font-semibold">
                                        {formData.first_name} {formData.middle_name} {formData.last_name}
                                    </div>

                                    <div className="text-sm text-slate-500">
                                        DOB: {formData.dob}
                                    </div>

                                </div>

                                <button
                                    className="bg-[#7B1FA2] hover:bg-[#6A1B9A] text-white px-8 py-4 rounded-lg flex items-center gap-2"
                                >
                                    <CheckCircle2 size={18} />
                                    Submit Referral
                                </button>

                            </div>
                        )}

                    </div>

                ) : (

                    <div>

                        <h2 className="text-3xl font-bold mb-8">
                            Referral History
                        </h2>

                        <div className="bg-white rounded-xl p-8 shadow text-slate-500">
                            No referrals submitted yet.
                        </div>

                    </div>

                )}

            </main>

        </div>
    );
};

export default ProviderDashboard;