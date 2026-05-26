import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, User, ChevronRight } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-dark/30 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Glassmorphism Card */}
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 z-10 overflow-hidden">
        {/* Subtle top reflection */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark shadow-lg shadow-primary/30 mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SIMRS Web</h1>
          <p className="text-slate-300 mt-2 text-sm font-medium">Sistem Informasi Manajemen Rumah Sakit</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <User className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 text-white text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent block pl-11 p-3.5 transition-all backdrop-blur-sm"
                placeholder="ID Pengguna"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 text-white text-sm rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent block pl-11 p-3.5 transition-all backdrop-blur-sm"
                placeholder="Kata Sandi"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary focus:ring-4 focus:outline-none focus:ring-primary/50 font-semibold rounded-xl text-sm px-5 py-4 text-center transition-all shadow-lg hover:shadow-primary/40 flex justify-center items-center gap-2 group"
          >
            Masuk ke Sistem
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Terhubung dengan Database SIMRS Dummy (SIK)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
