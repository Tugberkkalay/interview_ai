import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { InterviewStatus, AvatarId, InterviewReport } from '../types';
import { Avatar } from './Avatar';
import { createPcmBlob, decodeAudioData, base64ToUint8Array, blobToBase64 } from '../services/audioUtils';

interface InterviewSessionProps {
  onEnd: (report?: InterviewReport) => void;
  onError: (msg: string) => void;
  jobPosition: string;
  avatarId: AvatarId;
}

interface AudioContextRefs {
    input?: AudioContext;
    output?: AudioContext;
    stream?: MediaStream;
    processor?: ScriptProcessorNode;
    source?: MediaStreamAudioSourceNode;
}

export const InterviewSession: React.FC<InterviewSessionProps> = ({ onEnd, onError, jobPosition, avatarId }) => {
  // UI State
  const [status, setStatus] = useState<InterviewStatus>(InterviewStatus.CONNECTING);
  const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null); // Passed to Avatar
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isEnding, setIsEnding] = useState(false); // To show loading state on End button

  // Refs for logic (non-rendering state)
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null); // To store the session object
  const isSessionActiveRef = useRef(true);
  
  // Audio Contexts
  const audioContextsRef = useRef<AudioContextRefs>({});

  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const videoIntervalRef = useRef<number | undefined>(undefined);

  // Cleanup function to stop all media and processing
  const cleanup = useCallback(() => {
    console.log("Cleaning up session...");
    isSessionActiveRef.current = false;
    
    // Stop Video Loop
    if (videoIntervalRef.current) {
      window.clearInterval(videoIntervalRef.current);
    }

    // Stop Audio Sources
    audioSourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    audioSourcesRef.current.clear();

    // Close Audio Contexts
    if (audioContextsRef.current.input) {
      audioContextsRef.current.input.close();
    }
    if (audioContextsRef.current.output) {
      audioContextsRef.current.output.close();
    }

    // Stop Media Stream (Mic/Cam)
    if (audioContextsRef.current.stream) {
        audioContextsRef.current.stream.getTracks().forEach(track => track.stop());
    }

    // Close Gemini Session
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (e) { console.warn("Could not close session explicitly", e); }
    }

    audioContextsRef.current = {};
    sessionRef.current = null;
  }, []);

  // Initialize Session
  useEffect(() => {
    isSessionActiveRef.current = true;

    const init = async () => {
      try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("API Key not found");
        }

        // 1. Get Media Stream
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 16000
            },
            video: {
                width: 640,
                height: 480
            }
        });

        if (!isSessionActiveRef.current) return;
        
        audioContextsRef.current.stream = stream;

        // Attach video to DOM
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }

        // 2. Setup Audio Contexts
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        audioContextsRef.current.input = inputCtx;
        audioContextsRef.current.output = outputCtx;

        // 3. Setup Analyser for Avatar
        const analyser = outputCtx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.5; // Smooth animations
        analyser.connect(outputCtx.destination);
        setAudioAnalyser(analyser);

        // 4. Connect to Gemini Live API
        const ai = new GoogleGenAI({ apiKey: apiKey });
        
        // Define Tool for ending interview with COMPREHENSIVE REPORT SCHEMA
        const endInterviewTool: FunctionDeclaration = {
            name: "end_interview",
            description: "Mülakatı sonlandırır ve adayın performansına dair çok detaylı, yapılandırılmış bir rapor oluşturur.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    report: {
                        type: Type.OBJECT,
                        properties: {
                            candidateName: { type: Type.STRING, description: "Adayın ismi (öğrenildiyse) veya 'Aday'." },
                            overallScore: { type: Type.NUMBER, description: "100 üzerinden genel performans puanı." },
                            categoryScores: {
                                type: Type.OBJECT,
                                properties: {
                                    technical: { type: Type.NUMBER, description: "Teknik bilgi puanı (0-100)" },
                                    communication: { type: Type.NUMBER, description: "İletişim becerisi puanı (0-100)" },
                                    problemSolving: { type: Type.NUMBER, description: "Problem çözme puanı (0-100)" },
                                    culturalFit: { type: Type.NUMBER, description: "Kültürel uyum puanı (0-100)" },
                                    confidence: { type: Type.NUMBER, description: "Özgüven puanı (0-100)" }
                                },
                                required: ["technical", "communication", "problemSolving", "culturalFit", "confidence"]
                            },
                            visualAnalysis: {
                                type: Type.OBJECT,
                                description: "Adayın görüntüsüne dayalı analiz.",
                                properties: {
                                    attire: { type: Type.STRING, description: "Giyim tarzı değerlendirmesi (örn: Resmi, Dağınık, Profesyonel)." },
                                    environment: { type: Type.STRING, description: "Arka plan ve ortam değerlendirmesi." },
                                    bodyLanguage: { type: Type.STRING, description: "Vücut dili analizi (postür, jestler)." },
                                    eyeContact: { type: Type.STRING, description: "Göz teması ve odaklanma değerlendirmesi." }
                                },
                                required: ["attire", "environment", "bodyLanguage", "eyeContact"]
                            },
                            behavioralAnalysis: {
                                type: Type.OBJECT,
                                properties: {
                                    reactionSpeed: { type: Type.STRING, description: "Sorulara cevap verme hızı ve reaksiyon süresi." },
                                    stressManagement: { type: Type.STRING, description: "Zor sorular karşısındaki tutumu." },
                                    toneOfVoice: { type: Type.STRING, description: "Ses tonu ve vurgu analizi." }
                                },
                                required: ["reactionSpeed", "stressManagement", "toneOfVoice"]
                            },
                            keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "En az 3 güçlü yön." },
                            areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Geliştirilmesi gereken en az 3 alan." },
                            summary: { type: Type.STRING, description: "İK yöneticisi için detaylı yönetici özeti." },
                            hiringRecommendation: { type: Type.STRING, enum: ["Strong Hire", "Hire", "Maybe", "No Hire"], description: "İşe alım tavsiyesi." }
                        },
                        required: ["candidateName", "overallScore", "categoryScores", "visualAnalysis", "behavioralAnalysis", "keyStrengths", "areasForImprovement", "summary", "hiringRecommendation"]
                    }
                },
                required: ["report"]
            }
        };

        const aiName = avatarId === 'female' ? "Zeynep" : "Mert";
        const aiVoice = avatarId === 'female' ? "Kore" : "Fenrir";

        const systemPrompt = `
        Sen deneyimli İnsan Kaynakları Uzmanı "${aiName}".
        Pozisyon: ${jobPosition}
        
        GÖREVİN:
        1. BAĞLANIR BAĞLANMAZ, adayın konuşmasını beklemeden HEMEN söze gir. "Merhaba, hoş geldiniz" diyerek kendini tanıt ve süreci başlat.
        2. Sadece TÜRKÇE konuş.
        3. Adayı sadece teknik olarak değil, bir PROFILER gibi görsel ve davranışsal olarak analiz et.
        4. EĞER MÜLAKAT ERKEN SONLANDIRILIRSA: Elindeki mevcut verilerle (görsel, davranışsal, ilk intiba) mutlaka bir rapor oluştur. Adayın mülakatı yarıda kesmesini de bir davranış verisi olarak yorumla (örn: kararlılık, sabırsızlık, kaçınma vb.).
        
        MÜLAKAT AKIŞI:
        - Selamla ve kendini tanıt.
        - Teknik ve davranışsal sorular sor.
        - Mülakatı bitirmen istendiğinde (aday "Bitir" derse veya butona basarsa) veya yeterli veri topladığında "end_interview" fonksiyonunu çağır ve DETAYLI RAPORU oluştur.
        `;

        // Connect Session
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                tools: [{ functionDeclarations: [endInterviewTool] }],
                systemInstruction: systemPrompt,
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: aiVoice } }
                }
            },
            callbacks: {
                onopen: async () => {
                    console.log("Session Opened");
                    setStatus(InterviewStatus.ACTIVE);

                    // Note: Removed session.send() as it causes crashes on some client versions.
                    // We rely on the systemInstruction "BAĞLANIR BAĞLANMAZ... HEMEN söze gir" to trigger the greeting.
                    
                    // START AUDIO INPUT STREAMING
                    const source = inputCtx.createMediaStreamSource(stream);
                    const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                    
                    processor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcmBlob = createPcmBlob(inputData);
                        
                        // Send audio chunk
                        sessionPromise.then(session => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };

                    source.connect(processor);
                    processor.connect(inputCtx.destination); // Required for script processor to run
                    
                    audioContextsRef.current.processor = processor;
                    audioContextsRef.current.source = source;
                    
                    // START VIDEO STREAMING
                    const canvas = canvasRef.current;
                    const vid = videoRef.current;
                    const ctx = canvas?.getContext('2d');
                    
                    if (canvas && vid && ctx) {
                        videoIntervalRef.current = window.setInterval(() => {
                            if (vid.readyState === 4) { // HAVE_ENOUGH_DATA
                                canvas.width = vid.videoWidth * 0.25; // Scale down for bandwidth
                                canvas.height = vid.videoHeight * 0.25;
                                ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
                                
                                canvas.toBlob(async (blob) => {
                                    if (blob) {
                                        // Cast to any to avoid type mismatch between DOM Blob and GenAI Blob
                                        const base64 = await blobToBase64(blob as any); 
                                        sessionPromise.then(session => {
                                            session.sendRealtimeInput({
                                                media: {
                                                    mimeType: 'image/jpeg',
                                                    data: base64
                                                }
                                            });
                                        });
                                    }
                                }, 'image/jpeg', 0.5);
                            }
                        }, 1000); // 1 FPS is enough for context without killing bandwidth
                    }
                },
                onmessage: async (msg: LiveServerMessage) => {
                    // Check for Tool Calls (End Interview)
                    if (msg.toolCall) {
                        for (const fc of msg.toolCall.functionCalls) {
                            if (fc.name === 'end_interview') {
                                console.log("AI decided to end interview:", fc.args);
                                try {
                                    const report = fc.args['report'] as InterviewReport;
                                    
                                    // Acknowledge tool call to API
                                    sessionPromise.then(session => {
                                        session.sendToolResponse({
                                            functionResponses: [{
                                                id: fc.id,
                                                name: fc.name,
                                                response: { result: "ok" }
                                            }]
                                        });
                                    });

                                    // Graceful exit with report
                                    setTimeout(() => {
                                        if (isSessionActiveRef.current) {
                                            cleanup();
                                            onEnd(report);
                                        }
                                    }, 2000);
                                } catch (e) {
                                    console.error("Error parsing report:", e);
                                    // Try to close gracefully anyway
                                    cleanup();
                                    onEnd(); // End without report
                                }
                            }
                        }
                    }

                    // Audio Playback
                    const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (base64Audio) {
                        try {
                            const audioBytes = base64ToUint8Array(base64Audio);
                            const audioBuffer = await decodeAudioData(audioBytes, outputCtx, 24000, 1);
                            
                            const now = outputCtx.currentTime;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, now);
                            
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(analyser); // Connect to analyser (which connects to destination)
                            
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            
                            source.onended = () => {
                                audioSourcesRef.current.delete(source);
                            };
                            audioSourcesRef.current.add(source);

                        } catch (err) {
                            console.error("Audio decode error", err);
                        }
                    }

                    // Handling Interruptions
                    if (msg.serverContent?.interrupted) {
                        console.log("Interrupted!");
                        audioSourcesRef.current.forEach(s => s.stop());
                        audioSourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                    }
                },
                onclose: () => {
                    console.log("Session Closed");
                    if (isSessionActiveRef.current) onEnd();
                },
                onerror: (e) => {
                    console.error("Session Error", e);
                    if (isSessionActiveRef.current) onError("Bağlantı hatası oluştu.");
                }
            }
        });

        // Store session reference for cleanup
        sessionRef.current = await sessionPromise;

      } catch (err: any) {
        console.error("Initialization error:", err);
        if (isSessionActiveRef.current) onError(err.message || "Mikrofon/Kamera erişimi sağlanamadı.");
      }
    };

    init();

    return () => {
      isSessionActiveRef.current = false;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Toggle Mic
  const toggleMic = () => {
      const stream = audioContextsRef.current.stream;
      if (stream) {
          const audioTracks = stream.getAudioTracks();
          audioTracks.forEach(track => {
              track.enabled = !isMuted; // Toggle Logic: if currently muted(true), make enabled=true
          });
          setIsMuted(!isMuted);
      }
  };

  // Toggle Video
  const toggleVideo = () => {
    const stream = audioContextsRef.current.stream;
    if (stream) {
        const videoTracks = stream.getVideoTracks();
        videoTracks.forEach(track => {
            track.enabled = !isVideoEnabled; 
        });
        setIsVideoEnabled(!isVideoEnabled);
    }
  };

  // Handle Manual End Button
  const handleManualEnd = async () => {
    if (isEnding) return;
    setIsEnding(true);

    try {
        if (sessionRef.current) {
            // Safe Check: Does session have a send method?
            if (typeof sessionRef.current.send === 'function') {
                const endMessage = "Aday mülakatı 'Bitir' butonuna basarak, kendi inisiyatifiyle ŞU AN sonlandırdı. Mülakatı hemen kes. Lütfen bu davranışı analizine dahil et ve raporu oluştur.";
                await sessionRef.current.send({
                    parts: [{ text: endMessage }],
                    turnComplete: true
                });
            } else {
                console.warn("session.send is not available. Closing session directly.");
                // If we can't tell the AI to end, we just close. The report will be missing.
                cleanup();
                onEnd();
            }
        }
    } catch(e) {
        console.error("Failed to send end message", e);
        cleanup();
        onEnd(); // Fallback end
    }

    // Safety timeout: If AI doesn't call the tool within 8 seconds, close anyway.
    setTimeout(() => {
        if (isSessionActiveRef.current) {
            console.warn("AI failed to generate report in time.");
            cleanup();
            onEnd(); // End without report (App.tsx will show error)
        }
    }, 8000);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 gap-6">
      
      {/* Main Visual Area */}
      <div className="relative w-full max-w-4xl aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
        
        {/* User Video Feed (PiP style or split) */}
        <div className="absolute top-4 right-4 w-32 md:w-48 aspect-[4/3] bg-black rounded-lg overflow-hidden border-2 border-slate-600 z-10 shadow-lg">
           <video 
             ref={videoRef} 
             autoPlay 
             muted 
             playsInline 
             className={`w-full h-full object-cover transform scale-x-[-1] ${!isVideoEnabled ? 'hidden' : ''}`}
           />
           {!isVideoEnabled && (
             <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                Kamera Kapalı
             </div>
           )}
        </div>

        {/* AI Avatar Center */}
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
            <Avatar analyser={audioAnalyser} isActive={status === InterviewStatus.ACTIVE} avatarId={avatarId} />
            <div className="mt-2 text-center px-4 relative z-10">
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide drop-shadow-md">
                    İK Uzmanı {avatarId === 'female' ? 'Zeynep' : 'Mert'}
                </h2>
                <p className="text-slate-300 text-sm mt-1 drop-shadow-sm">
                    {status === InterviewStatus.CONNECTING ? 'Bağlantı kuruluyor...' : isEnding ? 'Rapor oluşturuluyor...' : 'Seni dinliyor...'}
                </p>
            </div>
        </div>
      </div>

      {/* Hidden Canvas for Video Processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-full border border-slate-700 shadow-xl">
        <button 
            onClick={toggleMic}
            disabled={isEnding}
            className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-700 text-white hover:bg-slate-600'} ${isEnding ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isMuted ? "Sesi Aç" : "Sessize Al"}
        >
            {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            )}
        </button>

        <button 
            onClick={toggleVideo}
            disabled={isEnding}
            className={`p-4 rounded-full transition-all ${!isVideoEnabled ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-700 text-white hover:bg-slate-600'} ${isEnding ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isVideoEnabled ? "Kamerayı Kapat" : "Kamerayı Aç"}
        >
             {isVideoEnabled ? (
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
             ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
             )}
        </button>

        <button 
            onClick={handleManualEnd}
            disabled={isEnding}
            className={`px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-colors flex items-center gap-2 ${isEnding ? 'opacity-70 cursor-wait' : ''}`}
        >
            {isEnding ? (
                <>
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   <span>Bitiriliyor...</span>
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
                    <span>Bitir</span>
                </>
            )}
        </button>
      </div>

    </div>
  );
};