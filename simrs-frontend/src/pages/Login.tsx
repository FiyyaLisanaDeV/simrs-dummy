import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, User, ChevronRight, ShieldCheck } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        throw new Error('Login Gagal. Periksa kredensial Anda.');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Ke dashboard
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan pada server');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#004d40]/10 to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#004d40]/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 shadow-2xl shadow-[#004d40]/10 rounded-3xl p-8 z-10 overflow-hidden">
        {/* Top green accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#004d40] to-emerald-400"></div>

        <div className="text-center mb-10 mt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#004d40]/5 border border-[#004d40]/10 mb-4 shadow-sm">
            <Activity className="w-8 h-8 text-[#004d40]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">SIMRS Terpadu</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Sistem Informasi Manajemen Rumah Sakit</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <User className="w-5 h-5 text-slate-400 group-focus-within:text-[#004d40] transition-colors" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] block pl-12 p-3.5 transition-all outline-none"
                placeholder="ID Pengguna (NIP/NIK)"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-[#004d40] transition-colors" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] block pl-12 p-3.5 transition-all outline-none"
                placeholder="Kata Sandi"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full text-white bg-[#004d40] hover:bg-[#00332a] focus:ring-4 focus:outline-none focus:ring-[#004d40]/30 font-bold rounded-xl text-sm px-5 py-3.5 text-center transition-all shadow-md flex justify-center items-center gap-2 group mt-2"
          >
            Masuk ke Sistem
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Terkoneksi dengan Database SIMRS Dummy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
