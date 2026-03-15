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
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProviderDashboard = () => {
    const [provider, setProvider] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [activeView, setActiveView] = useState('new'); // 'new' or 'history'
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState({ type: '', message: '' });
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        patient_name: '',
        patient_dob: '',
        patient_phone: '',
        diagnosis: '',
        services_needed: ''
    });

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
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setReferrals(data);
            }
        } catch (err) {
            console.error("Fetch referrals error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('olympia_token');
        localStorage.removeItem('olympia_provider');
        navigate('/provider-login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', message: 'Deploying Referral...' });
        
        const token = localStorage.getItem('olympia_token');
        try {
            const res = await fetch('/api/referrals', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setStatus({ type: 'success', message: 'Referral submitted and queued for intake successfully.' });
                setFormData({ patient_name: '', patient_dob: '', patient_phone: '', diagnosis: '', services_needed: '' });
                fetchReferrals(token);
                // Switch to history after 2 seconds
                setTimeout(() => setActiveView('history'), 2000);
            } else {
                setStatus({ type: 'error', message: data.error || 'Submission failed' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Network synchronization failed.' });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="text-teal-500 animate-spin w-12 h-12" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Initializing Portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-80 bg-white border-r border-slate-100 flex flex-col h-auto md:h-screen sticky top-0">
                <div className="p-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                            <Stethoscope className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">Olympia Portal</h1>
                    </div>

                    <div className="space-y-2">
                        <button 
                            onClick={() => setActiveView('new')}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeView === 'new' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            <FilePlus size={18} /> New Referral
                        </button>
                        <button 
                            onClick={() => setActiveView('history')}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeView === 'history' ? 'bg-teal-500 text-white shadow-xl shadow-teal-500/20' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            <History size={18} /> Submission History
                        </button>
                    </div>
                </div>

                <div className="mt-auto p-10 border-t border-slate-50">
                    <div className="bg-slate-50 rounded-3xl p-6 mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
                                <User className="text-slate-400 w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-teal-500 tracking-widest">Signed In</p>
                                <p className="font-bold text-slate-900 text-sm">{provider?.name}</p>
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Provider ID</p>
                        <code className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded-lg block w-fit">{provider?.provider_id}</code>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"
                    >
                        <LogOut size={18} /> Secure Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 md:p-12 overflow-y-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 leading-tight">
                            {activeView === 'new' ? 'Patient Referral Audit' : 'Historical Submissions'}
                        </h2>
                        <p className="text-slate-500 mt-2 font-medium">
                            {activeView === 'new' ? 'Deploy a new home health care plan for your patient.' : 'Track the status of your previous care transitions.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <Activity className="text-teal-500" size={20} />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal Status</p>
                                <p className="text-sm font-bold text-slate-900 uppercase">Operational</p>
                            </div>
                        </div>
                    </div>
                </header>

                {activeView === 'new' ? (
                    <div className="max-w-4xl bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-fadeIn">
                        <div className="p-8 md:p-12">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <User size={14} className="text-teal-500" /> Patient Legal Name
                                        </label>
                                        <input 
                                            type="text" required
                                            value={formData.patient_name}
                                            onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                                            placeholder="e.g. Jean Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Calendar size={14} className="text-teal-500" /> Date of Birth
                                        </label>
                                        <input 
                                            type="date" required
                                            value={formData.patient_dob}
                                            onChange={(e) => setFormData({...formData, patient_dob: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Phone size={14} className="text-teal-500" /> Contact Phone
                                        </label>
                                        <input 
                                            type="tel" required
                                            value={formData.patient_phone}
                                            onChange={(e) => setFormData({...formData, patient_phone: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                                            placeholder="(555) 000-0000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <ClipboardList size={14} className="text-teal-500" /> Primary Diagnosis
                                        </label>
                                        <input 
                                            type="text" required
                                            value={formData.diagnosis}
                                            onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                                            placeholder="e.g. Post-Op Total Hip Replacement"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-teal-500" /> Requested Services
                                    </label>
                                    <textarea 
                                        required
                                        value={formData.services_needed}
                                        onChange={(e) => setFormData({...formData, services_needed: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all h-32 resize-none"
                                        placeholder="e.g. PT evaluations, Wound Care weekly, Occupational Therapy..."
                                    ></textarea>
                                </div>

                                {status.message && (
                                    <div className={`p-6 rounded-3xl border flex items-center gap-4 ${status.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : status.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                                        {status.type === 'success' ? <CheckCircle2 size={24} /> : status.type === 'error' ? <AlertCircle size={24} /> : <Activity className="animate-spin" size={24} />}
                                        <p className="font-bold text-sm tracking-tight">{status.message}</p>
                                    </div>
                                )}

                                <button 
                                    type="submit"
                                    disabled={status.type === 'loading'}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-3xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-4 group"
                                >
                                    {status.type === 'loading' ? 'Encrypting & Sending...' : (
                                        <>Deploy Referral Audit <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" /></>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fadeIn">
                        {referrals.length === 0 ? (
                            <div className="bg-white p-20 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 text-center">
                                <History size={48} className="text-slate-200 mx-auto mb-6" />
                                <h3 className="text-xl font-black text-slate-900 mb-2">No Referral History Found</h3>
                                <p className="text-slate-400 font-medium max-w-sm mx-auto">Your medical center hasn't submitted any referrals via this portal yet.</p>
                                <button 
                                    onClick={() => setActiveView('new')}
                                    className="mt-8 bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-teal-500/20"
                                >
                                    Send First Referral
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {referrals.map((ref, i) => (
                                    <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-teal-50 group-hover:border-teal-100 transition-colors">
                                                <User className="text-slate-400 group-hover:text-teal-500 transition-colors" size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-slate-900">{ref.patient_name}</h4>
                                                <div className="flex flex-wrap items-center gap-4 mt-1">
                                                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                                                        <Calendar size={12} /> {new Date(ref.patient_dob).toLocaleDateString()}
                                                    </span>
                                                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider line-clamp-1">
                                                        <ClipboardList size={12} /> {ref.diagnosis}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-12">
                                            <div className="text-right hidden md:block">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submitted On</p>
                                                <p className="text-sm font-bold text-slate-900">{new Date(ref.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <div className={`px-6 py-3 rounded-2xl border flex items-center gap-2 ${ref.status === 'Pending' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
                                                {ref.status === 'Pending' ? <Clock size={16} /> : <CheckCircle2 size={16} />}
                                                <span className="text-xs font-black uppercase tracking-widest">{ref.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderDashboard;
