import React, { useState } from 'react';
import { AvatarId } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

import { KnowledgeItem } from '../services/api';
import sampleConfigs from '../data/sampleConfigs.json';

interface InterviewConfigurationProps {
  onStart: (config: {
    jobPosition: string;
    companyName: string;
    companyInfo: string;
    jobDescription: string;
    candidateResume: string;
    selectedAvatar: AvatarId;
    companyKnowledge?: KnowledgeItem[];
  }) => void;
  onError: (msg: string) => void;
}

export const InterviewConfiguration: React.FC<InterviewConfigurationProps> = ({ onStart, onError }) => {
  // Settings State
  const [jobPosition, setJobPosition] = useState("Frontend Developer");
  const [companyName, setCompanyName] = useState("");
  const [companyInfo, setCompanyInfo] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [candidateResume, setCandidateResume] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>('female');
  const [companyKnowledgeJson, setCompanyKnowledgeJson] = useState("");
  
  // Parsing State
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validation: Check if all required fields are filled
  const isFormValid = () => {
    return (
      jobPosition.trim() !== '' &&
      jobDescription.trim() !== '' &&
      candidateResume.trim() !== ''
    );
  };

  const startInterview = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg("Tarayıcınız medya cihazlarını desteklemiyor. Lütfen Chrome veya Edge kullanın.");
        onError("Tarayıcınız medya cihazlarını desteklemiyor. Lütfen Chrome veya Edge kullanın.");
        return;
    }
    
    if(!jobPosition.trim()) {
        setErrorMsg("Lütfen bir pozisyon giriniz.");
        onError("Lütfen bir pozisyon giriniz.");
        return;
    }

    if(!jobDescription.trim()) {
        setErrorMsg("Lütfen iş tanımı giriniz.");
        onError("Lütfen iş tanımı giriniz.");
        return;
    }

    if(!candidateResume.trim()) {
        setErrorMsg("Lütfen aday profili (CV) giriniz.");
        onError("Lütfen aday profili (CV) giriniz.");
        return;
    }

    // Parse companyKnowledge if provided
    let companyKnowledge: KnowledgeItem[] | undefined = undefined;
    if (companyKnowledgeJson.trim()) {
      try {
        companyKnowledge = JSON.parse(companyKnowledgeJson);
        if (!Array.isArray(companyKnowledge)) {
          throw new Error("Company knowledge must be an array");
        }
      } catch (e) {
        setErrorMsg("Company Knowledge JSON formatı geçersiz. Lütfen düzeltin veya boş bırakın.");
        onError("Company Knowledge JSON formatı geçersiz.");
        return;
      }
    }

    onStart({
      jobPosition,
      companyName,
      companyInfo,
      jobDescription,
      candidateResume,
      selectedAvatar,
      companyKnowledge
    });
    setErrorMsg(null);
  };

  // Helper to read file as base64
  const readFileAsBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
              const result = reader.result as string;
              // Remove data url prefix (e.g. "data:application/pdf;base64,")
              const base64 = result.split(',')[1];
              resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
      });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 4 * 1024 * 1024) {
          alert("Dosya boyutu 4MB'dan küçük olmalıdır.");
          return;
      }

      setIsParsing(true);
      try {
          // Backend API'ye CV parsing isteği gönder
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch(`${API_BASE_URL}/parse-cv/`, {
              method: 'POST',
              body: formData,
          });

          if (!response.ok) {
              throw new Error('CV parsing başarısız oldu');
          }

          const parsedData = await response.json();
          setCandidateResume(JSON.stringify(parsedData, null, 2));
      } catch (error) {
          console.error("Parsing error:", error);
          alert("CV analiz edilirken bir hata oluştu. Lütfen dosya formatını kontrol edin veya manuel giriş yapın.");
      } finally {
          setIsParsing(false);
          // Reset input
          event.target.value = ''; 
      }
  };

  const loadRandomSample = () => {
    const randomIndex = Math.floor(Math.random() * sampleConfigs.length);
    const sample = sampleConfigs[randomIndex];
    
    setJobPosition(sample.jobPosition);
    setCompanyName(sample.companyName);
    setCompanyInfo(sample.companyInfo);
    setJobDescription(sample.jobDescription);
    setCandidateResume(JSON.stringify(sample.candidateResume, null, 2));
    setSelectedAvatar(sample.selectedAvatar as AvatarId);
    setCompanyKnowledgeJson(JSON.stringify(sample.companyKnowledge, null, 2));
    setErrorMsg(null);
  };

  return (
    <div className="w-full max-w-[1080px] animate-fade-in-up">
      
      <div className="mb-8 text-center md:text-left relative">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2">
              Mülakat <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Konfigürasyonu</span>
          </h1>
          <p className="text-slate-400">Yapay zeka simülasyonunu başlatmak için aşağıdaki adımları tamamlayın.</p>
          
          {/* Örnek Ekle Butonu - Sağ Üst */}
          <button
            onClick={loadRandomSample}
            className="absolute top-0 right-0 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Örnek Ekle
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* [01] INTERVIEWER & BASIC ROLE INFO (Left Column) */}
          <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
              
              {/* Avatar Selection Card */}
              <div className="group relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-hidden transition-all hover:border-blue-500/30">
                  <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-white select-none transition-opacity group-hover:opacity-20">01</div>
                  
                  <div className="relative z-10">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <span className="w-1 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"></span> 
                          Mülakat Uzmanı
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <button 
                              onClick={() => setSelectedAvatar('female')}
                              className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 group/avatar ${selectedAvatar === 'female' ? 'bg-pink-500/10 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.2)]' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}`}
                          >
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg group-hover/avatar:scale-110 transition-transform">👩‍💼</div>
                              <div className="text-center">
                                  <div className="font-bold text-white">Zeynep</div>
                                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">İK Uzmanı</div>
                              </div>
                              {selectedAvatar === 'female' && <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>}
                          </button>

                          <button 
                              onClick={() => setSelectedAvatar('male')}
                              className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 group/avatar ${selectedAvatar === 'male' ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'}`}
                          >
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-3xl shadow-lg group-hover/avatar:scale-110 transition-transform">👨‍💼</div>
                              <div className="text-center">
                                  <div className="font-bold text-white">Mert</div>
                                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Teknik Lider</div>
                              </div>
                              {selectedAvatar === 'male' && <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>}
                          </button>
                      </div>
                  </div>
              </div>

              {/* Role Basic Info Card */}
              <div className="group relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-hidden transition-all hover:border-purple-500/30 flex-grow">
                  <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-white select-none transition-opacity group-hover:opacity-20">02</div>
                  
                  <div className="relative z-10 space-y-5">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <span className="w-1 h-6 bg-purple-500 rounded-full shadow-[0_0_10px_#a855f7]"></span> 
                          Pozisyon & Şirket
                      </h3>
                      
                      <div className="space-y-4">
                          <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Hedef Pozisyon</label>
                              <div className="relative">
                                  <input 
                                      type="text" 
                                      value={jobPosition}
                                      onChange={(e) => setJobPosition(e.target.value)}
                                      placeholder="Örn: Senior Frontend Developer"
                                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all font-medium pl-10"
                                  />
                                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg">💼</div>
                              </div>
                          </div>

                          <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Şirket Adı (Opsiyonel)</label>
                              <div className="relative">
                                  <input 
                                      type="text" 
                                      value={companyName}
                                      onChange={(e) => setCompanyName(e.target.value)}
                                      placeholder="Örn: Global Tech Corp"
                                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all font-medium pl-10"
                                  />
                                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg">🏢</div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* [03] DETAILS (Middle Column) */}
          <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
               <div className="group relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-hidden h-full transition-all hover:border-indigo-500/30 flex flex-col">
                  <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-white select-none transition-opacity group-hover:opacity-20">03</div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <span className="w-1 h-6 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1]"></span> 
                          Detaylar
                      </h3>
                      
                      <div className="flex-1 flex flex-col gap-4">
                          <div className="flex-1 flex flex-col space-y-1.5">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">İş Tanımı (Gereksinimler)</label>
                              <textarea 
                                  value={jobDescription}
                                  onChange={(e) => setJobDescription(e.target.value)}
                                  placeholder="Aranan Nitelikler:&#10;- React.js ve TypeScript konusunda uzman&#10;- 5+ yıl deneyim&#10;- Takım çalışmasına yatkın..."
                                  className="flex-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all font-mono text-sm resize-none min-h-[120px]"
                              />
                          </div>

                          <div className="flex-none flex flex-col space-y-1.5">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Şirket Hakkında (Kültür/Vizyon)</label>
                              <textarea 
                                  value={companyInfo}
                                  onChange={(e) => setCompanyInfo(e.target.value)}
                                  placeholder="İnovatif, hızlı büyüyen, çalışan odaklı..."
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all font-mono text-sm resize-none h-24"
                              />
                          </div>

                          <div className="flex-none flex flex-col space-y-1.5">
                              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                                  Şirket Bilgisi (Opsiyonel - JSON)
                                  <span className="text-[10px] text-slate-500 ml-1">work_culture, benefits, hiring_process</span>
                              </label>
                              <textarea 
                                  value={companyKnowledgeJson}
                                  onChange={(e) => setCompanyKnowledgeJson(e.target.value)}
                                  placeholder='[{"category": "work_culture", "keywords": ["kültür", "ortam"], "content": "..."}]'
                                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all font-mono text-xs resize-none h-20"
                              />
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* [04] CANDIDATE PROFILE (Right Column) */}
          <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
               <div className="group relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-hidden h-full transition-all hover:border-pink-500/30 flex flex-col">
                  <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-white select-none transition-opacity group-hover:opacity-20">04</div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <span className="w-1 h-6 bg-pink-500 rounded-full shadow-[0_0_10px_#ec4899]"></span> 
                          Aday Profili
                      </h3>
                      
                      {/* Drag & Drop Area */}
                       <div className="relative group/upload mb-4">
                          <input 
                              type="file"
                              accept=".pdf,.txt,.doc,.docx,image/*"
                              onChange={handleFileUpload}
                              disabled={isParsing}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 disabled:cursor-not-allowed"
                          />
                          <div className={`
                              relative overflow-hidden
                              border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300
                              ${isParsing 
                                  ? 'border-pink-500 bg-pink-500/10' 
                                  : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800 hover:border-pink-500/50'
                              }
                          `}>
                              {isParsing ? (
                                  <div className="flex flex-col items-center justify-center py-2">
                                       <div className="w-8 h-8 mb-2 border-2 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
                                       <span className="text-pink-400 font-bold text-xs uppercase tracking-wider animate-pulse">YZ Analiz Ediyor...</span>
                                  </div>
                              ) : (
                                  <div className="py-2 flex flex-col items-center">
                                      <div className="w-10 h-10 mb-3 rounded-full bg-slate-700 flex items-center justify-center text-xl group-hover/upload:scale-110 transition-transform">📄</div>
                                      <p className="text-slate-200 text-sm font-bold">CV Yükle</p>
                                      <p className="text-slate-500 text-[10px] uppercase tracking-wide mt-1">PDF, Resim veya Text</p>
                                  </div>
                              )}
                          </div>
                      </div>

                      <div className="flex-1 flex flex-col space-y-1.5 relative">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">JSON / Metin Verisi</label>
                          <textarea 
                              value={candidateResume}
                              onChange={(e) => setCandidateResume(e.target.value)}
                              placeholder='{"name": "Ad Soyad", "skills": ["React"], ...} veya düz metin CV...'
                              className="flex-1 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-pink-500/50 focus:bg-pink-500/5 transition-all font-mono text-xs resize-none"
                          />
                          {candidateResume && !isParsing && (
                              <div className="absolute bottom-3 right-3 pointer-events-none">
                                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e] animate-pulse"></div>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>

          {/* ACTION BAR (Bottom Full Width) */}
          <div className="md:col-span-12 mt-2">
               <button 
                  onClick={startInterview}
                  disabled={!isFormValid()}
                  className={`relative w-full py-5 font-black text-xl rounded-2xl overflow-hidden group/btn transition-all duration-300 ${
                    isFormValid()
                      ? 'bg-white text-black hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_40px_rgba(255,255,255,0.1)]'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                  }`}
              >
                  {isFormValid() && (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                  )}
                  <span className={`relative flex items-center justify-center gap-3 transition-colors duration-300 ${isFormValid() ? 'group-hover/btn:text-white' : ''}`}>
                      MÜLAKAT SİMÜLASYONUNU BAŞLAT
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                  </span>
              </button>
              {errorMsg && (
                  <div className="mt-4 text-center animate-fade-in">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          {errorMsg}
                      </span>
                  </div>
              )}
          </div>

      </div>
    </div>
  );
};

