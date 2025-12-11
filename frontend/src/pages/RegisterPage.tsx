import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
    website: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black overflow-hidden relative">
      
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 flex items-center justify-center min-h-screen py-20">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-20 items-start">
            
            {/* Left Side - Brand & Visual */}
            <div className="hidden lg:block space-y-8 sticky top-20">
                <Link to="/" className="text-4xl font-black tracking-tighter group inline-block">
                    <span className="text-white group-hover:text-cyan-400 transition-colors">PLENA</span>
                    <span className="text-white/50">.AI</span>
                </Link>
                
                <h1 className="text-5xl font-bold leading-tight">
                    Ekibinize güç katmaya <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">bugün başlayın.</span>
                </h1>
                
                <div className="space-y-4 pt-4">
                  {[
                    { icon: '🎁', title: '5 Ücretsiz Mülakat', desc: 'Hemen denemeniz için hediye.' },
                    { icon: '📊', title: 'Detaylı Analitik', desc: 'Aday performanslarını derinlemesine inceleyin.' },
                    { icon: '⚡', title: 'Hızlı Entegrasyon', desc: 'ATS sisteminizle saniyeler içinde bağlayın.' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                      <div className="text-2xl">{item.icon}</div>
                      <div>
                        <h3 className="font-bold text-white">{item.title}</h3>
                        <p className="text-sm text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
      
            {/* Right Side - Register Form */}
            <div className="w-full max-w-lg mx-auto bg-black/40 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl relative">
                {/* Mobile Brand */}
                <div className="lg:hidden text-center mb-8">
                    <Link to="/" className="text-3xl font-black tracking-tighter group inline-block">
                        <span className="text-white">PLENA</span>
                        <span className="text-white/50">.AI</span>
                    </Link>
                </div>

                <div className="text-center lg:text-left mb-8">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Hesap Oluştur</h2>
                    <p className="mt-2 text-slate-400 text-sm">Şirket bilgilerinizi girerek başlayın</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Email Adresi *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-purple-500 focus:outline-none transition-colors text-white placeholder:text-slate-600"
                                placeholder="ornek@sirket.com"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Şifre * (min 8 karakter)</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-purple-500 focus:outline-none transition-colors text-white placeholder:text-slate-600"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Ad Soyad *</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-purple-500 focus:outline-none transition-colors text-white placeholder:text-slate-600"
                                placeholder="Ad Soyad"
                            />
                        </div>

                        {/* Company Name */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Şirket Adı *</label>
                            <input
                                type="text"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-purple-500 focus:outline-none transition-colors text-white placeholder:text-slate-600"
                                placeholder="Şirket A.Ş."
                            />
                        </div>

                        {/* Website & Phone Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Website</label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-purple-500 focus:outline-none transition-colors text-white placeholder:text-slate-600"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Telefon</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-purple-500 focus:outline-none transition-colors text-white placeholder:text-slate-600"
                                    placeholder="+90..."
                                />
                            </div>
                        </div>
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
                        className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-purple-400 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(192,132,252,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? 'Kayıt Yapılıyor...' : 'KAYIT OL'}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-sm text-slate-500">
                            Zaten hesabınız var mı?{' '}
                            <Link to="/login" className="font-bold text-white hover:text-purple-400 transition-colors">
                                Giriş yapın
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
}
