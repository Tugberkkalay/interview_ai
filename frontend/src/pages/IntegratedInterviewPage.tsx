import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InterviewSession } from '../components/InterviewSession';
import { InterviewStatus, InterviewReport as InterviewReportType } from '../types';
import { 
  fetchInterviewData, 
  submitInterviewReport, 
  fetchInterviewDataMock, 
  submitInterviewReportMock, 
  InterviewData 
} from '../services/api';

// Toggle between mock and real API
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export const IntegratedInterviewPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loadingState, setLoadingState] = useState<'loading' | 'ready' | 'error' | 'completed'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [sessionStatus, setSessionStatus] = useState<InterviewStatus>(InterviewStatus.IDLE);

  // Fetch interview data on mount
  useEffect(() => {
    const loadInterviewData = async () => {
      if (!token) {
        setErrorMsg('Geçersiz mülakat linki. Token bulunamadı.');
        setLoadingState('error');
        return;
      }

      try {
        setLoadingState('loading');
        // Use mock or real API based on environment
        const fetchFn = USE_MOCK_API ? fetchInterviewDataMock : fetchInterviewData;
        const data = await fetchFn(token);
        setInterviewData(data);
        setLoadingState('ready');
        setSessionStatus(InterviewStatus.IDLE);
      } catch (error) {
        console.error('Failed to load interview data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Mülakat verileri yüklenirken bir hata oluştu.';
        setErrorMsg(errorMessage);
        setLoadingState('error');
      }
    };

    loadInterviewData();
  }, [token]);

  const handleInterviewEnd = async (generatedReport?: InterviewReportType) => {
    if (!generatedReport || !token) {
      setErrorMsg('Rapor oluşturulamadı.');
      setLoadingState('error');
      return;
    }

    try {
      // Submit report to backend (mock or real)
      const submitFn = USE_MOCK_API ? submitInterviewReportMock : submitInterviewReport;
      await submitFn(token, generatedReport);
      setLoadingState('completed');
    } catch (error) {
      console.error('Failed to submit report:', error);
      setErrorMsg('Rapor gönderilirken bir hata oluştu.');
      setLoadingState('error');
    }
  };

  const handleError = (msg: string) => {
    setErrorMsg(msg);
    setLoadingState('error');
  };

  // Loading state
  if (loadingState === 'loading') {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl font-semibold text-white">Mülakat verileri yükleniyor...</p>
          <p className="text-sm text-slate-400">Lütfen bekleyin</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadingState === 'error') {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl text-center">
          <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Hata Oluştu</h2>
          <p className="text-slate-400 mb-8">{errorMsg}</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-3.5 bg-white/10 hover:bg-white/20 border border-white/5 hover:border-white/20 text-white rounded-xl transition-all font-medium"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  // Completed state
  if (loadingState === 'completed') {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">Tebrikler!</h2>
            <p className="text-slate-400 mb-2">Mülakat tamamlandı ve raporunuz başarıyla gönderildi.</p>
            <p className="text-sm text-slate-500">Sonuçlar hakkında bilgilendirme yapılacaktır.</p>
          </div>
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Rapor İletildi
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ready state - Show interview session
  if (!interviewData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* Background Animation */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
          
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
        <InterviewSession 
          onEnd={handleInterviewEnd} 
          onError={handleError}
          jobPosition={interviewData.jobPosition}
          companyName={interviewData.companyName}
          companyInfo={interviewData.companyInfo}
          jobDescription={interviewData.jobDescription}
          candidateResume={interviewData.candidateResume}
          avatarId={interviewData.avatarId}
          companyLogo={interviewData.companyLogo}
          companyKnowledge={interviewData.companyKnowledge}
        />
      </main>

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
      `}</style>
    </div>
  );
};

