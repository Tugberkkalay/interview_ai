import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Clear error when location changes
    setError('');
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black overflow-hidden relative">
      
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-20 items-center">
            
            {/* Left Side - Brand & Visual */}
            <div className="hidden lg:block space-y-8">
                <Link to="/" className="text-4xl font-black tracking-tighter group inline-block">
                    <span className="text-white group-hover:text-cyan-400 transition-colors">PLENA</span>
                    <span className="text-white/50">.AI</span>
                </Link>
                
                <h1 className="text-5xl font-bold leading-tight">
                    Yetenekleri keşfetmenin <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">en akıllı yolu.</span>
                </h1>
                
                <p className="text-lg text-slate-400 max-w-md leading-relaxed">
                    Yapay zeka destekli mülakat platformumuz ile işe alım süreçlerinizi hızlandırın, en doğru adayları saniyeler içinde belirleyin.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="text-2xl mb-2">🚀</div>
                        <div className="font-bold text-white">Hızlı</div>
                        <div className="text-xs text-slate-400">Dakikalar içinde sonuç</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="text-2xl mb-2">🎯</div>
                        <div className="font-bold text-white">İsabetli</div>
                        <div className="text-xs text-slate-400">%95 üzeri başarı</div>
                    </div>
                </div>
            </div>
      
            {/* Right Side - Login Form */}
            <div className="w-full max-w-md mx-auto bg-black/40 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl relative">
                {/* Mobile Brand (Visible only on small screens) */}
                <div className="lg:hidden text-center mb-8">
                    <Link to="/" className="text-3xl font-black tracking-tighter group inline-block">
                        <span className="text-white">PLENA</span>
                        <span className="text-white/50">.AI</span>
                    </Link>
                </div>

                <div className="text-center lg:text-left mb-8">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Tekrar Hoşgeldiniz</h2>
                    <p className="mt-2 text-slate-400 text-sm">Hesabınıza giriş yaparak devam edin</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Email Adresi</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-cyan-500 focus:outline-none transition-colors text-white placeholder:text-slate-600"
                                placeholder="ornek@sirket.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Şifre</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-cyan-500 focus:outline-none transition-colors text-white placeholder:text-slate-600"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0" />
                            <span className="text-slate-400 group-hover:text-white transition-colors">Beni hatırla</span>
                        </label>
                        <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                            Şifremi unuttum?
                        </a>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-shake">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Giriş Yapılıyor...' : 'GİRİŞ YAP'}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-sm text-slate-500">
                            Hesabınız yok mu?{' '}
                            <Link to="/register" className="font-bold text-white hover:text-cyan-400 transition-colors">
                                Hemen kayıt olun
                            </Link>
                        </p>
                    </div>
                </form>

                {/* Decorative border gradient */}
                <div className="absolute inset-0 border border-white/5 rounded-3xl pointer-events-none"></div>
            </div>
        </div>
      </div>
    </div>
  );
}
