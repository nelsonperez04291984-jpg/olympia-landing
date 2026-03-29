import { useState } from "react";
import { Search, CheckCircle2 } from "lucide-react";

export default function PatientReferral() {

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

    const services = [
        "Skilled Nursing",
        "Physical Therapy",
        "Occupational Therapy",
        "Speech Therapy",
        "Medical Social Worker",
        "Home Health Aide"
    ];

    const handleSubmit = async () => {

        if (!formData.first_name || !formData.last_name || !primaryDiagnosis) {
            alert("First name, last name and diagnosis are required.");
            return;
        }

        const payload = {
            patient_first_name: formData.first_name,
            patient_middle_name: formData.middle_name,
            patient_last_name: formData.last_name,
            patient_dob: formData.dob,
            patient_phone: formData.phone,
            diagnosis: primaryDiagnosis.code + " - " + primaryDiagnosis.description,
            services_needed: selectedServices.join(", ")
        };

        try {

            const token = localStorage.getItem("olympia_token");

            const res = await fetch("/api/referrals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {

                alert("Referral submitted successfully!");

                setStep(1);

                setPrimaryDiagnosis(null);
                setSelectedServices([]);

                setFormData({
                    first_name: "",
                    middle_name: "",
                    last_name: "",
                    dob: "",
                    phone: ""
                });

            } else {
                alert(data.error || "Submission failed.");
            }

        } catch (err) {
            console.error(err);
            alert("Network error.");
        }

    };

    const toggleService = (service) => {

        if (selectedServices.includes(service)) {
            setSelectedServices(selectedServices.filter(s => s !== service));
        } else {
            setSelectedServices([...selectedServices, service]);
        }

    };

    return (

        <div className="min-h-screen bg-[#F5F3FF]">

            {/* Header */}

            <div className="bg-gradient-to-r from-[#6A1B9A] to-[#8E24AA] text-white py-10 shadow">

                <div className="max-w-5xl mx-auto px-6">

                    <h1 className="text-3xl font-bold">
                        Patient Referral
                    </h1>

                    <p className="text-purple-100 mt-2">
                        Submit a new home health referral
                    </p>

                </div>

            </div>

            {/* Main Card */}

            <div className="max-w-5xl mx-auto px-6 py-10">

                <div className="bg-white rounded-xl shadow-lg p-8">

                    {/* STEP 1 */}

                    {step === 1 && (

                        <div>

                            <h2 className="text-xl font-semibold mb-6">
                                Patient Information
                            </h2>

                            <div className="grid grid-cols-3 gap-4">

                                <input
                                    placeholder="First Name"
                                    value={formData.first_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, first_name: e.target.value })
                                    }
                                    className="border rounded-lg p-3"
                                />

                                <input
                                    placeholder="Middle Name"
                                    value={formData.middle_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, middle_name: e.target.value })
                                    }
                                    className="border rounded-lg p-3"
                                />

                                <input
                                    placeholder="Last Name"
                                    value={formData.last_name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, last_name: e.target.value })
                                    }
                                    className="border rounded-lg p-3"
                                />

                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">

                                <input
                                    type="date"
                                    value={formData.dob}
                                    onChange={(e) =>
                                        setFormData({ ...formData, dob: e.target.value })
                                    }
                                    className="border rounded-lg p-3"
                                />

                                <input
                                    placeholder="Phone"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                    className="border rounded-lg p-3"
                                />

                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="mt-6 bg-[#7B1FA2] hover:bg-[#6A1B9A] text-white px-6 py-3 rounded-lg"
                            >
                                Next
                            </button>

                        </div>

                    )}

                    {/* STEP 2 */}

                    {step === 2 && (

                        <div>

                            <h2 className="text-xl font-semibold mb-6">
                                Diagnosis
                            </h2>

                            <div className="border rounded-lg p-4 flex items-center gap-3">

                                <Search size={18} />

                                <input
                                    placeholder="Search ICD-10 code (example: stroke)"
                                    className="flex-1 outline-none"
                                />

                            </div>

                            {primaryDiagnosis && (

                                <div className="mt-4 bg-purple-50 border rounded-lg p-4">

                                    <div className="font-semibold">
                                        {primaryDiagnosis.code}
                                    </div>

                                    <div className="text-gray-600">
                                        {primaryDiagnosis.description}
                                    </div>

                                </div>

                            )}

                            <div className="flex gap-4 mt-6">

                                <button
                                    onClick={() => setStep(1)}
                                    className="border px-6 py-3 rounded-lg"
                                >
                                    Back
                                </button>

                                <button
                                    onClick={() => setStep(3)}
                                    className="bg-[#7B1FA2] hover:bg-[#6A1B9A] text-white px-6 py-3 rounded-lg"
                                >
                                    Next
                                </button>

                            </div>

                        </div>

                    )}

                    {/* STEP 3 */}

                    {step === 3 && (

                        <div>

                            <h2 className="text-xl font-semibold mb-6">
                                Services Needed
                            </h2>

                            <div className="grid grid-cols-2 gap-4">

                                {services.map(service => (

                                    <div
                                        key={service}
                                        onClick={() => toggleService(service)}
                                        className={`border rounded-lg p-4 cursor-pointer transition
                    ${selectedServices.includes(service)
                                                ? "bg-purple-100 border-purple-500"
                                                : ""
                                            }`}
                                    >
                                        {service}
                                    </div>

                                ))}

                            </div>

                            <div className="flex justify-between mt-8">

                                <button
                                    onClick={() => setStep(2)}
                                    className="border px-6 py-3 rounded-lg"
                                >
                                    Back
                                </button>

                                <button
                                    onClick={handleSubmit}
                                    className="bg-[#7B1FA2] hover:bg-[#6A1B9A] text-white px-8 py-3 rounded-lg flex items-center gap-2"
                                >
                                    <CheckCircle2 size={18} />
                                    Submit Referral
                                </button>

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}