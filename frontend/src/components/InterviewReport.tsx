import React from 'react';
import { InterviewReport as InterviewReportType } from '../types';

interface InterviewReportProps {
  report: InterviewReportType;
  jobPosition: string;
  companyName: string;
  onReset: () => void;
}

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

export const InterviewReport: React.FC<InterviewReportProps> = ({ report, jobPosition, companyName, onReset }) => {
    return (
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
                    <p className="text-slate-400 text-xl mb-4 font-light">{jobPosition} {companyName && <span className="text-slate-500">at {companyName}</span>}</p>
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

            {/* Transcript Section */}
            {report.transcript && report.transcript.length > 0 && (
                <div className="w-full bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">💬</span> Görüşme Kaydı
                    </h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {report.transcript.map((item, index) => (
                            <div key={index} className={`flex ${item.role === 'Aday' || item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl ${
                                    item.role === 'Aday' || item.role === 'user'
                                        ? 'bg-blue-600/20 border border-blue-500/30 text-blue-50 rounded-tr-none' 
                                        : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none'
                                }`}>
                                    <div className="text-[10px] font-bold opacity-60 mb-1 uppercase tracking-wider">
                                        {item.role === 'Aday' || item.role === 'user' ? 'Aday' : 'Mülakat Uzmanı'}
                                    </div>
                                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {item.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-center pt-8 pb-8">
                 <button 
                    onClick={onReset}
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
    );
};

