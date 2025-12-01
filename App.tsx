import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
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

const SAMPLE_JSON_CV = JSON.stringify({
  "name": "Ayşe",
  "surname": "Yılmaz",
  "email": "ayse.yilmaz@ornekmail.com",
  "city": "Ankara",
  "country": "Türkiye",
  "skills": [
    "Full Stack Development",
    "Node.js",
    "React",
    "Next.js",
    "PostgreSQL",
    "Docker",
    "AWS Services",
    "Agile Methodologies"
  ],
  "education_summary": "Orta Doğu Teknik Üniversitesi (ODTÜ) Bilgisayar Mühendisliği Lisans Derecesi.",
  "experience_summary": "Ölçeklenebilir web uygulamaları ve bulut mimarisi üzerine odaklanmış 6 yıllık Full Stack geliştirme deneyimi.",
  "work_experience_details": [
    {
      "company": "TechNova Teknoloji",
      "position": "Senior Full Stack Developer",
      "is_ongoing": true,
      "start_date": "2021-03",
      "description": "Mikroservis mimarisine geçiş sürecini yönetiyor, Node.js ve AWS kullanarak yüksek trafikli API'ler geliştiriyorum."
    },
    {
      "company": "Softalya Yazılım",
      "position": "Yazılım Geliştirici",
      "is_ongoing": false,
      "start_date": "2018-06",
      "end_date": "2021-02",
      "description": "React ve Python kullanarak kurumsal web uygulamaları ve iç yönetim panelleri geliştirdim."
    }
  ]
}, null, 2);

function App() {
  const [sessionStatus, setSessionStatus] = useState<InterviewStatus>(InterviewStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Settings State
  const [jobPosition, setJobPosition] = useState("Frontend Developer");
  const [companyName, setCompanyName] = useState("");
  const [companyInfo, setCompanyInfo] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [candidateResume, setCandidateResume] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>('female');
  
  // Parsing State
  const [isParsing, setIsParsing] = useState(false);
  
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

      // @ts-ignore
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
          alert("CV analizi için API Anahtarı gereklidir.");
          return;
      }

      if (file.size > 4 * 1024 * 1024) {
          alert("Dosya boyutu 4MB'dan küçük olmalıdır.");
          return;
      }

      setIsParsing(true);
      try {
          const base64Data = await readFileAsBase64(file);
          const ai = new GoogleGenAI({ apiKey });
          
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: {
                  parts: [
                      {
                          inlineData: {
                              mimeType: file.type,
                              data: base64Data
                          }
                      },
                      {
                          text: `
                            Extract the resume information from this document and format it into the following JSON structure exactly.
                            Do not wrap in markdown code blocks. Just return the raw JSON string.
                            
                            Structure requirements:
                            - "name": candidate first name (string)
                            - "surname": candidate surname (string)
                            - "email": email address (string)
                            - "city": city (string)
                            - "country": country (string)
                            - "skills": list of skills (array of strings)
                            - "education_summary": brief summary of education (string)
                            - "experience_summary": brief summary of experience (string)
                            - "work_experience_details": array of objects containing:
                                - "company": company name
                                - "position": job title
                                - "start_date": YYYY-MM format
                                - "end_date": YYYY-MM format or null if ongoing
                                - "is_ongoing": boolean
                                - "description": brief description of responsibilities
                          `
                      }
                  ]
              },
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          name: { type: Type.STRING },
                          surname: { type: Type.STRING },
                          email: { type: Type.STRING },
                          city: { type: Type.STRING },
                          country: { type: Type.STRING },
                          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                          education_summary: { type: Type.STRING },
                          experience_summary: { type: Type.STRING },
                          work_experience_details: {
                              type: Type.ARRAY,
                              items: {
                                  type: Type.OBJECT,
                                  properties: {
                                      company: { type: Type.STRING },
                                      position: { type: Type.STRING },
                                      start_date: { type: Type.STRING },
                                      end_date: { type: Type.STRING, nullable: true },
                                      is_ongoing: { type: Type.BOOLEAN },
                                      description: { type: Type.STRING }
                                  }
                              }
                          }
                      }
                  }
              }
          });

          if (response.text) {
              setCandidateResume(response.text);
          }
      } catch (error) {
          console.error("Parsing error:", error);
          alert("CV analiz edilirken bir hata oluştu. Lütfen dosya formatını kontrol edin veya manuel giriş yapın.");
      } finally {
          setIsParsing(false);
          // Reset input
          event.target.value = ''; 
      }
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
        
        {/* === LANDING / IDLE SCREEN (BENTO GRID) === */}
        {sessionStatus === InterviewStatus.IDLE && (
          <div className="w-full max-w-[1080px] animate-fade-in-up">
            
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2">
                    Mülakat <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Konfigürasyonu</span>
                </h1>
                <p className="text-slate-400">Yapay zeka simülasyonunu başlatmak için aşağıdaki adımları tamamlayın.</p>
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
                            </div>
                        </div>
                    </div>
                </div>

                {/* [04] CANDIDATE PROFILE (Right Column) */}
                <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
                     <div className="group relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-hidden h-full transition-all hover:border-pink-500/30 flex flex-col">
                        <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-white select-none transition-opacity group-hover:opacity-20">04</div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="w-1 h-6 bg-pink-500 rounded-full shadow-[0_0_10px_#ec4899]"></span> 
                                    Aday Profili
                                </h3>
                                <button 
                                    onClick={() => setCandidateResume(SAMPLE_JSON_CV)} 
                                    className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5 transition-colors"
                                >
                                    Örnek Yükle
                                </button>
                            </div>
                            
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
                        className="relative w-full py-5 bg-white text-black font-black text-xl rounded-2xl overflow-hidden group/btn hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                        <span className="relative flex items-center justify-center gap-3 group-hover/btn:text-white transition-colors duration-300">
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
}

export default App;