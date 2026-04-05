import React, { useState } from 'react';
import { Hospital, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';

const ProviderLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [providerName, setProviderName] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0 });
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  React.useEffect(() => {
    if (success) {
      const fetchStats = async () => {
        setIsStatsLoading(true);
        const token = localStorage.getItem('olympia_token');
        try {
          const res = await fetch('/api/referrals/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setStats(data);
          }
        } catch (err) {
          console.error('Error fetching stats:', err);
        } finally {
          setIsStatsLoading(false);
        }
      };
      fetchStats();
    }
  }, [success]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const provider_id = e.target.provider_id.value;
    const password = e.target.password.value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_id, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store JWT
      localStorage.setItem('olympia_token', data.token);
      localStorage.setItem('olympia_provider', JSON.stringify(data.provider));
      setProviderName(data.provider.name);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-br from-teal-700 to-blue-900 z-0"></div>
        <div className="relative z-10 flex flex-col items-center w-full max-w-4xl mx-auto animate-fadeInUp">
          
          <div className="w-full mb-6">
            <button onClick={() => { setSuccess(false); localStorage.removeItem('provider_token'); }} className="inline-flex items-center gap-2 text-white hover:text-teal-200 transition-colors font-medium">
                <ArrowLeft size={18} /> Secure Sign Out
            </button>
          </div>

          <div className="bg-white w-full rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-100">
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {providerName}</h2>
                    <p className="text-gray-500">Olympia Auth: Authenticated Session Active</p>
                </div>
                <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 border-4 border-teal-100">
                    <User className="w-8 h-8 text-teal-600" />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100/50 shadow-sm">
                    <h3 className="text-lg font-bold text-indigo-900 mb-1">Total Referrals</h3>
                    <p className="text-3xl font-black text-indigo-600">
                        {isStatsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.total}
                    </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-100/50 shadow-sm">
                    <h3 className="text-lg font-bold text-teal-900 mb-1">Active Patients</h3>
                    <p className="text-3xl font-black text-teal-600">
                        {isStatsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.active}
                    </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100/50 shadow-sm">
                    <h3 className="text-lg font-bold text-orange-900 mb-1">Pending Orders</h3>
                    <p className="text-3xl font-black text-orange-600">
                        {isStatsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.pending}
                    </p>
                </div>
            </div>

            <div className="p-6 bg-blue-50/50 text-blue-900 rounded-xl border border-blue-100 flex flex-col md:flex-row items-center gap-6">
               <div className="flex-1">
                 <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                   <Lock className="w-5 h-5 text-blue-600" /> Secure Medical Portal Access
                 </h3>
                 <p className="text-blue-800/80 leading-relaxed text-sm">
                   Your account is authenticated and ready. You can now access your private dashboard to submit new patient referrals and track care history.
                 </p>
               </div>
               <a 
                href="/provider-dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap"
               >
                 Go to Dashboard
               </a>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-purple-900 to-indigo-900 z-0"></div>
      
      <div className="relative z-10 flex flex-col items-center">
          
        {/* Back to Home Link */}
        <div className="w-full max-w-md mb-6">
            <a href="/" className="inline-flex items-center gap-2 text-white hover:text-purple-200 transition-colors font-medium">
                <ArrowLeft size={18} /> Back to Olympia Home Health
            </a>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-10 px-6 shadow-2xl rounded-2xl sm:px-10 border border-gray-100">
                
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                        <Hospital className="w-8 h-8 text-purple-700" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Provider Portal</h2>
                    <p className="text-sm text-gray-500 mt-2">Secure EMR Access for Referring Partners</p>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="provider_id" className="block text-sm font-medium text-gray-700">
                            Provider ID / Username
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="provider_id"
                                name="provider_id"
                                type="text"
                                required
                                className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 border bg-gray-50"
                                placeholder="Enter your ID"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 border bg-gray-50"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium text-center border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Secure Sign In'}
                        </button>
                    </div>
                </form>
                
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">
                        This is a secure system. Unauthorized access is prohibited. <br/>
                        HIPAA Compliant EMR Portal.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderLogin;
