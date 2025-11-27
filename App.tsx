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
    if(generatedReport) setReport(generatedReport);
    setSessionStatus(InterviewStatus.ENDED);
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
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      <header className="fixed top-0 left-0 right-0 p-6 z-50 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/50">
                AI
             </div>
             <span className="font-bold text-xl tracking-tight text-white/90">Video Mülakat</span>
        </div>
        {sessionStatus === InterviewStatus.ACTIVE && (
            <div className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full flex items-center gap-2 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-xs font-semibold text-red-200">CANLI</span>
            </div>
        )}
      </header>

      <main className="flex flex-col items-center justify-center min-h-screen pt-16 px-4 pb-12">
        
        {/* IDLE SCREEN - SETUP */}
        {sessionStatus === InterviewStatus.IDLE && (
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            {/* Left: Settings */}
            <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 shadow-2xl flex flex-col justify-center">
                 <h1 className="text-3xl font-bold text-white mb-2">Mülakatı Başlat</h1>
                 <p className="text-slate-400 mb-6">Pozisyonunuzu ve mülakatı yapacak uzmanı seçin.</p>

                 <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Pozisyon</label>
                        <input 
                            type="text" 
                            value={jobPosition}
                            onChange={(e) => setJobPosition(e.target.value)}
                            placeholder="Örn: Pazarlama Uzmanı"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">Mülakat Uzmanı</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setSelectedAvatar('female')}
                                className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 group ${
                                    selectedAvatar === 'female' 
                                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
                                    : 'border-slate-700 bg-slate-800 hover:bg-slate-750'
                                }`}
                            >
                                <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center text-2xl border border-pink-500/30">
                                    👩‍💼
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-white">Zeynep</div>
                                    <div className="text-xs text-slate-400">İletişim & HR</div>
                                </div>
                                {selectedAvatar === 'female' && <div className="absolute top-2 right-2 text-blue-500">✔</div>}
                            </button>

                            <button 
                                onClick={() => setSelectedAvatar('male')}
                                className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 group ${
                                    selectedAvatar === 'male' 
                                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
                                    : 'border-slate-700 bg-slate-800 hover:bg-slate-750'
                                }`}
                            >
                                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl border border-blue-500/30">
                                    👨‍💼
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-white">Mert</div>
                                    <div className="text-xs text-slate-400">Teknik & Analiz</div>
                                </div>
                                {selectedAvatar === 'male' && <div className="absolute top-2 right-2 text-blue-500">✔</div>}
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={startInterview}
                        className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group"
                    >
                        <span>Başlat</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                 </div>
                 {errorMsg && (
                    <div className="mt-4 text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-lg border border-red-500/20">{errorMsg}</div>
                 )}
            </div>

            {/* Right: Info / Visual */}
            <div className="hidden md:flex flex-col justify-center items-center text-center space-y-6 opacity-80">
                <div className="w-64 h-64 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full flex items-center justify-center relative animate-pulse-slow">
                     <div className="absolute inset-0 rounded-full border border-white/5"></div>
                     <span className="text-6xl filter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                        {selectedAvatar === 'female' ? '👩‍💼' : '👨‍💼'}
                     </span>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-white">Yapay Zeka Destekli Mülakat</h3>
                    <p className="text-slate-400 max-w-xs mx-auto mt-2 text-sm leading-relaxed">
                        Gerçek zamanlı ses analizi, duygu analizi ve profesyonel yetkinlik değerlendirmesi ile mülakat provası yapın.
                    </p>
                </div>
            </div>
          </div>
        )}

        {/* ACTIVE SESSION */}
        {sessionStatus === InterviewStatus.ACTIVE && (
             <InterviewSession 
                onEnd={endInterview} 
                onError={handleError}
                jobPosition={jobPosition}
                avatarId={selectedAvatar}
             />
        )}

        {/* REPORT DASHBOARD (ENDED) */}
        {sessionStatus === InterviewStatus.ENDED && report && (
            <div className="w-full max-w-6xl animate-fade-in space-y-6">
                
                {/* Header: Identity Card */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${report.overallScore >= 80 ? 'border-green-500' : report.overallScore >= 60 ? 'border-yellow-500' : 'border-red-500'} bg-slate-900 shadow-xl transition-transform transform group-hover:scale-105`}>
                            <span className="text-4xl font-bold text-white">{report.overallScore}</span>
                        </div>
                        <div className="absolute -bottom-3 -right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-wider">
                            Puan
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-white">{report.candidateName}</h2>
                        <p className="text-slate-400 text-lg mb-2">{jobPosition} Adayı</p>
                        <div className={`inline-block px-4 py-2 rounded-lg font-bold text-sm tracking-wide border ${
                            report.hiringRecommendation === 'Strong Hire' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                            report.hiringRecommendation === 'Hire' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                            report.hiringRecommendation === 'Maybe' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                            'bg-red-500/20 text-red-400 border-red-500/50'
                        }`}>
                            KARAR: {report.hiringRecommendation.toUpperCase()}
                        </div>
                    </div>
                    <div className="w-full md:w-auto flex justify-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
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
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                                <span className="text-blue-400">📊</span> Performans Metrikleri
                            </h3>
                            <div className="space-y-3">
                                <ScoreCard title="Teknik Yeterlilik" score={report.categoryScores.technical} />
                                <ScoreCard title="İletişim Becerisi" score={report.categoryScores.communication} />
                                <ScoreCard title="Problem Çözme" score={report.categoryScores.problemSolving} />
                                <ScoreCard title="Kültürel Uyum" score={report.categoryScores.culturalFit} />
                                <ScoreCard title="Özgüven" score={report.categoryScores.confidence} />
                            </div>
                        </div>

                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                             <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                                <span className="text-purple-400">⚡</span> SWOT Analizi
                            </h3>
                            <div className="mb-6">
                                <span className="text-green-400 font-bold text-xs uppercase tracking-wider block mb-2">Güçlü Yönler</span>
                                <ul className="space-y-2">
                                    {report.keyStrengths.map((s, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-700/30 p-2 rounded">
                                            <span className="text-green-500 font-bold">✓</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <span className="text-red-400 font-bold text-xs uppercase tracking-wider block mb-2">Gelişim Alanları</span>
                                <ul className="space-y-2">
                                    {report.areasForImprovement.map((s, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-700/30 p-2 rounded">
                                            <span className="text-red-500 font-bold">!</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column: Narrative Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-full shadow-lg flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
                                <span className="text-yellow-400">📝</span> Yönetici Özeti
                            </h3>
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 mb-6 flex-grow">
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                                    {report.summary}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Visual Analysis Card */}
                                <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-4 rounded-lg border border-slate-600/50">
                                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                        <span>👁️</span> Görsel Analiz
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 text-xs uppercase font-bold">Kıyafet & Görünüm</span>
                                            <span className="text-slate-200">{report.visualAnalysis.attire}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 text-xs uppercase font-bold">Ortam</span>
                                            <span className="text-slate-200">{report.visualAnalysis.environment}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 text-xs uppercase font-bold">Vücut Dili</span>
                                            <span className="text-slate-200">{report.visualAnalysis.bodyLanguage}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Behavioral Analysis Card */}
                                <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-4 rounded-lg border border-slate-600/50">
                                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                        <span>🧠</span> Davranışsal Analiz
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 text-xs uppercase font-bold">Reaksiyon Hızı</span>
                                            <span className="text-slate-200">{report.behavioralAnalysis.reactionSpeed}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 text-xs uppercase font-bold">Stres Yönetimi</span>
                                            <span className="text-slate-200">{report.behavioralAnalysis.stressManagement}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 text-xs uppercase font-bold">Ses Tonu</span>
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 flex items-center gap-2"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Yeni Mülakat Başlat
                     </button>
                </div>
            </div>
        )}

        {/* ERROR / ENDED WITHOUT REPORT */}
        {(sessionStatus === InterviewStatus.ENDED && !report || sessionStatus === InterviewStatus.ERROR) && (
             <div className="max-w-md w-full p-8 bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl text-center animate-fade-in">
                 <div className="w-16 h-16 mx-auto bg-slate-700 rounded-full flex items-center justify-center mb-4">
                    {sessionStatus === InterviewStatus.ERROR ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ) : (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    )}
                 </div>
                 
                 <h2 className="text-2xl font-bold text-white mb-2">
                     {sessionStatus === InterviewStatus.ERROR ? 'Bir Hata Oluştu' : 'Analiz Hazırlanıyor...'}
                 </h2>
                 
                 <p className="text-slate-400 mb-6">
                     {sessionStatus === InterviewStatus.ERROR 
                        ? (errorMsg || "Bağlantı kesildi.") 
                        : "Zeynep mülakat notlarını derliyor ve performans raporunu oluşturuyor. Lütfen bekleyin."}
                 </p>
                 
                 {sessionStatus === InterviewStatus.ERROR && (
                    <button 
                        onClick={reset}
                        className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                    >
                        Tekrar Dene
                    </button>
                 )}
             </div>
        )}

      </main>
    </div>
  );
}

export default App;