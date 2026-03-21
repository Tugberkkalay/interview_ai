import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteAssistantButton } from '../components/SiteAssistantButton';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden">

      {/* === GLOBAL BACKGROUND === */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Retro Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] animate-grid-flow"></div>

        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>

        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10">

        {/* === HEADER === */}
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#020617]/80 backdrop-blur-md border-b border-white/5 py-4' : 'py-8'}`}>
          <div className="container mx-auto px-6 flex justify-between items-center">
            <Link to="/" className="text-2xl font-black tracking-tighter group">
              <span className="text-white group-hover:text-cyan-400 transition-colors">COGNIVIA</span>
              <span className="text-white/50">Interview</span>
            </Link>

            <nav className="flex items-center gap-6">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-2 bg-white text-black hover:bg-cyan-400 font-bold rounded-none skew-x-[-10deg] transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                >
                  <span className="block skew-x-[10deg]">DASHBOARD</span>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="hidden md:block text-sm font-mono text-slate-400 hover:text-white transition-colors">
                    // GİRİŞ
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2 border border-white/20 hover:border-cyan-400 hover:bg-cyan-400/10 text-white font-mono text-sm rounded-none transition-all"
                  >
                    KAYIT_OL_
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>

        {/* === HERO SECTION (100vh) === */}
        <section className="h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden">

          {/* Main Title - Bottom of Hero */}
          <div className="absolute bottom-0 left-0 w-full text-center pointer-events-none select-none z-0 overflow-hidden leading-none">
            <h1 className="text-[13vw] font-black text-white/[0.02] tracking-tighter translate-y-[20%] whitespace-nowrap">
              FUTURE HIRING
            </h1>
          </div>

          <div className="relative z-20 flex flex-col items-center gap-12">

            {/* THE BUTTON */}
            <div className="scale-125 md:scale-150 relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] rounded-full animate-pulse-slow"></div>
              <SiteAssistantButton />
            </div>

            <div className="text-center space-y-4 max-w-lg px-4 mt-8 animate-fade-in-up">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Mülakatın <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Geleceği</span>
              </h2>
              <p className="text-slate-400 font-light">
                Yapay zeka asistanımızla konuşmaya başlayın ve işe alım sürecinizi saniyeler içinde dijitalleştirin.
              </p>
            </div>

          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
            <span className="text-[10px] font-mono tracking-widest uppercase">Keşfet</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-cyan-400 to-transparent"></div>
          </div>
        </section>


        {/* === ACTION BAR === */}
        <section className="py-12 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-white">Denemeye Hazır mısın?</h3>
                <p className="text-sm text-slate-400">İlk mülakat simülasyonunu hemen oluştur.</p>
              </div>
              <div className="flex gap-4">
                <Link
                  to="/try"
                  className="group relative px-8 py-3 bg-white text-black font-bold hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] overflow-hidden"
                >
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
                  <span className="relative z-10">ÜCRETSİZ DENE</span>
                </Link>
                <a
                  href="#features"
                  className="px-8 py-3 border border-white/20 hover:border-white text-white font-mono text-sm transition-all"
                >
                  ÖZELLİKLERİ_İNCELE
                </a>
              </div>
            </div>
          </div>
        </section>


        {/* === BENTO GRID FEATURES === */}
        <section id="features" className="py-32 container mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
              TEKNOLOJİ <span className="text-white/20">&</span> ZEKA
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Sıradan formları unutun. COGNIVIA, adaylarınızı ses, görüntü ve duygu analizi ile değerlendiren yeni nesil bir platformdur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">

            {/* 1. REAL-TIME AI (Large) */}
            <div className="group md:col-span-2 relative bg-[#0a0f1e] border border-white/10 rounded-3xl p-8 overflow-hidden hover:border-purple-500/50 transition-all duration-500 h-[400px]">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 transition-opacity">
                <div className="w-24 h-24 rounded-full border border-purple-500/30 flex items-center justify-center animate-spin-slow">
                  <div className="w-20 h-20 rounded-full border border-dashed border-cyan-500/30"></div>
                </div>
              </div>

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="inline-block px-3 py-1 mb-4 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-mono">
                    GEMINI 2.0 FLASH
                  </div>
                  <h3 className="text-3xl font-bold mb-2">Gerçek Zamanlı Etkileşim</h3>
                  <p className="text-slate-400 max-w-md">
                    Sadece soru soran değil, adayı dinleyen, anlayan ve dinamik olarak tepki veren bir yapay zeka. Gecikmesiz, insan doğallığında mülakat deneyimi.
                  </p>
                </div>

                {/* Audio Wave Animation */}
                <div className="mt-8 flex gap-2 items-end h-24 opacity-50 group-hover:opacity-100 transition-opacity">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-full bg-gradient-to-t from-purple-500 to-cyan-400 rounded-t-sm animate-pulse"
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. ANALYTICS (Vertical) */}
            <div className="group relative bg-[#0a0f1e] border border-white/10 rounded-3xl p-8 overflow-hidden hover:border-cyan-500/50 transition-all duration-500 h-[400px]">
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-400 text-xl">
                    📊
                  </div>
                  <span className="text-xs font-mono text-slate-500">REPORT_V1.0</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Derin Analitik</h3>
                <p className="text-slate-400 text-sm mb-6">Teknik, kültürel ve davranışsal skorlama.</p>

                {/* Animated Bars */}
                <div className="flex-1 flex flex-col justify-end space-y-4">
                  {[
                    { label: 'Teknik', score: 92, color: 'bg-cyan-500' },
                    { label: 'İletişim', score: 88, color: 'bg-purple-500' },
                    { label: 'Problem Çözme', score: 95, color: 'bg-green-500' },
                    { label: 'Kültürel Uyum', score: 85, color: 'bg-yellow-500' }
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{item.label}</span>
                        <span className="text-white">{item.score}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} w-0 group-hover:w-[${item.score}%] transition-all duration-1000 ease-out`}
                          style={{ width: '0%', transitionDelay: `${i * 100}ms` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. PERSONALIZED ASSISTANT (Square) */}
            <div className="group relative bg-[#0a0f1e] border border-white/10 rounded-3xl p-8 overflow-hidden hover:border-yellow-500/50 transition-all duration-500 h-[300px]">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all"></div>

              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3 text-white">Kişiselleştirilmiş Asistan</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Şirketinizin vizyonunu, kültürünü ve yan haklarını bilen bir asistan. Adayın sorularını (maaş, ofis ortamı, yemek vb.) sizin adınıza yanıtlar.
                </p>

                <div className="bg-black/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs text-slate-300 font-mono">ASİSTAN YANITI:</span>
                  </div>
                  <p className="text-xs text-slate-500 italic">
                    "Evet, haftada 2 gün uzaktan çalışma imkanı ve özel sağlık sigortası yan haklarımız arasında..."
                  </p>
                </div>
              </div>
            </div>

            {/* 4. CV & JOB MATCHING (Horizontal Span) */}
            <div className="group md:col-span-2 relative bg-[#0a0f1e] border border-white/10 rounded-3xl p-8 overflow-hidden hover:border-pink-500/50 transition-all duration-500 h-[300px]">
              <div className="flex flex-col md:flex-row gap-8 h-full">
                <div className="flex-1 z-10">
                  <div className="inline-block px-3 py-1 mb-4 bg-pink-500/10 border border-pink-500/20 rounded-full text-pink-400 text-xs font-mono">
                    SMART MATCHING
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Akıllı Eşleşme</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Yüklenen CV ile iş ilanını saniyeler içinde analiz eder. Adayın deneyimi ile pozisyonun gerekliliklerini (hard & soft skills) karşılaştırır ve mülakatı buna göre şekillendirir.
                  </p>
                </div>

                <div className="flex-1 relative flex items-center justify-center">
                  {/* Visual Animation */}
                  <div className="relative w-full h-32 bg-black/40 rounded-xl border border-white/5 p-4 flex items-center justify-between gap-4">
                    <div className="w-16 h-20 bg-slate-800 rounded-lg flex flex-col gap-2 p-2 animate-pulse">
                      <div className="w-8 h-1 bg-slate-600 rounded"></div>
                      <div className="w-10 h-1 bg-slate-600 rounded"></div>
                      <div className="w-6 h-1 bg-slate-600 rounded"></div>
                    </div>
                    <div className="flex-1 h-[1px] bg-slate-700 relative overflow-hidden">
                      <div className="absolute inset-0 bg-pink-500 w-1/2 animate-progress-bar"></div>
                    </div>
                    <div className="w-16 h-20 bg-slate-800 rounded-lg border border-pink-500/50 flex flex-col items-center justify-center">
                      <span className="text-pink-400 font-bold text-xl">%98</span>
                      <span className="text-[8px] text-slate-500">UYUM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. EASY INTEGRATION (Square) */}
            <div className="group relative bg-[#0a0f1e] border border-white/10 rounded-3xl p-8 overflow-hidden hover:border-green-500/50 transition-all duration-500 h-[300px]">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-green-400 transition-colors">Kolay Entegrasyon</h3>
                  <p className="text-slate-400 text-sm">Mevcut ATS ve İK sistemlerinizle %100 uyumlu API yapısı. Dakikalar içinde kurulum.</p>
                </div>

                <div className="font-mono text-xs text-slate-500 bg-black/50 p-4 rounded-lg border border-white/5 mt-4">
                  <div className="flex gap-2 mb-1">
                    <span className="text-purple-400">const</span>
                    <span className="text-white">interview</span>
                    <span className="text-slate-400">=</span>
                  </div>
                  <div className="flex gap-2 pl-4">
                    <span className="text-purple-400">await</span>
                    <span className="text-green-400">Cognivia</span>
                    <span className="text-slate-400">.</span>
                    <span className="text-yellow-300">createSession</span>
                    <span className="text-slate-400">({'{'}</span>
                  </div>
                  <div className="pl-8 text-slate-400">candidateId: "123"</div>
                  <div className="text-slate-400">{'}'});</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,255,147,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
            </div>

            {/* 6. COMPREHENSIVE REPORT (Large - Bottom) */}
            <div className="group md:col-span-2 relative bg-[#0a0f1e] border border-white/10 rounded-3xl p-8 overflow-hidden hover:border-blue-500/50 transition-all duration-500 h-[300px]">
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center h-full">
                <div className="flex-1">
                  <div className="inline-block px-3 py-1 mb-4 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-mono">
                    DETAILED INSIGHTS
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Kapsamlı Raporlama</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    Mülakat biter bitmez detaylı raporunuz hazır. Transkript, davranışsal analiz, güçlü yönler, gelişim alanları ve işe alım tavsiyesi tek bir ekranda.
                  </p>
                  <ul className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Ses Analizi
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Görüntü Analizi
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Kod İnceleme
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Kültürel Uyum
                    </li>
                  </ul>
                </div>

                {/* Report Preview */}
                <div className="flex-1 w-full h-full bg-black/40 rounded-xl border border-white/5 p-4 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white">ADAY RAPORU</span>
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded">STRONG HIRE</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-2 bg-slate-800 rounded w-1/2"></div>
                    <div className="h-20 bg-slate-800/50 rounded border border-dashed border-white/10 mt-4 flex items-center justify-center text-xs text-slate-600">
                      AI ANALYZING...
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* === PRICING SECTION === */}
        <section id="pricing" className="py-20 relative border-t border-white/5 bg-black/20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                Esnek <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Kredi Paketleri</span>
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Aylık taahhüt yok, sadece ihtiyacınız kadar kredi alın. 1 Kredi = 1 Mülakat.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">

              {/* PACK 1: FREE TRIAL */}
              <div className="p-8 rounded-2xl border border-white/10 bg-[#0a0f1e] hover:border-white/20 transition-all flex flex-col">
                <div className="mb-4">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">DENEME</span>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">Ücretsiz</span>
                  <span className="text-slate-500 text-sm block mt-1">Tek seferlik</span>
                </div>
                <div className="text-center py-6 bg-white/5 rounded-lg mb-6">
                  <span className="text-3xl font-black text-white">5</span>
                  <span className="text-xs block text-slate-400 font-mono">KREDİ HEDİYE</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-400 mb-8 flex-1">
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Tüm Özellikler Açık</li>
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Detaylı Raporlama</li>
                  <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Süresiz Kullanım</li>
                </ul>
                <Link to="/register" className="block w-full text-center py-3 border border-white/20 rounded-lg text-white text-sm font-bold hover:bg-white/5 transition-all">
                  Hemen Başla
                </Link>
              </div>

              {/* PACK 2: STARTER */}
              <div className="p-8 rounded-2xl border border-white/10 bg-[#0a0f1e] hover:border-cyan-500/30 transition-all flex flex-col">
                <div className="mb-4">
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">STARTER</span>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">₺1.500</span>
                  <span className="text-slate-500 text-sm block mt-1">KDV Dahil</span>
                </div>
                <div className="text-center py-6 bg-cyan-500/10 border border-cyan-500/20 rounded-lg mb-6">
                  <span className="text-3xl font-black text-cyan-400">20</span>
                  <span className="text-xs block text-cyan-300/70 font-mono">KREDİ</span>
                  <span className="text-[10px] text-slate-500 mt-1">75₺ / Mülakat</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-400 mb-8 flex-1">
                  <li className="flex items-center gap-2"><span className="text-cyan-400">✓</span> Acil İhtiyaçlar İçin</li>
                  <li className="flex items-center gap-2"><span className="text-cyan-400">✓</span> Hızlı Aktivasyon</li>
                  <li className="flex items-center gap-2"><span className="text-cyan-400">✓</span> E-posta Desteği</li>
                </ul>
                <Link to="/contact" className="block w-full text-center py-3 bg-cyan-950 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-black rounded-lg text-sm font-bold transition-all">
                  İletişime Geç
                </Link>
              </div>

              {/* PACK 3: GROWTH (POPULAR) */}
              <div className="p-8 rounded-2xl border border-purple-500/50 bg-[#0a0f1e] relative overflow-hidden flex flex-col group hover:border-purple-500 transition-all shadow-[0_0_40px_rgba(168,85,247,0.15)]">
                <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">EN POPÜLER</div>
                <div className="mb-4">
                  <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">GROWTH</span>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">₺5.000</span>
                  <span className="text-slate-500 text-sm block mt-1">KDV Dahil</span>
                </div>
                <div className="text-center py-6 bg-purple-500/10 border border-purple-500/20 rounded-lg mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-purple-500/10 animate-pulse"></div>
                  <span className="relative z-10 text-4xl font-black text-purple-400">100</span>
                  <span className="relative z-10 text-xs block text-purple-300/70 font-mono">KREDİ</span>
                  <span className="relative z-10 text-[10px] text-purple-200 mt-1 font-bold bg-purple-500/30 px-2 py-0.5 rounded-full inline-block">50₺ / Mülakat (En İyi Fiyat)</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-400 mb-8 flex-1">
                  <li className="flex items-center gap-2"><span className="text-purple-400">✓</span> Düzenli Alımlar İçin</li>
                  <li className="flex items-center gap-2"><span className="text-purple-400">✓</span> %33 Tasarruf</li>
                  <li className="flex items-center gap-2"><span className="text-purple-400">✓</span> Öncelikli Destek</li>
                </ul>
                <Link to="/contact" className="block w-full text-center py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-purple-900/40">
                  İletişime Geç
                </Link>
              </div>

              {/* PACK 4: ENTERPRISE */}
              <div className="p-8 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 to-black flex flex-col">
                <div className="mb-4">
                  <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Enterprise</span>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">Özel</span>
                  <span className="text-slate-500 text-sm block mt-1">Teklif Alın</span>
                </div>
                <div className="text-center py-6 bg-white/5 rounded-lg mb-6">
                  <span className="text-2xl font-black text-white">∞</span>
                  <span className="text-xs block text-slate-400 font-mono">SINIRSIZ / YÜKSEK HACİM</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-400 mb-8 flex-1">
                  <li className="flex items-center gap-2"><span className="text-white">✓</span> Özel Entegrasyonlar</li>
                  <li className="flex items-center gap-2"><span className="text-white">✓</span> Kendi Sunucunuzda Kurulum</li>
                  <li className="flex items-center gap-2"><span className="text-white">✓</span> SLA & 7/24 Destek</li>
                  <li className="flex items-center gap-2"><span className="text-white">✓</span> Özel AI Model Eğitimi</li>
                </ul>
                <Link to="/contact" className="block w-full text-center py-3 bg-white text-black rounded-lg text-sm font-bold hover:bg-slate-200 transition-all">
                  İletişime Geç
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* === CTA BANNER === */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617] to-indigo-950/20"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="bg-gradient-to-r from-cyan-900/40 via-purple-900/40 to-cyan-900/40 border border-white/10 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden group">

              {/* Animated Background Shapes */}
              <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-50%] right-[-20%] w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
              </div>

              <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-6 relative z-10">
                GELECEĞİ <span className="text-white/20">BEKLEME</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 relative z-10">
                İşe alım sürecinizi yapay zeka ile dönüştürmeye bugün başlayın. İlk 5 mülakat bizden hediye.
              </p>

              <div className="flex flex-col md:flex-row gap-4 justify-center relative z-10">
                <Link
                  to="/register"
                  className="group relative px-10 py-4 bg-white text-black font-bold text-lg rounded-full hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] overflow-hidden"
                >
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine" />
                  <span className="relative z-10">HEMEN BAŞLA</span>
                </Link>
                <Link
                  to="/contact"
                  className="px-10 py-4 border border-white/20 bg-black/20 backdrop-blur-sm text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all"
                >
                  İLETİŞİME GEÇ
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* === FOOTER === */}
        <footer className="border-t border-white/10 bg-[#020617] pt-20 pb-10 relative z-10">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2">
                <Link to="/" className="text-3xl font-black tracking-tighter mb-6 block">
                  Cognivia<span className="text-white/50">Interview</span>
                </Link>
                <p className="text-slate-400 max-w-sm mb-8">
                  Yapay zeka destekli mülakat ve analiz platformu. İşe alımın geleceği burada.
                </p>
                <div className="flex gap-4">
                  {/* Social Icons */}
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white hover:text-black transition-all">𝕏</a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white hover:text-black transition-all">in</a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white hover:text-black transition-all">GH</a>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-6">Ürün</h4>
                <ul className="space-y-4 text-sm text-slate-400">
                  <li><a href="#features" className="hover:text-cyan-400 transition-colors">Özellikler</a></li>
                  <li><a href="#pricing" className="hover:text-cyan-400 transition-colors">Fiyatlandırma</a></li>
                  <li><Link to="/login" className="hover:text-cyan-400 transition-colors">Giriş Yap</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-6">Şirket</h4>
                <ul className="space-y-4 text-sm text-slate-400">
                  <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">İletişim</Link></li>
                  <li><Link to="/privacy" className="hover:text-cyan-400 transition-colors">Gizlilik Politikası</Link></li>
                  <li><Link to="/terms" className="hover:text-cyan-400 transition-colors">Kullanım Koşulları</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-600 text-sm">
                © 2026 Cognivia A.Ş. Tüm hakları saklıdır.
              </p>
              <div className="flex gap-6 text-sm text-slate-600">
                <a href="https://www.biscozum.com.tr/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
                  <span>Bir</span>
                  <span className="font-bold text-white">BİS Çözüm</span>
                  <span>Ürünüdür</span>
                </a>
              </div>
            </div>

            {/* Big Background Text */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full text-center overflow-hidden pointer-events-none opacity-20">
              <h2 className="text-[18vw] leading-none font-black text-white/5 select-none translate-y-[20%]">
                Cognivia
              </h2>
            </div>
          </div>
        </footer>

      </div>

      {/* === CUSTOM STYLES === */}
      <style>{`
        html {
          scroll-behavior: smooth;
        }
        @keyframes shine {
            100% {
                left: 125%;
            }
        }
        .animate-shine {
            animation: shine 1s;
        }
        @keyframes grid-flow {
          0% { background-position: 0 0; }
          100% { background-position: 4rem 4rem; }
        }
        .animate-grid-flow {
          animation: grid-flow 20s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin 15s linear infinite reverse;
        }
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-progress-bar {
          animation: progress 2s ease-in-out infinite;
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .group:hover .w-\\[85\\%\\] {
           width: 85% !important;
        }
        .group:hover .w-\\[92\\%\\] { width: 92% !important; }
        .group:hover .w-\\[88\\%\\] { width: 88% !important; }
        .group:hover .w-\\[95\\%\\] { width: 95% !important; }
        .group:hover .w-\\[85\\%\\] { width: 85% !important; }
      `}</style>
    </div>
  );
};
