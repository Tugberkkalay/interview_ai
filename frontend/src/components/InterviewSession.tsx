import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { InterviewStatus, AvatarId, InterviewReport } from '../types';
import { Avatar } from './Avatar';
import { createPcmBlob, decodeAudioData, base64ToUint8Array, blobToBase64 } from '../services/audioUtils';
import { KnowledgeItem } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Sub Components
import { WaitingRoom } from './session/WaitingRoom';
import { ConnectionLoading } from './session/ConnectionLoading';
import { SessionControls } from './session/SessionControls';

interface InterviewSessionProps {
  onEnd: (report?: InterviewReport) => void;
  onError: (msg: string) => void;
  jobPosition: string;
  companyName: string;
  companyInfo: string;
  jobDescription: string;
  candidateResume: string;
  avatarId: AvatarId;
  companyLogo?: string | null;
  companyKnowledge?: KnowledgeItem[]; // Optional: from ATS (work_culture, benefits, hiring_process)
}

interface AudioContextRefs {
    input?: AudioContext;
    output?: AudioContext;
    stream?: MediaStream;
    processor?: ScriptProcessorNode;
    source?: MediaStreamAudioSourceNode;
}

export const InterviewSession: React.FC<InterviewSessionProps> = ({ onEnd, onError, jobPosition, companyName, companyInfo, jobDescription, candidateResume, avatarId, companyLogo, companyKnowledge }) => {
  // UI State
  const [status, setStatus] = useState<InterviewStatus>(InterviewStatus.IDLE);
  const [isConnectionStarted, setIsConnectionStarted] = useState(false);
  const [audioAnalyser, setAudioAnalyser] = useState<AnalyserNode | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isEnding, setIsEnding] = useState(false);
  const [loadingText, setLoadingText] = useState("Sistem başlatılıyor...");
  const [interruptionWarning, setInterruptionWarning] = useState<string | null>(null);
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(true);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  
  // Turn Taking State
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  // Refs for logic
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const isSessionActiveRef = useRef(true);
  
  // Logic Refs
  const isInputEnabledRef = useRef(false);
  const audioContextsRef = useRef<AudioContextRefs>({});
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const videoIntervalRef = useRef<number | undefined>(undefined);
  
  // VAD & Timing Refs
  const lastSpeechTimeRef = useRef<number>(0);
  const pendingReportRef = useRef<InterviewReport | null>(null);
  const turnCountRef = useRef<number>(0);
  
  // Transcript
  const transcriptRef = useRef<{role: string, text: string}[]>([]);
  const hasGeneratedReportRef = useRef(false);

  // Cycle loading texts
  useEffect(() => {
      if (status !== InterviewStatus.CONNECTING) return;
      
      const messages = [
          "CV ve iş ilanı analiz ediliyor...",
          "Mülakat stratejisi oluşturuluyor...",
          "Kamera ve mikrofon test ediliyor...",
          `${avatarId === 'female' ? 'Zeynep' : 'Mert'} profilinizi inceliyor...`,
          "Bağlantı kuruluyor..."
      ];
      let i = 0;
      const interval = setInterval(() => {
          i = (i + 1) % messages.length;
          setLoadingText(messages[i]);
      }, 1500);
      return () => clearInterval(interval);
  }, [status, avatarId]);

  // Toast timer for interruption
  useEffect(() => {
      if(interruptionWarning) {
          const timer = setTimeout(() => setInterruptionWarning(null), 3000);
          return () => clearTimeout(timer);
      }
  }, [interruptionWarning]);

  const cleanup = useCallback(() => {
    isSessionActiveRef.current = false;
    isInputEnabledRef.current = false;
    
    if (videoIntervalRef.current) window.clearInterval(videoIntervalRef.current);

    audioSourcesRef.current.forEach(source => { try { source.stop(); } catch(e) {} });
    audioSourcesRef.current.clear();

    if (audioContextsRef.current.input?.state !== 'closed') audioContextsRef.current.input?.close();
    if (audioContextsRef.current.output?.state !== 'closed') audioContextsRef.current.output?.close();
    if (audioContextsRef.current.stream) audioContextsRef.current.stream.getTracks().forEach(track => track.stop());

    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (e) { console.warn("Could not close session explicitly", e); }
    }
  }, []);

  const finalizeSession = (report: InterviewReport) => {
      setTimeout(() => {
          if (isSessionActiveRef.current) {
              cleanup();
              onEnd(report);
          }
      }, 2000);
  };

  const playStartSound = async (ctx: AudioContext) => {
      try {
          const t = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'sine'; 
          osc.frequency.setValueAtTime(880, t);
          osc.frequency.exponentialRampToValueAtTime(440, t + 0.3);

          gain.gain.setValueAtTime(0.05, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

          osc.start(t);
          osc.stop(t + 0.5);
          
          return new Promise(r => setTimeout(r, 500));
      } catch (e) {
          console.warn("Could not play start sound:", e);
      }
  };

  // Request permissions on component mount
  useEffect(() => {
      const requestPermissions = async () => {
          try {
              setIsRequestingPermissions(true);
              setPermissionsError(null);

              const stream = await navigator.mediaDevices.getUserMedia({
                  audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
                  video: { width: 640, height: 480, frameRate: 15 }
              });
              
              // Store stream for later use
              audioContextsRef.current.stream = stream;
              
              // Show video preview immediately
              if (videoRef.current) { 
                  videoRef.current.srcObject = stream; 
                  videoRef.current.play(); 
              }

              setIsRequestingPermissions(false);
          } catch (err) {
              console.error("Permission request error:", err);
              const errorMessage = err instanceof Error ? err.message : "Mikrofon veya kamera izni alınamadı. Lütfen izinleri kontrol edip sayfayı yenileyin.";
              setPermissionsError(errorMessage);
              setIsRequestingPermissions(false);
              onError(errorMessage);
          }
      };

      requestPermissions();

      // Cleanup on unmount
      return () => {
          if (audioContextsRef.current.stream) {
              audioContextsRef.current.stream.getTracks().forEach(track => track.stop());
          }
      };
  }, []); // Run only once on mount

  const handleStartConnection = async () => {
      try {
          // Check if we have permissions
          if (!audioContextsRef.current.stream) {
              onError("Medya izinleri henüz alınmadı. Lütfen bekleyin.");
              return;
          }

          // Type assertion for webkitAudioContext (Safari compatibility)
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const inputCtx = new AudioContextClass({ sampleRate: 16000 });
          const outputCtx = new AudioContextClass({ sampleRate: 24000 });
          
          audioContextsRef.current.input = inputCtx;
          audioContextsRef.current.output = outputCtx;

          await outputCtx.resume();
          await inputCtx.resume();
          await playStartSound(outputCtx);

          // Use the already obtained stream
          const stream = audioContextsRef.current.stream;
          
          // Ensure video is still connected
          if (videoRef.current && !videoRef.current.srcObject) {
              videoRef.current.srcObject = stream;
              videoRef.current.play();
          }

          const analyser = outputCtx.createAnalyser();
          analyser.fftSize = 512;
          analyser.smoothingTimeConstant = 0.5;
          analyser.connect(outputCtx.destination);
          setAudioAnalyser(analyser);

          setIsConnectionStarted(true);
          setStatus(InterviewStatus.CONNECTING);

      } catch (err: any) {
          console.error("Connection start error:", err);
          onError("Bağlantı başlatılırken bir hata oluştu.");
      }
  };

  const generateFallbackReport = async () => {
      if (transcriptRef.current.length === 0) {
          console.warn("No transcript available for fallback report.");
          onEnd(); 
          return;
      }

      setLoadingText("Bağlantı kesildi. Yedekleme sisteminden rapor oluşturuluyor...");
      setIsEnding(true);

      try {
          // Backend'den rapor oluştur
          const response = await fetch(`${API_BASE_URL}/interview/report/`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  transcript: transcriptRef.current,
                  candidateName: 'Aday',
                  jobPosition: jobPosition,
                  jobDescription: jobDescription
              })
          });

          if (!response.ok) {
              // Detaylı hata mesajı al
              let errorMessage = 'Rapor oluşturulamadı';
              try {
                  const errorData = await response.json();
                  errorMessage = errorData.error || errorMessage;
              } catch {
                  errorMessage = `HTTP ${response.status}: ${response.statusText}`;
              }
              console.error(`Backend rapor hatası (${response.status}):`, errorMessage);
              throw new Error(errorMessage);
          }

          const data = await response.json();
          
          // Response formatını kontrol et
          if (!data.report) {
              console.error("Backend'den dönen response'da 'report' field'ı yok:", data);
              throw new Error("Backend response formatı hatalı: 'report' field'ı bulunamadı");
          }
          
          const reportData = data.report as InterviewReport;
          reportData.transcript = transcriptRef.current;
          onEnd(reportData);

      } catch (e) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          console.error("Fallback generation failed:", {
              error: errorMessage,
              transcriptLength: transcriptRef.current.length,
              apiUrl: `${API_BASE_URL}/interview/report/`
          });
          
          // Backend'den rapor alınamazsa, transcript'ten gerçek verilerle minimal rapor oluştur
          // Mock data değil, gerçek transcript verilerinden çıkarılan bilgiler
          const transcriptText = transcriptRef.current.map(item => `${item.role}: ${item.text}`).join('\n');
          const candidateMessages = transcriptRef.current.filter(item => item.role === 'Aday' || item.role === 'user');
          const interviewerMessages = transcriptRef.current.filter(item => item.role === 'Uzman' || item.role === 'model');
          
          // Transcript'ten gerçek bilgileri çıkar
          const fallbackReport: InterviewReport = {
              candidateName: 'Aday',
              overallScore: 50, // Orta seviye, gerçek değerlendirme yapılamadı
              duration: `${Math.floor(transcriptRef.current.length * 0.5)} dakika`, // Tahmini süre
              categoryScores: {
                  technical: 50,
                  communication: 50,
                  problemSolving: 50,
                  culturalFit: 50,
                  confidence: 50
              },
              visualAnalysis: {
                  attire: 'Görüntü analizi yapılamadı - bağlantı kesildi',
                  environment: 'Görüntü analizi yapılamadı - bağlantı kesildi',
                  bodyLanguage: 'Görüntü analizi yapılamadı - bağlantı kesildi',
                  eyeContact: 'Görüntü analizi yapılamadı - bağlantı kesildi'
              },
              behavioralAnalysis: {
                  reactionSpeed: 'Davranışsal analiz yapılamadı - bağlantı kesildi',
                  stressManagement: 'Davranışsal analiz yapılamadı - bağlantı kesildi',
                  toneOfVoice: 'Davranışsal analiz yapılamadı - bağlantı kesildi'
              },
              keyStrengths: candidateMessages.length > 0 ? ['Mülakat sırasında iletişim kuruldu'] : [],
              areasForImprovement: ['Bağlantı kesildiği için detaylı değerlendirme yapılamadı'],
              summary: `Mülakat sırasında bağlantı kesildi. ${candidateMessages.length} aday mesajı ve ${interviewerMessages.length} uzman mesajı kaydedildi. Detaylı değerlendirme için mülakatın tamamlanması gerekmektedir.\n\nTranskript özeti:\n${transcriptText.substring(0, 500)}...`,
              hiringRecommendation: 'Maybe',
              transcript: transcriptRef.current
          };
          
          onEnd(fallbackReport);
      }
  };

  useEffect(() => {
    if (!isConnectionStarted) return;

    isSessionActiveRef.current = true;
    isInputEnabledRef.current = false;
    hasGeneratedReportRef.current = false;
    pendingReportRef.current = null;
    turnCountRef.current = 0;

    const init = async () => {
      try {
        // @ts-ignore
        const apiKey = process.env.API_KEY || import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

        if (!audioContextsRef.current.input || !audioContextsRef.current.output || !audioContextsRef.current.stream) {
            throw new Error("Audio Contexts not initialized properly.");
        }

        const inputCtx = audioContextsRef.current.input;
        const outputCtx = audioContextsRef.current.output;
        const stream = audioContextsRef.current.stream;
        const analyser = audioAnalyser;

        // Backend'den system prompt'u çek
        let systemPrompt = '';
        try {
            // Parse candidateResume securely - if it is not JSON, send it as string
            let parsedResume = candidateResume;
            try {
                if (candidateResume && candidateResume.trim()) {
                    parsedResume = JSON.parse(candidateResume);
                }
            } catch (e) {
                // Not valid JSON, use as plain string
                console.log("Resume is not JSON, using as plain string");
            }

            const promptResponse = await fetch(`${API_BASE_URL}/interview/prompt/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobPosition,
                    companyName,
                    companyInfo,
                    jobDescription,
                    candidateResume: parsedResume,
                    avatarId: avatarId
                })
            });

            if (promptResponse.ok) {
                const promptData = await promptResponse.json();
                systemPrompt = promptData.systemPrompt;
                console.log("System prompt received, length:", systemPrompt.length);
            } else {
                const errorData = await promptResponse.json().catch(() => ({ error: 'System prompt alınamadı' }));
                throw new Error(errorData.error || 'System prompt alınamadı');
            }
        } catch (error) {
            console.error('System prompt fetch error:', error);
            onError(`System prompt yüklenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
            return;
        }

        // Only initialize GoogleGenAI if API key is available
        if (!apiKey) {
            throw new Error("An API Key must be set when running in a browser. Please set VITE_API_KEY environment variable or configure API_KEY in vite.config.ts");
        }
        
        console.log("Initializing Gemini AI with API key...");
        const ai = new GoogleGenAI({ apiKey });
        
        // --- TOOLS ---
        const endInterviewTool: FunctionDeclaration = {
            name: "end_interview",
            description: "Mülakatı sonlandırır ve rapor oluşturur.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    report: {
                        type: Type.OBJECT,
                        properties: {
                            candidateName: { type: Type.STRING },
                            overallScore: { type: Type.NUMBER },
                            categoryScores: {
                                type: Type.OBJECT,
                                properties: {
                                    technical: { type: Type.NUMBER },
                                    communication: { type: Type.NUMBER },
                                    problemSolving: { type: Type.NUMBER },
                                    culturalFit: { type: Type.NUMBER },
                                    confidence: { type: Type.NUMBER }
                                },
                                required: ["technical", "communication", "problemSolving", "culturalFit", "confidence"]
                            },
                            visualAnalysis: {
                                type: Type.OBJECT,
                                properties: {
                                    attire: { type: Type.STRING },
                                    environment: { type: Type.STRING },
                                    bodyLanguage: { type: Type.STRING },
                                    eyeContact: { type: Type.STRING }
                                },
                                required: ["attire", "environment", "bodyLanguage", "eyeContact"]
                            },
                            behavioralAnalysis: {
                                type: Type.OBJECT,
                                properties: {
                                    reactionSpeed: { type: Type.STRING },
                                    stressManagement: { type: Type.STRING },
                                    toneOfVoice: { type: Type.STRING }
                                },
                                required: ["reactionSpeed", "stressManagement", "toneOfVoice"]
                            },
                            keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                            areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
                            summary: { type: Type.STRING },
                            hiringRecommendation: { type: Type.STRING, enum: ["Strong Hire", "Hire", "Maybe", "No Hire"] }
                        },
                        required: ["candidateName", "overallScore", "categoryScores", "visualAnalysis", "behavioralAnalysis", "keyStrengths", "areasForImprovement", "summary", "hiringRecommendation"]
                    }
                },
                required: ["report"]
            }
        };

        const consultKnowledgeBaseTool: FunctionDeclaration = {
            name: "consult_knowledge_base",
            description: "Şirket hakkında spesifik sorular (yan haklar, kültür, teknoloji vb.) sorulduğunda bilgi bankasına danışır.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    query: {
                        type: Type.STRING,
                        description: "Aranan bilginin konusu (örn: 'yemek ücreti', 'uzaktan çalışma', 'teknoloji stack')."
                    }
                },
                required: ["query"]
            }
        };

        // Try alternative voice names if Fenrir doesn't work
        // Common Gemini Live API voice names: Kore (female), Fenrir (male), Charon (male), Aoede (female)
        const aiVoice = avatarId === 'female' ? "Kore" : "Charon"; // Changed from Fenrir to Charon

        // systemPrompt zaten backend'den geldi (yukarıda)

        console.log("Connecting to Gemini Live API...", { avatarId, aiVoice });
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                tools: [{ functionDeclarations: [endInterviewTool, consultKnowledgeBaseTool] }],
                systemInstruction: systemPrompt,
                inputAudioTranscription: {}, 
                outputAudioTranscription: {},
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: aiVoice } }
                }
            },
            callbacks: {
                onopen: async () => {
                    console.log("Session opened, initializing...");
                    setStatus(InterviewStatus.ACTIVE);
                    setIsAISpeaking(true); 
                    isInputEnabledRef.current = true; 

                    // Wait for session to be ready, then send initial message
                    const session = await sessionPromise;
                    console.log("Session ready, sending start message...");
                    setTimeout(() => {
                        if (session && isSessionActiveRef.current) {
                            console.log("Sending: Mülakat simülasyonunu başlat. Lütfen Türkçe konuş.");
                            session.sendRealtimeInput({ text: "Mülakat simülasyonunu başlat. Lütfen tüm konuşmalarını Türkçe yap." });
                        }
                    }, 500);

                    const source = inputCtx.createMediaStreamSource(stream);
                    const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                    
                    processor.onaudioprocess = (e) => {
                        if (!isInputEnabledRef.current) return;
                        
                        const inputData = e.inputBuffer.getChannelData(0);
                        let sum = 0;
                        const len = inputData.length;
                        for(let i=0; i<len; i++) { sum += inputData[i] * inputData[i]; }
                        const rms = Math.sqrt(sum / len);
                        const speechThreshold = 0.01; 
                        
                        const now = Date.now();
                        
                        if (rms > speechThreshold) {
                            lastSpeechTimeRef.current = now;
                        }
                        
                        if (rms <= speechThreshold && (now - lastSpeechTimeRef.current) < 1000) {
                             return; 
                        }

                        const pcmBlob = createPcmBlob(inputData);
                        if (sessionRef.current) {
                            sessionRef.current.sendRealtimeInput({ media: pcmBlob });
                        }
                    };

                    source.connect(processor);
                    processor.connect(inputCtx.destination);
                    audioContextsRef.current.processor = processor;
                    audioContextsRef.current.source = source;
                    
                    const canvas = canvasRef.current;
                    const vid = videoRef.current;
                    const ctx = canvas?.getContext('2d');
                    if (canvas && vid && ctx) {
                        videoIntervalRef.current = window.setInterval(() => {
                            if (!isInputEnabledRef.current) return; 
                            if (vid.readyState === 4) {
                                canvas.width = vid.videoWidth * 0.25;
                                canvas.height = vid.videoHeight * 0.25;
                                ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
                                canvas.toBlob(async (blob) => {
                                    if (blob && sessionRef.current) {
                                        const base64 = await blobToBase64(blob); 
                                        sessionRef.current.sendRealtimeInput({ media: { mimeType: 'image/jpeg', data: base64 } });
                                    }
                                }, 'image/jpeg', 0.5);
                            }
                        }, 1000); 
                    }
                },
                onmessage: async (msg: LiveServerMessage) => {
                    console.log("Message received from server:", {
                        hasInputTranscription: !!msg.serverContent?.inputTranscription,
                        hasOutputTranscription: !!msg.serverContent?.outputTranscription,
                        hasAudio: !!msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data,
                        hasToolCall: !!msg.toolCall,
                        interrupted: !!msg.serverContent?.interrupted,
                        fullMessage: msg
                    });
                    
                    // Debug: Log the full structure to understand why audio might be missing
                    if (msg.serverContent?.modelTurn) {
                        console.log("Model turn structure:", {
                            parts: msg.serverContent.modelTurn.parts,
                            partsLength: msg.serverContent.modelTurn.parts?.length,
                            firstPart: msg.serverContent.modelTurn.parts?.[0],
                            hasInlineData: !!msg.serverContent.modelTurn.parts?.[0]?.inlineData,
                            inlineDataType: msg.serverContent.modelTurn.parts?.[0]?.inlineData?.mimeType,
                            inlineDataSize: msg.serverContent.modelTurn.parts?.[0]?.inlineData?.data?.length
                        });
                    }
                    
                    const addToTranscript = (role: string, text: string) => {
                        const lastItem = transcriptRef.current[transcriptRef.current.length - 1];
                        if (lastItem && lastItem.role === role) {
                            lastItem.text += " " + text;
                        } else {
                            transcriptRef.current.push({ role, text });
                        }
                    };

                    if (msg.serverContent?.inputTranscription) {
                        addToTranscript("Aday", msg.serverContent.inputTranscription.text);
                    }
                    if (msg.serverContent?.outputTranscription) {
                        console.log("AI speaking:", msg.serverContent.outputTranscription.text);
                        addToTranscript("Uzman", msg.serverContent.outputTranscription.text);
                    }

                    if (msg.toolCall) {
                        for (const fc of msg.toolCall.functionCalls) {
                            if (fc.name === 'end_interview') {
                                try {
                                    console.log("Tool call received: end_interview");
                                    hasGeneratedReportRef.current = true;
                                    const report = fc.args['report'] as InterviewReport;
                                    report.transcript = transcriptRef.current;
                                    pendingReportRef.current = report;
                                    setIsEnding(true); 

                                    if (sessionRef.current) {
                                        sessionRef.current.sendToolResponse({
                                            functionResponses: [{ id: fc.id, name: fc.name, response: { result: "ok" } }]
                                        });
                                    }

                                    if (audioSourcesRef.current.size === 0) {
                                        finalizeSession(report);
                                    }
                                } catch (e) { 
                                    console.error("Tool call parsing failed", e);
                                    if (isSessionActiveRef.current) { cleanup(); onEnd(); }
                                }
                            } else if (fc.name === 'consult_knowledge_base') {
                                const query = (fc.args['query'] as string || "").toLowerCase();
                                console.log(`Consulting Knowledge Base for: ${query}`);
                                
                                let bestMatch = "Bu konuda bilgi bankasında spesifik bir kayıt bulunamadı.";
                                
                                // Use companyKnowledge from props (from ATS) if available
                                const knowledgeBase = companyKnowledge || [];
                                
                                const match = knowledgeBase.find(item => 
                                    item.category.includes(query) || 
                                    item.keywords.some(k => query.includes(k))
                                );

                                if (match) {
                                    bestMatch = match.content;
                                }

                                if (sessionRef.current) {
                                    sessionRef.current.sendToolResponse({
                                        functionResponses: [{ 
                                            id: fc.id, 
                                            name: fc.name, 
                                            response: { result: bestMatch } 
                                        }]
                                    });
                                }
                            }
                        }
                    }

                    const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (base64Audio) {
                        console.log("Received audio from AI, playing...");
                        if (turnCountRef.current > 0) {
                            isInputEnabledRef.current = false;
                        }
                        
                        setIsAISpeaking(true);

                        try {
                            const audioBytes = base64ToUint8Array(base64Audio);
                            const audioBuffer = await decodeAudioData(audioBytes, outputCtx, 24000, 1);
                            
                            const now = outputCtx.currentTime;
                            if (nextStartTimeRef.current < now) nextStartTimeRef.current = now;
                            
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            if (analyser) {
                                source.connect(analyser);
                            } else {
                                source.connect(outputCtx.destination);
                            }
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            
                            audioSourcesRef.current.add(source);
                            
                            source.onended = () => {
                                audioSourcesRef.current.delete(source);
                                
                                if (audioSourcesRef.current.size === 0) {
                                    turnCountRef.current += 1; 

                                    if (pendingReportRef.current) {
                                        finalizeSession(pendingReportRef.current);
                                    } 
                                    else if (isSessionActiveRef.current) {
                                        setTimeout(() => {
                                            if (isSessionActiveRef.current && audioSourcesRef.current.size === 0) {
                                                isInputEnabledRef.current = true;
                                                setIsAISpeaking(false);
                                                lastSpeechTimeRef.current = Date.now();
                                            }
                                        }, 200);
                                    }
                                }
                            };
                        } catch (err) {}
                    }

                    if (msg.serverContent?.interrupted) {
                        console.warn("Model reported interruption.");
                        audioSourcesRef.current.forEach(s => s.stop());
                        audioSourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                        isInputEnabledRef.current = true;
                        setIsAISpeaking(false);

                        if (turnCountRef.current === 0) {
                            turnCountRef.current = 1;
                        }
                    }
                },
                onclose: () => { 
                    console.log("Session Closed");
                    if (isSessionActiveRef.current && !hasGeneratedReportRef.current) {
                        generateFallbackReport();
                    } else if (isSessionActiveRef.current && !pendingReportRef.current) {
                        onEnd();
                    }
                },
                onerror: (e) => { 
                    console.error("Session Error:", e, { avatarId, aiVoice });
                    if (isSessionActiveRef.current && !hasGeneratedReportRef.current) {
                         generateFallbackReport();
                    }
                }
            }
        });
        sessionRef.current = await sessionPromise;
      } catch (err: any) {
        if (isSessionActiveRef.current) onError(err.message || "Başlatma hatası.");
      }
    };
    init();
    return () => { isSessionActiveRef.current = false; cleanup(); };
  }, [isConnectionStarted]);

  const toggleMic = () => {
      if (audioContextsRef.current.stream) {
          audioContextsRef.current.stream.getAudioTracks().forEach(track => track.enabled = !isMuted);
          setIsMuted(!isMuted);
      }
  };
  const toggleVideo = () => {
    if (audioContextsRef.current.stream) {
        audioContextsRef.current.stream.getVideoTracks().forEach(track => track.enabled = !isVideoEnabled);
        setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const handleManualEnd = async () => {
    if (isEnding) return;
    setIsEnding(true);
    
    if (sessionRef.current && isSessionActiveRef.current) {
        try {
            sessionRef.current.sendRealtimeInput({ 
                text: "Mülakatı bitir ve raporu oluştur." 
            });
            setTimeout(() => {
                if (isSessionActiveRef.current && !hasGeneratedReportRef.current) {
                    cleanup();
                    generateFallbackReport();
                }
            }, 5000);
        } catch (e) {
            cleanup();
            generateFallbackReport();
        }
    } else {
        generateFallbackReport();
    }
  };

  const isActive = status === InterviewStatus.ACTIVE;
  // Status indicator appears when AI speaks for the 2nd time (turn 1 + speaking) or any time after (turn > 1).
  const showStatusIndicator = turnCountRef.current > 0 && (isAISpeaking || turnCountRef.current > 1);

  return (
    // Responsive Container: 
    // Mobile: fixed full screen (100dvh)
    // Desktop: relative w-full aspect-video card
    <div className="fixed inset-0 z-50 w-full h-[100dvh] bg-slate-900 md:relative md:inset-auto md:z-auto md:w-full md:max-w-4xl md:h-auto md:aspect-video md:rounded-2xl md:overflow-hidden md:shadow-2xl md:border md:border-slate-700 group flex flex-col">
      
      {interruptionWarning && (
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
              <div className="bg-orange-500/90 backdrop-blur-md text-white px-6 py-2 rounded-full shadow-xl flex items-center gap-3 border border-orange-400/50">
                   <span className="font-medium text-sm">{interruptionWarning}</span>
              </div>
          </div>
      )}

      {/* === LAYER 0: WAITING ROOM === */}
      {!isConnectionStarted && (
            <WaitingRoom 
                onConnect={handleStartConnection} 
                avatarId={avatarId}
                isRequestingPermissions={isRequestingPermissions}
                permissionsError={permissionsError}
            />
      )}

      {/* === LAYER 1: LOADING SCREEN === */}
      {isConnectionStarted && status === InterviewStatus.CONNECTING && (
          <ConnectionLoading loadingText={loadingText} />
      )}

      {/* === LAYER 2: ACTIVE SESSION UI === */}
      <div className={`relative w-full flex-1 transition-opacity duration-1000 delay-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-full h-full bg-gradient-to-b from-slate-800 to-slate-900">
              <Avatar analyser={audioAnalyser} isActive={isActive} avatarId={avatarId} />
          </div>

          {/* Company Logo - Top Left */}
          {companyLogo && (
            <div className="absolute top-6 left-6 z-40 animate-slide-down">
              <div className="bg-white/95 backdrop-blur-md border border-white/20 p-2 rounded-xl shadow-lg">
                <img 
                  src={companyLogo} 
                  alt={companyName} 
                  className="h-8 w-auto max-w-[120px] object-contain"
                />
              </div>
            </div>
          )}

          {/* Avatar Badge */}
          <div className={`absolute top-6 flex items-center gap-3 animate-slide-down ${companyLogo ? 'left-40' : 'left-6'}`}>
              <div className="bg-black/40 backdrop-blur-md border border-white/10 p-1.5 rounded-full pr-5 flex items-center gap-3 shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold border-2 border-slate-800">
                      {avatarId === 'female' ? 'Z' : 'M'}
                  </div>
                  <div className="flex flex-col">
                      <span className="text-white font-bold text-sm leading-tight">{avatarId === 'female' ? 'Zeynep' : 'Mert'}</span>
                      <span className="text-blue-300 text-[10px] font-semibold tracking-wider uppercase">İK Uzmanı</span>
                  </div>
              </div>
          </div>

          {/* Dynamic Status Indicator */}
          <div className={`absolute bottom-36 md:bottom-36 left-1/3 transform -translate-x-1/2 animate-slide-up transition-opacity duration-500 z-30 ${showStatusIndicator ? 'opacity-100' : 'opacity-0'}`}>
                <div className={`
                  flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md border shadow-xl transition-all duration-300
                  ${isEnding 
                      ? 'bg-indigo-500/20 border-indigo-500/30' 
                      : isAISpeaking 
                          ? 'bg-blue-600/40 border-blue-400/50 scale-105' 
                          : 'bg-green-600/40 border-green-400/50' 
                  }
                `}>
                  {isEnding ? (
                        <>
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                          <span className="text-white font-semibold tracking-wide text-sm whitespace-nowrap">Rapor Oluşturuluyor...</span>
                        </>
                  ) : isAISpeaking ? (
                        <>
                            <div className="flex space-x-1">
                              <div className="w-1 h-3 bg-blue-300 rounded-full animate-pulse"></div>
                              <div className="w-1 h-4 bg-blue-300 rounded-full animate-pulse delay-75"></div>
                              <div className="w-1 h-3 bg-blue-300 rounded-full animate-pulse"></div>
                          </div>
                          <span className="text-blue-100 font-semibold text-sm tracking-wide drop-shadow-md">Uzman Konuşuyor...</span>
                        </>
                  ) : (
                        <>
                          <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-100"></div>
                          </div>
                          <span className="text-white font-semibold text-sm tracking-wide drop-shadow-md">Sıra Sende</span>
                        </>
                  )}
                </div>
          </div>

          {/* Video Feed */}
          <div className="absolute top-6 right-6 w-32 md:w-48 aspect-[4/3] rounded-xl overflow-hidden border-2 border-white/10 shadow-2xl bg-black animate-slide-down z-40">
              <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className={`w-full h-full object-cover transform scale-x-[-1] ${!isVideoEnabled ? 'hidden' : ''}`}
              />
              {!isVideoEnabled && (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 bg-slate-900">
                      Kamera Kapalı
                  </div>
              )}
          </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Controls Bar - Positioned Absolute at Bottom */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-0 px-4">
        <SessionControls 
          isActive={isActive}
          status={status}
          isMuted={isMuted}
          isVideoEnabled={isVideoEnabled}
          isEnding={isEnding}
          onToggleMic={toggleMic}
          onToggleVideo={toggleVideo}
          onEndSession={handleManualEnd}
        />
      </div>
      
      <style>{`
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
        .animate-progress { animation: progress 2s ease-in-out infinite; }
        .animate-slide-down { animation: slideDown 0.8s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.8s ease-out forwards; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};