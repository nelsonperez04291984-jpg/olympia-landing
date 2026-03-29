import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  ShieldCheck, 
  LogOut, 
  TrendingUp, 
  Clock, 
  Activity,
  ArrowRight,
  Search,
  UserPlus,
  Lock,
  Mail,
  UserCircle,
  Trash2,
  AlertTriangle,
  X,
  ClipboardCheck,
  Package,
  CheckCircle,
  AlertCircle,
  Stethoscope
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DiagnosisAssessment from '../components/DiagnosisAssessment';

const AdminDashboard = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('admin');
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'users'
    const [stats, setStats] = useState({
        provider_count: 0,
        referral_count: 0,
        staff_count: 0,
        recent_ai_logs: [],
        providers: []
    });
    const [staffList, setStaffList] = useState([]);
    const [referrals, setReferrals] = useState([]);
    const [activeEpisode, setActiveEpisode] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleAssessAndCode = (referral) => {
        setActiveEpisode(referral);
        setActiveTab('clinical');
    };

    const handleSaveDiagnosis = (referralId, diagnosisData) => {
        // Update local state for immediate UI feedback
        setReferrals(prev => prev.map(r => 
            r.id === referralId 
                ? { 
                    ...r, 
                    status: 'Processing',
                    icd_primary: diagnosisData.primary,
                    icd_secondary: diagnosisData.secondary,
                    pdgm_weight: diagnosisData.weight
                  } 
                : r
        ));
        setActiveEpisode(null);
    };

    // Admin login inputs
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // User management state
    const [mgmtTab, setMgmtTab] = useState('provider'); // 'provider' or 'staff'
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'create'
    const [formData, setFormData] = useState({
        provider_id: '',
        name: '',
        email: '',
        password: '',
        username: '',
        role: 'admin'
    });
    const [mgmtStatus, setMgmtStatus] = useState({ type: '', message: '' });

    // Custom deletion modal state
    const [confirmDelete, setConfirmDelete] = useState({ show: false, type: '', id: null, name: '' });

    useEffect(() => {
        const token = localStorage.getItem('olympia_admin_token');
        const role = localStorage.getItem('olympia_admin_role');
        if (token) {
            setIsLoggedIn(true);
            setUserRole(role || 'admin');
            fetchDashboardData(token);
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchDashboardData = async (token) => {
        try {
            // Parallel fetch for stats, staff list, and referrals
            const [statsRes, staffRes, referralsRes] = await Promise.all([
                fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/staff', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/referrals', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }
            
            if (staffRes.ok) {
                const staffData = await staffRes.json();
                setStaffList(staffData);
            }

            if (referralsRes.ok) {
                const referralsData = await referralsRes.json();
                setReferrals(referralsData);
            }
        } catch (err) {
            console.error("Data fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('olympia_admin_token', data.token);
                localStorage.setItem('olympia_admin_role', data.role);
                setIsLoggedIn(true);
                setUserRole(data.role);
                fetchDashboardData(data.token);
            } else {
                setError(data.error || 'Invalid credentials');
                setIsLoading(false);
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('olympia_admin_token');
        localStorage.removeItem('olympia_admin_role');
        setIsLoggedIn(false);
        navigate('/admin');
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setMgmtStatus({ type: 'loading', message: 'Creating account...' });
        
        const endpoint = mgmtTab === 'provider' ? '/api/admin/providers' : '/api/admin/admins';
        const payload = mgmtTab === 'provider' 
            ? { provider_id: formData.provider_id, name: formData.name, email: formData.email, password: formData.password }
            : { username: formData.username, password: formData.password, role: formData.role };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('olympia_admin_token')}`
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                setMgmtStatus({ type: 'success', message: data.message });
                setFormData({ provider_id: '', name: '', email: '', password: '', username: '', role: 'admin' });
                fetchDashboardData(localStorage.getItem('olympia_admin_token'));
                setViewMode('list');
            } else {
                setMgmtStatus({ type: 'error', message: data.error || 'Creation failed' });
            }
        } catch (err) {
            setMgmtStatus({ type: 'error', message: 'Connection error' });
        }
    };

    const executeDelete = async () => {
        const { type, id } = confirmDelete;
        try {
            const res = await fetch(`/api/admin/${type === 'provider' ? 'providers' : 'admins'}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('olympia_admin_token')}` }
            });
            if (res.ok) {
                fetchDashboardData(localStorage.getItem('olympia_admin_token'));
                setConfirmDelete({ show: false, type: '', id: null, name: '' });
            } else {
                alert("Failed to delete account.");
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const handleUpdateReferralStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`/api/admin/referrals/${id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('olympia_admin_token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchDashboardData(localStorage.getItem('olympia_admin_token'));
            } else {
                alert("Failed to update status.");
            }
        } catch (err) {
            console.error("Update status error:", err);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
                
                <div className="max-w-md w-full relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/20 mb-4 border border-teal-500/30">
                            <ShieldCheck className="text-teal-400 w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-black text-white">Olympia Internal</h1>
                        <p className="text-slate-400 text-sm mt-2">Executive Administration Access</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Staff Username</label>
                            <input 
                                type="text" 
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                                placeholder="Enter username"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Access Pass</label>
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-medium">
                                {error}
                            </div>
                        )}
                        <button 
                            disabled={isLoading}
                            className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-4 rounded-xl shadow-lg shadow-teal-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Verifying Credentials...' : 'Sign In Audit Dashboard'}
                        </button>
                    </form>
                    <div className="mt-8 text-center border-t border-white/5 pt-6">
                        <Link to="/" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center justify-center gap-1">
                            Cancel and return to Public Site
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex relative">
            {/* Deletion Confirmation Modal */}
            {confirmDelete.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[32px] max-w-md w-full p-8 shadow-2xl border border-slate-100 animate-fadeInUp">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
                            <AlertTriangle className="text-red-500 w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Confirm Removal</h3>
                        <p className="text-slate-500 leading-relaxed mb-8">
                            Are you sure you want to permanently delete <span className="font-bold text-slate-900">"{confirmDelete.name}"</span>? 
                            This action will revoke all access immediately and cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setConfirmDelete({ show: false, type: '', id: null, name: '' })}
                                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black uppercase text-xs tracking-widest rounded-2xl transition-all"
                            >
                                Negative
                            </button>
                            <button 
                                onClick={executeDelete}
                                className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-red-500/30 transition-all"
                            >
                                Affirmative, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <div className="w-64 bg-slate-900 flex flex-col fixed h-full shadow-2xl z-20">
                <div className="p-8">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <ShieldCheck className="text-teal-400" /> Olympia Admin
                    </h2>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`w-full p-4 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'overview' ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <TrendingUp size={20} /> Dashboard Home
                    </button>
                    <button 
                         onClick={() => { setActiveTab('users'); setViewMode('list'); }}
                         className={`w-full p-4 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'users' ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <UserPlus size={20} /> User Maintenance
                    </button>
                    <button 
                        onClick={() => setActiveTab('referrals')}
                        className={`w-full p-4 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'referrals' ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <ClipboardCheck size={20} /> Referral Intake
                    </button>
                    <button 
                        onClick={() => setActiveTab('clinical')}
                        className={`w-full p-4 rounded-xl font-bold flex items-center gap-3 transition-all ${activeTab === 'clinical' ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <Stethoscope size={20} /> Clinical Tools
                    </button>
                    <div className="p-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-3">
                        <MessageSquare size={20} /> AI Conversation Logs
                    </div>
                </nav>
                <div className="p-8">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Signed in as</p>
                        <p className="text-xs text-white font-bold">{username}</p>
                        <div className="mt-2 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] text-teal-500 font-bold uppercase tracking-widest">{userRole}</span>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-white/5">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold"
                    >
                        <LogOut size={20} /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8">
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900">
                            {activeTab === 'overview' ? 'System Overview' : activeTab === 'referrals' ? 'Referral Intake' : activeTab === 'clinical' ? 'Clinical Tools' : 'User Maintenance'}
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {activeTab === 'overview' ? 'Real-time platform metrics and audit logs.' : activeTab === 'referrals' ? 'Review and approve incoming patient referrals.' : activeTab === 'clinical' ? 'AI-powered clinical coding and PDGM intelligence.' : 'Manage partner providers and internal staff accounts.'}
                        </p>
                    </div>
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 px-6 h-16">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Activity size={18} className="text-teal-500" />
                            <span className="text-sm font-bold uppercase tracking-wider">System Live</span>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div className="text-xs text-slate-400 font-medium">
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                </header>

                {activeTab === 'overview' ? (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-6 group hover:border-teal-200 transition-all cursor-default">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Users className="text-blue-600 w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Total Providers</p>
                                    <h3 className="text-4xl font-black text-slate-900">{stats.provider_count}</h3>
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-6 group hover:border-teal-200 transition-all cursor-default">
                                <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FileText className="text-teal-600 w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Total Referrals</p>
                                    <h3 className="text-4xl font-black text-slate-900">{stats.referral_count}</h3>
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-6 group hover:border-teal-200 transition-all cursor-default">
                                <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="text-orange-600 w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Staff Accounts</p>
                                    <h3 className="text-4xl font-black text-slate-900">{stats.staff_count}</h3>
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-6 group hover:border-teal-200 transition-all cursor-default">
                                <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <MessageSquare className="text-purple-600 w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">AI Logs Retained</p>
                                    <h3 className="text-4xl font-black text-slate-900">{stats.recent_ai_logs.length}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Providers Table */}
                            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                    <h3 className="text-xl font-black text-slate-900">Registered Providers</h3>
                                    <button onClick={() => { setActiveTab('users'); setViewMode('create'); }} className="text-teal-600 font-bold text-sm hover:underline">Add New</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-slate-400 uppercase text-xs font-black tracking-widest">
                                            <tr>
                                                <th className="px-8 py-4">Name</th>
                                                <th className="px-8 py-4">Provider ID</th>
                                                <th className="px-8 py-4">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {stats.providers.map((p, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <p className="font-bold text-slate-900">{p.name}</p>
                                                        <p className="text-xs text-slate-400">{p.email}</p>
                                                    </td>
                                                    <td className="px-8 py-5 text-slate-500 font-mono text-sm">{p.provider_id}</td>
                                                    <td className="px-8 py-5">
                                                        <button 
                                                            onClick={() => setConfirmDelete({ show: true, type: 'provider', id: p.id, name: p.name })}
                                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                            title="Delete Provider"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* AI Logs */}
                            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col">
                                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                    <h3 className="text-xl font-black text-slate-900">Recent AI Interactions</h3>
                                    <button className="text-teal-600 font-bold text-sm hover:underline">Full Log</button>
                                </div>
                                <div className="flex-1 p-8 overflow-y-auto max-h-[500px] space-y-6">
                                    {stats.recent_ai_logs.map((log, i) => (
                                        <div key={i} className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                                    <Users size={14} className="text-slate-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-black text-slate-900 uppercase">User Query</p>
                                                    <p className="text-sm text-slate-500 font-medium italic">"{log.user_query}"</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                                                    <Activity size={14} className="text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-black text-teal-600 uppercase tracking-widest">Assistant Response</p>
                                                    <p className="text-sm text-slate-700 leading-relaxed font-medium line-clamp-3">{log.ai_response}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'referrals' ? (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Intake Queue</h3>
                                    <p className="text-slate-500">Processing incoming patient referrals from medical partners.</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div> {referrals.filter(r => r.status === 'Pending').length} PENDING
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-100/50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                                        <tr>
                                            <th className="px-8 py-4">Patient Details</th>
                                            <th className="px-8 py-4">Clinical Info</th>
                                            <th className="px-8 py-4">Referring Provider</th>
                                            <th className="px-8 py-4">Status & Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {referrals.map((r, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <p className="font-bold text-slate-900 text-lg">{r.patient_name}</p>
                                                    <div className="flex flex-col gap-1 mt-1">
                                                        <span className="text-xs text-slate-500 flex items-center gap-1.5"><Clock size={12} /> DOB: {r.patient_dob}</span>
                                                        <span className="text-xs text-slate-500 flex items-center gap-1.5"><Mail size={12} /> {r.patient_phone || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-xs font-black text-slate-400 uppercase mb-1">Diagnosis</p>
                                                    <p className="text-sm text-slate-700 font-medium line-clamp-2">{r.diagnosis}</p>
                                                    <p className="text-xs font-black text-slate-400 uppercase mt-3 mb-1">Services Needed</p>
                                                    <p className="text-xs text-slate-600 bg-slate-100 p-2 rounded-lg">{r.services_needed}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="font-bold text-slate-900">{r.provider_name}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">Verified Partner</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-3">
                                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-sm ${
                                                            r.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                                            r.status === 'Processing' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                            r.status === 'Admitted' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {r.status}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            {r.status === 'Pending' && (
                                                                <button 
                                                                    onClick={() => handleUpdateReferralStatus(r.id, 'Processing')}
                                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                                    title="Mark as Processing"
                                                                >
                                                                    <Activity size={16} />
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => handleAssessAndCode(r)}
                                                                className="p-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors"
                                                                title="Assess & Code Diagnosis"
                                                            >
                                                                <Stethoscope size={16} />
                                                            </button>
                                                            {r.status === 'Processing' && (
                                                                <button 
                                                                    onClick={() => handleUpdateReferralStatus(r.id, 'Admitted')}
                                                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                                    title="Accept & Admit"
                                                                >
                                                                    <CheckCircle size={16} />
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => handleUpdateReferralStatus(r.id, 'Rejected')}
                                                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                                title="Reject Referral"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                        {r.icd_primary && (
                                                            <div className="flex items-center gap-1.5 text-[9px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-1 rounded-md border border-teal-100 mt-1">
                                                                <ShieldCheck size={10} /> ICD CODES ASSIGNED
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {referrals.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-16 text-center">
                                                    <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                    <p className="text-slate-400 italic">No referrals in the queue yet.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'clinical' ? (
                    <div className="animate-fadeIn">
                        {!activeEpisode ? (
                            <div className="max-w-6xl mx-auto space-y-8">
                                <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden text-center p-20">
                                    <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <Stethoscope className="text-teal-600 w-12 h-12" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Clinical Episode Directory</h3>
                                    <p className="text-slate-500 max-w-md mx-auto mb-12">Search or select a patient referral below to begin the clinical assessment and PDGM coding process.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                                        {referrals.filter(r => r.status !== 'Rejected').map((r, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => setActiveEpisode(r)}
                                                className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] hover:border-teal-500 hover:bg-white hover:shadow-xl transition-all group group-hover:scale-[1.02]"
                                            >
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-black text-xs uppercase group-hover:bg-teal-500 group-hover:text-white transition-colors">
                                                        {r.patient_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 uppercase text-xs tracking-tight">{r.patient_name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">DOB: {r.patient_dob}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                                    <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Open Episode</span>
                                                    <ArrowRight size={14} className="text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between max-w-[1400px] mx-auto mb-4 px-2">
                                    <button 
                                        onClick={() => setActiveEpisode(null)}
                                        className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                                    >
                                        <X size={14} /> Close Active Episode
                                    </button>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-teal-600 bg-teal-50 px-4 py-2 rounded-full border border-teal-100 uppercase tracking-widest animate-pulse">
                                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div> Case Locks in 48h
                                    </div>
                                </div>
                                <DiagnosisAssessment 
                                    referralData={activeEpisode} 
                                    onSave={(data) => handleSaveDiagnosis(activeEpisode.id, data)}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="max-w-6xl bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-fadeIn">
                        <div className="flex border-b border-slate-100 bg-slate-50/30 p-2">
                             <button 
                                onClick={() => { setMgmtTab('provider'); setViewMode('list'); setMgmtStatus({type:'', message:''}); }}
                                className={`flex-1 py-4 px-6 rounded-3xl font-black uppercase text-xs tracking-widest transition-all ${mgmtTab === 'provider' ? 'bg-white text-teal-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                             >
                                <Users size={16} className="inline mr-2" /> Partner Providers
                             </button>
                             <button 
                                onClick={() => { setMgmtTab('staff'); setViewMode('list'); setMgmtStatus({type:'', message:''}); }}
                                className={`flex-1 py-4 px-6 rounded-3xl font-black uppercase text-xs tracking-widest transition-all ${mgmtTab === 'staff' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                             >
                                <Lock size={16} className="inline mr-2" /> Internal Staff
                             </button>
                        </div>
                        
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">
                                        {mgmtTab === 'provider' ? 'Medical Partners' : 'Internal Staff Access'}
                                    </h3>
                                    <p className="text-slate-500">Manage and audit existing accounts.</p>
                                </div>
                                <button 
                                    onClick={() => setViewMode(viewMode === 'list' ? 'create' : 'list')}
                                    className={`px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    {viewMode === 'list' ? <><UserPlus size={16} /> Create New</> : <><ArrowRight size={16} className="rotate-180" /> Back to List</>}
                                </button>
                            </div>

                            {viewMode === 'list' ? (
                                <div className="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-100/50 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                                            <tr>
                                                <th className="px-8 py-4">{mgmtTab === 'provider' ? 'Entity Name' : 'Username'}</th>
                                                <th className="px-8 py-4">{mgmtTab === 'provider' ? 'Direct ID' : 'Tier'}</th>
                                                <th className="px-8 py-4">Created</th>
                                                <th className="px-8 py-4">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {(mgmtTab === 'provider' ? stats.providers : staffList).map((item, i) => (
                                                <tr key={i} className="hover:bg-white/50 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <p className="font-bold text-slate-900">{mgmtTab === 'provider' ? item.name : item.username}</p>
                                                        <p className="text-xs text-slate-400">{item.email || (item.role === 'superadmin' ? 'Executive Access' : 'Standard Admin')}</p>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${mgmtTab === 'provider' ? 'bg-teal-50 border-teal-100 text-teal-600' : (item.role === 'superadmin' ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-blue-50 border-blue-100 text-blue-600')}`}>
                                                            {mgmtTab === 'provider' ? item.provider_id : item.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-slate-400 text-xs font-medium">
                                                        {new Date(item.created_at || Date.now()).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <button 
                                                            onClick={() => setConfirmDelete({ show: true, type: mgmtTab, id: item.id, name: mgmtTab === 'provider' ? item.name : item.username })}
                                                            className="flex items-center gap-2 text-slate-400 hover:text-red-500 font-bold text-xs uppercase transition-colors"
                                                            disabled={item.username === 'admin'} // Cannot delete self
                                                        >
                                                            <Trash2 size={16} /> 
                                                            {item.username === 'admin' ? 'System Owner' : 'Delete'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(mgmtTab === 'provider' ? stats.providers : staffList).length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="px-8 py-12 text-center text-slate-400 italic font-medium">No results found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <form onSubmit={handleCreateAccount} className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-12 rounded-3xl border border-slate-100">
                                    {mgmtTab === 'provider' ? (
                                        <>
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Hospital/Doctor Name</label>
                                                <div className="relative">
                                                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input 
                                                        type="text" required
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                        className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                                        placeholder="e.g. Dr. Robert Moore"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Professional ID (NPI)</label>
                                                <input 
                                                    type="text" required
                                                    value={formData.provider_id}
                                                    onChange={(e) => setFormData({...formData, provider_id: e.target.value})}
                                                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                                    placeholder="e.g. NPI-12345"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Secure Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input 
                                                        type="email" required
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                        className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                                        placeholder="partner@clinic.com"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Staff Username</label>
                                                <div className="relative">
                                                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                    <input 
                                                        type="text" required
                                                        value={formData.username}
                                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                                        className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                        placeholder="e.g. j.doe_admin"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Permission Tier</label>
                                                <select 
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none font-bold"
                                                >
                                                    <option value="admin">Employee Admin</option>
                                                    <option value="superadmin">Super Executive Admin</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Assign Initial Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input 
                                                type="password" required
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 pt-4">
                                        {mgmtStatus.message && (
                                            <div className={`mb-6 p-4 rounded-2xl text-sm font-bold border ${mgmtStatus.type === 'success' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                                {mgmtStatus.message}
                                            </div>
                                        )}
                                        <button 
                                            type="submit"
                                            className={`w-full py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl transition-all active:scale-[0.98] ${mgmtTab === 'provider' ? 'bg-teal-500 hover:bg-teal-400 text-white shadow-teal-500/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            Deploy New {mgmtTab === 'provider' ? 'Provider Portal' : 'Staff Account'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
