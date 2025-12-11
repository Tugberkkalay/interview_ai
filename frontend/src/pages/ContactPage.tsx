import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500 selection:text-black overflow-hidden relative">
      
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <header className="flex justify-between items-center mb-20">
           <Link to="/" className="text-2xl font-black tracking-tighter group">
             <span className="text-white group-hover:text-cyan-400 transition-colors">PLENA</span>
             <span className="text-white/50">.AI</span>
           </Link>
           <Link to="/" className="text-sm font-mono text-slate-400 hover:text-white transition-colors flex items-center gap-2">
             <span>←</span> GERİ DÖN
           </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            {/* Left Column: Info */}
            <div>
                <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
                    İLETİŞİME <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">GEÇİN</span>
                </h1>
                <p className="text-xl text-slate-400 mb-12 max-w-lg">
                    Sorularınız mı var? Ekibimiz size yardımcı olmak için burada. Bize ulaşın, en kısa sürede dönüş yapalım.
                </p>

                <div className="space-y-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400 border border-white/10">
                            ✉️
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg mb-1">E-posta</h3>
                            <p className="text-slate-400">hello@plena.ai</p>
                            <p className="text-slate-400">support@plena.ai</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-purple-400 border border-white/10">
                            📍
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg mb-1">Ofis</h3>
                            <p className="text-slate-400">Maslak Mah. Büyükdere Cad.</p>
                            <p className="text-slate-400">No: 123, Sarıyer/İstanbul</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-pink-400 border border-white/10">
                            📞
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg mb-1">Telefon</h3>
                            <p className="text-slate-400">+90 (212) 123 45 67</p>
                            <p className="text-slate-500 text-sm">Hafta içi 09:00 - 18:00</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Ad Soyad</label>
                        <input 
                            type="text" 
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            placeholder="Adınız Soyadınız"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">E-posta</label>
                        <input 
                            type="email" 
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            placeholder="ornek@sirket.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider">Mesajınız</label>
                        <textarea 
                            required
                            rows={4}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                            placeholder="Size nasıl yardımcı olabiliriz?"
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={status === 'sending' || status === 'success'}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
                            ${status === 'success' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-white text-black hover:bg-cyan-400'
                            }
                        `}
                    >
                        {status === 'idle' && 'GÖNDER'}
                        {status === 'sending' && 'GÖNDERİLİYOR...'}
                        {status === 'success' && 'MESAJ İLETİLDİ ✔'}
                    </button>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
};
