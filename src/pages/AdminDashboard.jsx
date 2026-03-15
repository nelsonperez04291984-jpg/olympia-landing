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
  Search
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [stats, setStats] = useState({
        provider_count: 0,
        referral_count: 0,
        recent_ai_logs: [],
        providers: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Admin login inputs
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('olympia_admin_token');
        if (token) {
            setIsLoggedIn(true);
            fetchStats(token);
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchStats = async (token) => {
        try {
            const res = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setStats(data);
            }
        } catch (err) {
            console.error("Stats fetch error:", err);
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
                setIsLoggedIn(true);
                fetchStats(data.token);
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
        setIsLoggedIn(false);
        navigate('/admin');
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
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 flex flex-col fixed h-full shadow-2xl z-20">
                <div className="p-8">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <ShieldCheck className="text-teal-400" /> Olympia Admin
                    </h2>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400 font-bold flex items-center gap-3">
                        <TrendingUp size={20} /> Dashboard Home
                    </div>
                    <div className="p-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-3">
                        <Users size={20} /> B2B Partner Portal
                    </div>
                    <div className="p-4 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl transition-all cursor-pointer flex items-center gap-3">
                        <MessageSquare size={20} /> AI Conversation Logs
                    </div>
                </nav>
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
                        <h1 className="text-4xl font-black text-slate-900">System Overview</h1>
                        <p className="text-slate-500 mt-1">Real-time platform metrics and audit logs.</p>
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

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                            <Users className="text-blue-600 w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Total Providers</p>
                            <h3 className="text-4xl font-black text-slate-900">{stats.provider_count}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                            <FileText className="text-teal-600 w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Total Referrals</p>
                            <h3 className="text-4xl font-black text-slate-900">{stats.referral_count}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
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
                            <button className="text-teal-600 font-bold text-sm hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-400 uppercase text-xs font-black tracking-widest">
                                    <tr>
                                        <th className="px-8 py-4">Name</th>
                                        <th className="px-8 py-4">Provider ID</th>
                                        <th className="px-8 py-4">Status</th>
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
                                                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase border border-green-100">Verified</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {stats.providers.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-8 py-12 text-center text-slate-400 font-medium font-italic">No providers found in database.</td>
                                        </tr>
                                    )}
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
                            {stats.recent_ai_logs.length === 0 && (
                                <div className="flex flex-col items-center justify-center p-12 text-center">
                                    <MessageSquare size={48} className="text-slate-100 mb-4" />
                                    <p className="text-slate-400 font-medium">No artificial intelligence interaction logs recorded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
