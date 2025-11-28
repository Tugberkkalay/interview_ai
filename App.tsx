import React, { useState } from 'react';
import { InterviewSession } from './components/InterviewSession';
import { InterviewStatus, AvatarId, InterviewReport } from './types';

// Simple SVG Radar Chart Component
const RadarChart = ({ data }: { data: { label: string; value: number }[] }) => {
    const size = 200;
    const center = size / 2;
    const radius = size / 2 - 20;
    const angleSlice = (Math.PI * 2) / data.length;

    const getCoordinates = (value: number, index: number) => {
        const angle = index * angleSlice - Math.PI / 2;
        const r = (value / 100) * radius;
        return [center + Math.cos(angle) * r, center + Math.sin(angle) * r];
    };

    const points = data.map((d, i) => getCoordinates(d.value, i).join(',')).join(' ');

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} className="overflow-visible">
                {/* Background Web */}
                {[25, 50, 75, 100].map(level => (
                    <polygon 
                        key={level} 
                        points={data.map((_, i) => getCoordinates(level, i).join(',')).join(' ')} 
                        fill="none" 
                        stroke="#334155" 
                        strokeWidth="1" 
                    />
                ))}
                {/* Axes */}
                {data.map((_, i) => {
                    const [x, y] = getCoordinates(100, i);
                    return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#334155" strokeWidth="1" />;
                })}
                {/* Data Polygon */}
                <polygon points={points} fill="rgba(59, 130, 246, 0.5)" stroke="#3b82f6" strokeWidth="2" />
                {/* Labels */}
                {data.map((d, i) => {
                    const [x, y] = getCoordinates(115, i);
                    return (
                        <text 
                            key={i} 
                            x={x} 
                            y={y} 
                            textAnchor="middle" 
                            alignmentBaseline="middle" 
                            fill="#94a3b8" 
                            fontSize="10"
                            className="font-bold uppercase"
                        >
                            {d.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};

const ScoreCard = ({ title, score }: { title: string, score: number }) => (
    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-slate-900 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                    style={{ width: `${score}%` }}
                ></div>
            </div>
            <span className="text-white font-bold">{score}</span>
        </div>
    </div>
);

function App() {
  const [sessionStatus, setSessionStatus] = useState<InterviewStatus>(InterviewStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Settings State
  const [jobPosition, setJobPosition] = useState("Frontend Developer");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>('female');
  const [report, setReport] = useState<InterviewReport | null>(null);

  const startInterview = () => {
    // @ts-ignore - process.env is injected via Vite
    if (!process.env.API_KEY) {
        setErrorMsg("API Anahtarı bulunamadı. Lütfen Cloudflare veya .env dosyasını kontrol edin.");
        return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg("Tarayıcınız medya cihazlarını desteklemiyor. Lütfen Chrome veya Edge kullanın.");
        return;
    }
    if(!jobPosition.trim()) {
        setErrorMsg("Lütfen bir pozisyon giriniz.");
        return;
    }
    setSessionStatus(InterviewStatus.ACTIVE);
    setErrorMsg(null);
    setReport(null);
  };

  const endInterview = (generatedReport?: InterviewReport) => {
    if(generatedReport) {
        setReport(generatedReport);
        setSessionStatus(InterviewStatus.ENDED);
    } else {
        setSessionStatus(InterviewStatus.ENDED);
    }
  };

  const handleError = (msg: string) => {
      setErrorMsg(msg);
      setSessionStatus(InterviewStatus.ERROR);
  };

  const reset = () => {
      setSessionStatus(InterviewStatus.IDLE);
      setErrorMsg(null);
      setReport(null);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* --- BACKGROUND ANIMATION LAYER --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
          
          {/* Floating Blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px] animate-blob mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen"></div>
          <div className="absolute top-[20%] left-[40%] w-[30vw] h-[30vw] bg-pink-600/10 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-screen"></div>
      </div>

      <header className="fixed top-0 left-0 right-0 p-6 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3 backdrop-blur-md bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-lg">
             <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
                <span className="relative z-10">AI</span>
                <div className="absolute inset-0 rounded-full bg-blue-500 blur-sm opacity-50 animate-pulse"></div>
             </div>
             <span className="font-bold text-lg tracking-tight text-white/90">Video Mülakat</span>
        </div>
        {sessionStatus === InterviewStatus.ACTIVE && (
            <div className="px-4 py-1.5 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-full flex items-center gap-2 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]"></div>
                <span className="text-xs font-bold text-red-400 tracking-wider">CANLI YAYIN</span>
            </div>
        )}
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 md:px-12 py-20">
        
        {/* === LANDING / IDLE SCREEN === */}
        {sessionStatus === InterviewStatus.IDLE && (
          <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-20 items-center">
            
            {/* Left: Hero Text */}
            <div className="md:col-span-7 flex flex-col gap-8 animate-fade-in-up">
                 <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                    Yeni Nesil YZ Teknolojisi
                 </div>
                 
                 <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.9]">
                    Kariyerini <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                        Simüle Et.
                    </span>
                 </h1>
                 
                 <p className="text-lg md:text-xl text-slate-400 max-w-2xl font-light leading-relaxed">
                    En son nesil yapay zeka teknolojisiyle güçlendirilmiş, gerçek zamanlı duygusal ve teknik analiz yapan gelişmiş sistem ile mülakat provası yapın. Geleceğe hazırlanın.
                 </p>

                 {/* Stats / Trust Badges */}
                 <div className="flex gap-8 pt-4 border-t border-white/5">
                    <div>
                        <div className="text-3xl font-bold text-white font-mono">Sınırsız</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Pratik İmkanı</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white font-mono">360°</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Yetenek Röntgeni</div>
                    </div>
                 </div>
            </div>

            {/* Right: Interactive Config Card */}
            <div className="md:col-span-5 w-full animate-fade-in-up delay-100">
                <div className="relative group">
                    {/* Glowing background behind form */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    
                    <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <span>Mülakat Konfigürasyonu</span>
                        </h2>

                        <div className="space-y-6">
                            {/* Input Group */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Hedef Pozisyon</label>
                                <div className="relative group/input">
                                    <input 
                                        type="text" 
                                        value={jobPosition}
                                        onChange={(e) => setJobPosition(e.target.value)}
                                        placeholder="Örn: Senior Frontend Developer"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-blue-400 transition-colors">
                                        💼
                                    </div>
                                </div>
                            </div>

                            {/* Avatar Selection Grid */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Uzman Seçimi</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Zeynep Card */}
                                    <button 
                                        onClick={() => setSelectedAvatar('female')}
                                        className={`relative p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden group/card ${
                                            selectedAvatar === 'female' 
                                            ? 'border-pink-500/50 bg-pink-500/10 shadow-[0_0_20px_rgba(236,72,153,0.15)]' 
                                            : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg transition-transform duration-500 group-hover/card:scale-110 ${selectedAvatar === 'female' ? 'bg-gradient-to-br from-pink-500 to-rose-600' : 'bg-slate-800 grayscale'}`}>
                                            👩‍💼
                                        </div>
                                        <div className="text-center relative z-10">
                                            <div className={`font-bold transition-colors ${selectedAvatar === 'female' ? 'text-pink-200' : 'text-slate-300'}`}>Zeynep</div>
                                            <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">İK & Sosyal Beceriler</div>
                                        </div>
                                        {/* Selection Indicator */}
                                        {selectedAvatar === 'female' && (
                                            <div className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_8px_#ec4899]"></div>
                                        )}
                                    </button>

                                    {/* Mert Card */}
                                    <button 
                                        onClick={() => setSelectedAvatar('male')}
                                        className={`relative p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-3 overflow-hidden group/card ${
                                            selectedAvatar === 'male' 
                                            ? 'border-blue-500/50 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                                            : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg transition-transform duration-500 group-hover/card:scale-110 ${selectedAvatar === 'male' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' : 'bg-slate-800 grayscale'}`}>
                                            👨‍💼
                                        </div>
                                        <div className="text-center relative z-10">
                                            <div className={`font-bold transition-colors ${selectedAvatar === 'male' ? 'text-blue-200' : 'text-slate-300'}`}>Mert</div>
                                            <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">Teknik Lider</div>
                                        </div>
                                        {selectedAvatar === 'male' && (
                                            <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]"></div>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={startInterview}
                                className="relative w-full py-4 mt-2 bg-white text-black font-bold text-lg rounded-xl overflow-hidden group/btn hover:scale-[1.02] transition-transform duration-300 shadow-xl"
                            >
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                                <span className="relative flex items-center justify-center gap-3 group-hover/btn:text-white transition-colors duration-300">
                                    Simülasyonu Başlat
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
                
                {errorMsg && (
                    <div className="mt-6 text-center animate-fade-in">
                        <span className="inline-block px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-medium">
                            ⚠️ {errorMsg}
                        </span>
                    </div>
                 )}
            </div>
          </div>
        )}

        {/* === ACTIVE SESSION === */}
        {sessionStatus === InterviewStatus.ACTIVE && (
             <div className="w-full max-w-6xl animate-scale-in">
                 <InterviewSession 
                    onEnd={endInterview} 
                    onError={handleError}
                    jobPosition={jobPosition}
                    avatarId={selectedAvatar}
                 />
             </div>
        )}

        {/* === REPORT DASHBOARD (ENDED) === */}
        {sessionStatus === InterviewStatus.ENDED && report && (
            <div className="w-full max-w-6xl animate-fade-in space-y-6 z-20">
                
                {/* Header: Identity Card */}
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-blue-600/10 blur-[100px] rounded-full"></div>
                    
                    <div className="relative group z-10">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${report.overallScore >= 80 ? 'border-green-500' : report.overallScore >= 60 ? 'border-yellow-500' : 'border-red-500'} bg-black shadow-2xl transition-transform transform group-hover:scale-105`}>
                            <span className="text-5xl font-black text-white">{report.overallScore}</span>
                        </div>
                        <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg uppercase tracking-wider border border-white/10">
                            Skor
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left z-10">
                        <h2 className="text-4xl font-black text-white tracking-tight">{report.candidateName}</h2>
                        <p className="text-slate-400 text-xl mb-4 font-light">{jobPosition}</p>
                        <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide border backdrop-blur-md ${
                            report.hiringRecommendation === 'Strong Hire' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                            report.hiringRecommendation === 'Hire' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                            report.hiringRecommendation === 'Maybe' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                            'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                            KARAR: {report.hiringRecommendation.toUpperCase()}
                        </div>
                    </div>
                    <div className="w-full md:w-auto flex justify-center p-6 bg-black/40 rounded-2xl border border-white/5 z-10">
                         <RadarChart data={[
                             { label: 'Teknik', value: report.categoryScores.technical },
                             { label: 'İletişim', value: report.categoryScores.communication },
                             { label: 'Problem', value: report.categoryScores.problemSolving },
                             { label: 'Kültür', value: report.categoryScores.culturalFit },
                             { label: 'Özgüven', value: report.categoryScores.confidence },
                         ]} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Stats & Breakdown */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
                            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-3">
                                <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">📊</span> Performans Metrikleri
                            </h3>
                            <div className="space-y-4">
                                <ScoreCard title="Teknik Yeterlilik" score={report.categoryScores.technical} />
                                <ScoreCard title="İletişim Becerisi" score={report.categoryScores.communication} />
                                <ScoreCard title="Problem Çözme" score={report.categoryScores.problemSolving} />
                                <ScoreCard title="Kültürel Uyum" score={report.categoryScores.culturalFit} />
                                <ScoreCard title="Özgüven" score={report.categoryScores.confidence} />
                            </div>
                        </div>

                        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
                             <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-3">
                                <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">⚡</span> SWOT Analizi
                            </h3>
                            <div className="mb-6">
                                <span className="text-green-400 font-bold text-[10px] uppercase tracking-widest block mb-3 opacity-80">Güçlü Yönler</span>
                                <ul className="space-y-2">
                                    {report.keyStrengths.map((s, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5">
                                            <span className="text-green-500 font-bold mt-0.5">✓</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <span className="text-red-400 font-bold text-[10px] uppercase tracking-widest block mb-3 opacity-80">Gelişim Alanları</span>
                                <ul className="space-y-2">
                                    {report.areasForImprovement.map((s, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5">
                                            <span className="text-red-500 font-bold mt-0.5">!</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column: Narrative Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 h-full shadow-lg flex flex-col">
                            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-3">
                                <span className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">📝</span> Yönetici Özeti
                            </h3>
                            <div className="bg-black/40 p-6 rounded-xl border border-white/5 mb-6 flex-grow">
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base font-light">
                                    {report.summary}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Visual Analysis Card */}
                                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                                        <span className="opacity-70">👁️</span> Görsel Analiz
                                    </h4>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Kıyafet & Görünüm</span>
                                            <span className="text-slate-200">{report.visualAnalysis.attire}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Ortam</span>
                                            <span className="text-slate-200">{report.visualAnalysis.environment}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Vücut Dili</span>
                                            <span className="text-slate-200">{report.visualAnalysis.bodyLanguage}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Behavioral Analysis Card */}
                                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                                        <span className="opacity-70">🧠</span> Davranışsal Analiz
                                    </h4>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Reaksiyon Hızı</span>
                                            <span className="text-slate-200">{report.behavioralAnalysis.reactionSpeed}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Stres Yönetimi</span>
                                            <span className="text-slate-200">{report.behavioralAnalysis.stressManagement}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Ses Tonu</span>
                                            <span className="text-slate-200">{report.behavioralAnalysis.toneOfVoice}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center pt-8 pb-8">
                     <button 
                        onClick={reset}
                        className="group relative px-10 py-4 bg-white text-black rounded-full font-bold shadow-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden"
                     >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        <span className="relative flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            Yeni Simülasyon Başlat
                        </span>
                     </button>
                </div>
            </div>
        )}

        {/* === LOADING / ERROR STATE === */}
        {((sessionStatus === InterviewStatus.ENDED && !report) || sessionStatus === InterviewStatus.ERROR) && (
             <div className="max-w-md w-full p-8 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl text-center animate-fade-in z-20">
                 <div className="w-20 h-20 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-6 relative">
                    {sessionStatus === InterviewStatus.ERROR ? (
                        <div className="text-red-500 animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                    ) : (
                        <>
                            <div className="absolute inset-0 rounded-full border-4 border-blue-500/30"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
                            <span className="text-2xl">🤖</span>
                        </>
                    )}
                 </div>
                 
                 <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                     {sessionStatus === InterviewStatus.ERROR ? 'Sistem Hatası' : (
                         sessionStatus === InterviewStatus.ENDED && !report ? 'Veri İşlenemedi' : 'Analiz Tamamlanıyor'
                     )}
                 </h2>
                 
                 <p className="text-slate-400 mb-8 font-light leading-relaxed">
                     {sessionStatus === InterviewStatus.ERROR 
                        ? (errorMsg || "Bağlantı beklenmedik şekilde kesildi.") 
                        : (sessionStatus === InterviewStatus.ENDED && !report)
                            ? "Mülakat raporu oluşturulamadan bağlantı sonlandı."
                            : `${selectedAvatar === 'female' ? 'Zeynep' : 'Mert'} şu anda performans metriklerini hesaplıyor ve raporunuzu hazırlıyor.`
                     }
                 </p>
                 
                 {(sessionStatus === InterviewStatus.ERROR || (sessionStatus === InterviewStatus.ENDED && !report)) && (
                    <button 
                        onClick={reset}
                        className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/5 hover:border-white/20 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2"
                    >
                        <span>Ana Ekrana Dön</span>
                    </button>
                 )}
             </div>
        )}

      </main>

      {/* Custom Styles for Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        
        .animate-scale-in {
            animation: scaleIn 0.5s ease-out forwards;
        }
        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default App;