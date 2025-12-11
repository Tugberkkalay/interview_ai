import React, { useState } from 'react';
import { InterviewSession } from '../components/InterviewSession';
import { InterviewConfiguration } from '../components/InterviewConfiguration';
import { InterviewReport } from '../components/InterviewReport';
import { InterviewStatus, AvatarId, InterviewReport as InterviewReportType } from '../types';

export const TryInterviewPage: React.FC = () => {
  const [sessionStatus, setSessionStatus] = useState<InterviewStatus>(InterviewStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Configuration State
  const [jobPosition, setJobPosition] = useState("Frontend Developer");
  const [companyName, setCompanyName] = useState("");
  const [companyInfo, setCompanyInfo] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [candidateResume, setCandidateResume] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>('female');
  
  const [report, setReport] = useState<InterviewReportType | null>(null);

  const handleStartInterview = (config: {
    jobPosition: string;
    companyName: string;
    companyInfo: string;
    jobDescription: string;
    candidateResume: string;
    selectedAvatar: AvatarId;
  }) => {
    setJobPosition(config.jobPosition);
    setCompanyName(config.companyName);
    setCompanyInfo(config.companyInfo);
    setJobDescription(config.jobDescription);
    setCandidateResume(config.candidateResume);
    setSelectedAvatar(config.selectedAvatar);
    setSessionStatus(InterviewStatus.ACTIVE);
    setErrorMsg(null);
    setReport(null);
  };

  const endInterview = (generatedReport?: InterviewReportType) => {
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

      <header className="fixed top-0 left-0 right-0 p-6 z-50 flex items-center justify-end pointer-events-none">
        {sessionStatus === InterviewStatus.ACTIVE && (
            <div className="px-4 py-1.5 bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-full flex items-center gap-2 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]"></div>
                <span className="text-xs font-bold text-red-400 tracking-wider">CANLI YAYIN</span>
            </div>
        )}
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20 md:p-8">
        
        {/* === LANDING / IDLE SCREEN (CONFIGURATION) === */}
        {sessionStatus === InterviewStatus.IDLE && (
          <InterviewConfiguration 
            onStart={handleStartInterview}
            onError={handleError}
          />
        )}

        {/* === ACTIVE SESSION === */}
        {sessionStatus === InterviewStatus.ACTIVE && (
             <InterviewSession 
                onEnd={endInterview} 
                onError={handleError}
                jobPosition={jobPosition}
                companyName={companyName}
                companyInfo={companyInfo}
                jobDescription={jobDescription}
                candidateResume={candidateResume}
                avatarId={selectedAvatar}
             />
        )}

        {/* === REPORT DASHBOARD (ENDED) === */}
        {sessionStatus === InterviewStatus.ENDED && report && (
            <InterviewReport 
                report={report}
                jobPosition={jobPosition}
                companyName={companyName}
                onReset={reset}
            />
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
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
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
};

