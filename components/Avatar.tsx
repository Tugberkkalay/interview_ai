import React, { useEffect, useRef } from 'react';
import { AvatarId } from '../types';

interface AvatarProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
  avatarId: AvatarId;
}

export const Avatar: React.FC<AvatarProps> = ({ analyser, isActive, avatarId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  // Animation Refs
  const angleRef = useRef(0);
  const pulseRef = useRef(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 1. Audio Data Analysis
    let vol = 0;
    if (analyser && isActive) {
        if (!dataArrayRef.current) dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArrayRef.current);
        
        let sum = 0;
        // Focus on speech frequencies
        const start = Math.floor(analyser.frequencyBinCount * 0.1);
        const end = Math.floor(analyser.frequencyBinCount * 0.5);
        for(let i = start; i < end; i++) { sum += dataArrayRef.current[i]; }
        vol = (sum / (end - start)) / 255; // Normalized 0-1
    }

    // 2. Clear & Background
    ctx.clearRect(0, 0, width, height);
    
    // Subtle gradient background
    const bgGrad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
    bgGrad.addColorStop(0, '#1e293b');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    // Theme Colors
    const primaryColor = avatarId === 'female' ? '236, 72, 153' : '59, 130, 246'; // Pink-500 or Blue-500
    const secondaryColor = avatarId === 'female' ? '168, 85, 247' : '6, 182, 212'; // Purple-500 or Cyan-500

    // 3. Main Core (Pulsing)
    pulseRef.current += 0.02;
    const idlePulse = Math.sin(pulseRef.current) * 5;
    const talkingPulse = vol * 30;
    const radius = 60 + idlePulse + talkingPulse;

    // Outer Glow
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 2);
    glow.addColorStop(0, `rgba(${primaryColor}, 0.8)`);
    glow.addColorStop(0.5, `rgba(${primaryColor}, 0.2)`);
    glow.addColorStop(1, `rgba(${primaryColor}, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Solid Core
    ctx.fillStyle = `rgba(${primaryColor}, 0.9)`;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner bright spot
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 4. Rotating Tech Rings
    angleRef.current += 0.005 + (vol * 0.05); // Spin faster when talking

    ctx.save();
    ctx.translate(cx, cy);

    // Ring 1 (Dashed)
    ctx.rotate(angleRef.current);
    ctx.strokeStyle = `rgba(${secondaryColor}, 0.6)`;
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 10]);
    ctx.beginPath();
    ctx.arc(0, 0, radius + 40, 0, Math.PI * 2);
    ctx.stroke();

    // Ring 2 (Solid arc)
    ctx.rotate(angleRef.current * -1.5); // Opposite spin
    ctx.strokeStyle = `rgba(${primaryColor}, 0.4)`;
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(0, 0, radius + 60, 0, Math.PI * 1.5);
    ctx.stroke();

    ctx.restore();

    // 5. Audio Waveform (Circular)
    if (dataArrayRef.current) {
        ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const bufferLength = dataArrayRef.current.length;
        const step = Math.floor(bufferLength / 100) || 1; 
        
        for (let i = 0; i < bufferLength; i += step) {
             const v = dataArrayRef.current[i] / 128.0;
             const r = (radius + 80) + (v * 20 * vol);
             const angle = (i / bufferLength) * Math.PI * 2 + angleRef.current;
             const x = cx + Math.cos(angle) * r;
             const y = cy + Math.sin(angle) * r;
             
             if (i === 0) ctx.moveTo(x, y);
             else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }
  };

  const animate = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
         // Handle DPI scaling
         const dpr = window.devicePixelRatio || 1;
         const rect = canvas.getBoundingClientRect();
         
         // Only resize if dimensions changed
         if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
         }
         
         ctx.save();
         ctx.scale(dpr, dpr);
         draw(ctx, rect.width, rect.height);
         ctx.restore();
      }
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isActive, analyser, avatarId]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-900">
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {/* Decorative Overlay */}
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <span className={`text-[10px] font-mono tracking-[0.3em] uppercase opacity-60 ${avatarId === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
              AI • {avatarId === 'female' ? 'ZEYNEP' : 'MERT'} • CONNECTED
          </span>
      </div>
    </div>
  );
};