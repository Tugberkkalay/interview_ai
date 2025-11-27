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
  
  // Animation State Refs
  const blinkState = useRef({ isBlinking: false, startTime: 0, duration: 150 });
  const lastBlinkTime = useRef(Date.now());
  const visualVolume = useRef(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  
  // Idle Animation Refs
  const swayOffset = useRef(0);
  const swayTarget = useRef(0);
  const breathingPhase = useRef(0);

  // --- Drawing Helpers ---

  const drawOfficeBackground = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // 1. Base Wall (Modern Cool Grey)
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#f1f5f9'); 
    grd.addColorStop(1, '#cbd5e1'); 
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // 2. Glass Partition / Window
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.moveTo(w * 0.75, 0);
    ctx.lineTo(w * 0.95, h);
    ctx.lineTo(w, h);
    ctx.lineTo(w, 0);
    ctx.fill();

    // 3. Subtle Bokeh (Office vibe)
    const drawBokeh = (x: number, y: number, r: number, color: string) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    };

    drawBokeh(w * 0.15, h * 0.35, h * 0.1, 'rgba(148, 163, 184, 0.2)');
    drawBokeh(w * 0.85, h * 0.6, h * 0.2, 'rgba(50, 205, 50, 0.03)'); // Plant hint
  };

  const drawSkinGradient = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
      const grad = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.1, x, y, r);
      if (avatarId === 'female') {
        // Mature skin tone
        grad.addColorStop(0, '#fce4ec'); 
        grad.addColorStop(0.5, '#eec0c8'); 
        grad.addColorStop(1, '#dfa0a8'); 
      } else {
        grad.addColorStop(0, '#ffdec8'); 
        grad.addColorStop(0.4, '#eac09e'); 
        grad.addColorStop(1, '#c09878'); 
      }
      return grad;
  };

  const drawAvatar = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const t = Date.now();
    const scale = Math.min(width, height) / 400;
    const cx = width / 2;
    
    // Breathing & Sway
    breathingPhase.current += 0.025;
    const breatheY = Math.sin(breathingPhase.current) * 1.5 * scale;
    
    if (Math.abs(swayTarget.current - swayOffset.current) < 0.01) {
        swayTarget.current = (Math.random() - 0.5) * 5 * scale; 
    }
    swayOffset.current += (swayTarget.current - swayOffset.current) * 0.015;
    
    const cy = height / 2 + 25 * scale + breatheY;
    const headX = cx + swayOffset.current;

    // --- 1. Background ---
    drawOfficeBackground(ctx, width, height);

    // --- 2. Clothing (Professional Shirt & Jacket) ---
    ctx.save();
    
    const shoulderY = cy + 130 * scale;
    const jacketColor = avatarId === 'female' ? '#2c3e50' : '#334155'; // Dark Navy/Charcoal
    
    // Jacket Base (Shoulders)
    ctx.fillStyle = jacketColor;
    ctx.beginPath();
    ctx.moveTo(headX, cy + 85 * scale);
    ctx.quadraticCurveTo(headX - 70 * scale, cy + 95 * scale, headX - 165 * scale, shoulderY); // Shoulder L
    ctx.lineTo(headX - 165 * scale, height);
    ctx.lineTo(headX + 165 * scale, height);
    ctx.lineTo(headX + 165 * scale, shoulderY); // Shoulder R
    ctx.quadraticCurveTo(headX + 70 * scale, cy + 95 * scale, headX, cy + 85 * scale);
    ctx.fill();

    // Shirt (Crisp White/Light Blue)
    ctx.fillStyle = '#f0f4f8'; 
    ctx.beginPath();
    ctx.moveTo(headX, cy + 85 * scale);
    if (avatarId === 'female') {
        // Collared Shirt open at top
        ctx.lineTo(headX - 30 * scale, cy + 160 * scale);
        ctx.lineTo(headX + 30 * scale, cy + 160 * scale);
    } else {
        ctx.lineTo(headX - 40 * scale, cy + 150 * scale);
        ctx.lineTo(headX + 40 * scale, cy + 150 * scale);
    }
    ctx.fill();

    // Jacket Lapels
    ctx.fillStyle = '#1e293b'; // Slightly darker for contrast
    ctx.beginPath();
    if (avatarId === 'female') {
        // Modern Sharp Lapel
        ctx.moveTo(headX - 60 * scale, cy + 100 * scale);
        ctx.lineTo(headX - 25 * scale, cy + 190 * scale); // Button point
        ctx.lineTo(headX - 80 * scale, cy + 220 * scale);
        
        ctx.moveTo(headX + 60 * scale, cy + 100 * scale);
        ctx.lineTo(headX + 25 * scale, cy + 190 * scale);
        ctx.lineTo(headX + 80 * scale, cy + 220 * scale);
    } else {
        ctx.moveTo(headX - 60 * scale, cy + 120 * scale);
        ctx.lineTo(headX - 20 * scale, cy + 220 * scale);
        ctx.lineTo(headX - 90 * scale, cy + 240 * scale);
        ctx.moveTo(headX + 60 * scale, cy + 120 * scale);
        ctx.lineTo(headX + 20 * scale, cy + 220 * scale);
        ctx.lineTo(headX + 90 * scale, cy + 240 * scale);
    }
    ctx.fill();

    // Neck
    const neckW = 48 * scale;
    ctx.fillStyle = drawSkinGradient(ctx, headX, cy + 60 * scale, 50 * scale);
    ctx.beginPath();
    ctx.moveTo(headX - neckW/2, cy + 30 * scale);
    ctx.lineTo(headX - neckW/2, cy + 100 * scale);
    ctx.quadraticCurveTo(headX, cy + 110 * scale, headX + neckW/2, cy + 100 * scale);
    ctx.lineTo(headX + neckW/2, cy + 30 * scale);
    ctx.fill();

    // Neck Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.arc(headX, cy + 90 * scale, 25 * scale, 0, Math.PI, false);
    ctx.fill();

    ctx.restore();

    // --- 3. HAIR (BACK / BUN) ---
    // Draw this BEFORE the head so it looks like it's behind.
    const hairColor = avatarId === 'female' ? '#3e2723' : '#0f172a'; // Dark Brown vs Black
    
    if (avatarId === 'female') {
        ctx.fillStyle = hairColor;
        // The Bun (Topuz) - High on the head
        ctx.beginPath();
        ctx.arc(headX, cy - 85 * scale, 45 * scale, 0, Math.PI * 2); 
        ctx.fill();
        
        // Pulled back hair sides (silhouette behind ears)
        ctx.beginPath();
        ctx.moveTo(headX - 85 * scale, cy - 20 * scale);
        ctx.quadraticCurveTo(headX - 95 * scale, cy + 40 * scale, headX - 60 * scale, cy + 80 * scale); // Left nape
        ctx.lineTo(headX + 60 * scale, cy + 80 * scale);
        ctx.quadraticCurveTo(headX + 95 * scale, cy + 40 * scale, headX + 85 * scale, cy - 20 * scale); // Right nape
        ctx.fill();
    }

    // --- 4. Head Shape ---
    
    const faceW = 90 * scale;
    const faceH = 110 * scale;
    ctx.fillStyle = drawSkinGradient(ctx, headX, cy, faceW);
    ctx.beginPath();
    
    // Jawline
    if (avatarId === 'male') {
        ctx.moveTo(headX - faceW * 0.9, cy - faceH * 0.5);
        ctx.lineTo(headX - faceW * 0.85, cy + faceH * 0.6); 
        ctx.quadraticCurveTo(headX, cy + faceH * 1.05, headX + faceW * 0.85, cy + faceH * 0.6); 
        ctx.lineTo(headX + faceW * 0.9, cy - faceH * 0.5);
    } else {
        // Female: Mature, defined jaw but elegant
        ctx.moveTo(headX - faceW * 0.9, cy - faceH * 0.6);
        ctx.quadraticCurveTo(headX - faceW * 0.88, cy + faceH * 0.5, headX, cy + faceH * 0.95); 
        ctx.quadraticCurveTo(headX + faceW * 0.88, cy + faceH * 0.5, headX + faceW * 0.9, cy - faceH * 0.6);
    }
    // Top of head (Scalp area - crucial for not looking bald)
    // Draw a full rounded top for the skull
    ctx.bezierCurveTo(headX + faceW * 0.9, cy - faceH * 1.4, headX - faceW * 0.9, cy - faceH * 1.4, headX - faceW * 0.9, cy - faceH * 0.6);
    ctx.fill();


    // --- 5. HAIR (SCALP / PULLED BACK) ---
    // This covers the forehead/top of head skin to fix "baldness"
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    if (avatarId === 'female') {
        // Hairline for pulled back hair
        ctx.moveTo(headX - faceW * 0.9, cy - faceH * 0.5); // Left temple
        // Hairline shape across forehead
        ctx.bezierCurveTo(headX - faceW * 0.6, cy - faceH * 0.85, headX + faceW * 0.6, cy - faceH * 0.85, headX + faceW * 0.9, cy - faceH * 0.5); // Right temple
        // Top of head curve (matching skull)
        ctx.bezierCurveTo(headX + faceW, cy - faceH * 1.5, headX - faceW, cy - faceH * 1.5, headX - faceW * 0.9, cy - faceH * 0.5);
        ctx.fill();
        
        // Grey streaks for age (40s) - Subtle
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(headX - 60 * scale, cy - 80 * scale);
        ctx.quadraticCurveTo(headX - 40 * scale, cy - 120 * scale, headX, cy - 130 * scale);
        ctx.stroke();
    } else {
        // Male Short Hair
        ctx.moveTo(headX - 90 * scale, cy - 30 * scale);
        ctx.quadraticCurveTo(headX - 70 * scale, cy - 110 * scale, headX, cy - 115 * scale);
        ctx.quadraticCurveTo(headX + 70 * scale, cy - 110 * scale, headX + 90 * scale, cy - 30 * scale);
        ctx.quadraticCurveTo(headX + 60 * scale, cy - 70 * scale, headX + 40 * scale, cy - 85 * scale);
        ctx.quadraticCurveTo(headX, cy - 80 * scale, headX - 40 * scale, cy - 85 * scale);
        ctx.quadraticCurveTo(headX - 60 * scale, cy - 70 * scale, headX - 90 * scale, cy - 30 * scale);
        ctx.fill();
    }


    // --- 6. Facial Features ---

    // Eyes
    if (!blinkState.current.isBlinking) {
        if (t - lastBlinkTime.current > 3000 + Math.random() * 4000) {
            blinkState.current.isBlinking = true;
            blinkState.current.startTime = t;
        }
    }
    let eyeOpen = 1;
    if (blinkState.current.isBlinking) {
        const p = (t - blinkState.current.startTime) / blinkState.current.duration;
        if (p >= 1) {
            blinkState.current.isBlinking = false;
            lastBlinkTime.current = t;
        } else {
            eyeOpen = Math.max(0, 1 - Math.sin(p * Math.PI) * 1.1);
        }
    }

    const drawEye = (ex: number, ey: number) => {
        const eyeW = 20 * scale;
        const eyeH = 11 * scale * eyeOpen;

        // Sclera
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(ex, ey, eyeW, eyeH, 0, 0, Math.PI * 2);
        ctx.fill();

        if (eyeOpen > 0.1) {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(ex, ey, eyeW, eyeH, 0, 0, Math.PI * 2);
            ctx.clip();

            // Iris
            ctx.fillStyle = avatarId === 'female' ? '#4e342e' : '#37474f';
            ctx.beginPath();
            ctx.arc(ex, ey, 9 * scale, 0, Math.PI * 2);
            ctx.fill();

            // Pupil
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(ex, ey, 4.5 * scale, 0, Math.PI * 2);
            ctx.fill();

            // Reflection
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.beginPath();
            ctx.arc(ex + 3 * scale, ey - 3 * scale, 2.5 * scale, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }

        // Makeup / Definition
        ctx.strokeStyle = '#2d2d2d';
        ctx.lineWidth = (avatarId === 'female' ? 1.5 : 1) * scale;
        ctx.beginPath();
        ctx.moveTo(ex - eyeW * 1.1, ey);
        ctx.quadraticCurveTo(ex, ey - eyeH * 1.4, ex + eyeW * 1.1, ey - 2*scale);
        ctx.stroke();

        // Slight lines under eyes for age (very subtle)
        if (avatarId === 'female') {
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 1 * scale;
            ctx.beginPath();
            ctx.moveTo(ex - eyeW * 0.5, ey + eyeH + 4 * scale);
            ctx.lineTo(ex + eyeW * 0.5, ey + eyeH + 5 * scale);
            ctx.stroke();
        }
    };

    drawEye(headX - 35 * scale, cy - 10 * scale);
    drawEye(headX + 35 * scale, cy - 10 * scale);

    // Brows
    ctx.strokeStyle = avatarId === 'female' ? '#3e2723' : '#263238';
    ctx.lineWidth = (avatarId === 'female' ? 2 : 3.5) * scale;
    ctx.lineCap = 'round';
    
    // Left Brow (Arched for professionalism)
    ctx.beginPath();
    ctx.moveTo(headX - 58 * scale, cy - 25 * scale);
    ctx.quadraticCurveTo(headX - 40 * scale, cy - 38 * scale, headX - 15 * scale, cy - 25 * scale);
    ctx.stroke();
    // Right Brow
    ctx.beginPath();
    ctx.moveTo(headX + 15 * scale, cy - 25 * scale);
    ctx.quadraticCurveTo(headX + 40 * scale, cy - 38 * scale, headX + 58 * scale, cy - 25 * scale);
    ctx.stroke();

    // Nose
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.moveTo(headX - 5 * scale, cy + 15 * scale);
    ctx.quadraticCurveTo(headX - 11 * scale, cy + 32 * scale, headX, cy + 36 * scale); 
    ctx.quadraticCurveTo(headX + 11 * scale, cy + 32 * scale, headX + 5 * scale, cy + 15 * scale);
    ctx.fill();

    // --- 7. GLASSES (Modern, Black Frames) ---
    if (avatarId === 'female') {
        const gx = headX;
        const gy = cy - 10 * scale;
        const lensW = 28 * scale;
        const lensH = 18 * scale;
        const frameColor = '#1a1a1a'; // Black frames

        ctx.strokeStyle = frameColor;
        ctx.lineWidth = 2.5 * scale;
        ctx.lineJoin = 'round';

        // Left Lens Frame
        ctx.beginPath();
        ctx.rect(gx - 35 * scale - lensW/2, gy - lensH/2, lensW, lensH);
        ctx.stroke();

        // Right Lens Frame
        ctx.beginPath();
        ctx.rect(gx + 35 * scale - lensW/2, gy - lensH/2, lensW, lensH);
        ctx.stroke();

        // Bridge
        ctx.beginPath();
        ctx.moveTo(gx - 35 * scale + lensW/2, gy);
        ctx.quadraticCurveTo(gx, gy - 5 * scale, gx + 35 * scale - lensW/2, gy);
        ctx.stroke();

        // Temples (Sides)
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(gx - 35 * scale - lensW/2, gy - 5*scale);
        ctx.lineTo(gx - faceW, gy - 10 * scale);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(gx + 35 * scale + lensW/2, gy - 5*scale);
        ctx.lineTo(gx + faceW, gy - 10 * scale);
        ctx.stroke();

        // Glass Reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.rect(gx - 35 * scale - lensW/2, gy - lensH/2, lensW, lensH);
        ctx.rect(gx + 35 * scale - lensW/2, gy - lensH/2, lensW, lensH);
        ctx.fill();
    }

    // --- 8. Mouth & Lip Sync ---
    
    let targetVol = 0;
    if (analyser && isActive) {
        if (!dataArrayRef.current) dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        let count = 0;
        for(let i = 5; i < 40; i++) { sum += dataArrayRef.current[i]; count++; }
        const avg = count > 0 ? sum / count : 0;
        targetVol = Math.max(0, (avg - 10) / 150);
    }
    visualVolume.current += (targetVol - visualVolume.current) * 0.4;
    const vol = Math.min(1, visualVolume.current * 1.1);

    const mouthY = cy + 55 * scale;
    const mouthW = 34 * scale + (vol * 4 * scale);
    const openH = vol * 20 * scale; 

    // Lip Colors - Professional Rose
    const lipColor = avatarId === 'female' ? '#bcaaa4' : '#dcb4a4'; 

    // Mouth Interior
    if (openH > 1 * scale) {
        ctx.fillStyle = '#4a2c2a';
        ctx.beginPath();
        ctx.moveTo(headX - mouthW/2, mouthY);
        ctx.quadraticCurveTo(headX, mouthY - 2*scale, headX + mouthW/2, mouthY);
        ctx.quadraticCurveTo(headX, mouthY + openH, headX - mouthW/2, mouthY);
        ctx.fill();
        // Teeth
        ctx.fillStyle = '#f5f5f5';
        ctx.beginPath();
        ctx.rect(headX - 8 * scale, mouthY, 16 * scale, 3 * scale);
        ctx.fill();
    } else {
        // Closed
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(headX - mouthW/2, mouthY);
        ctx.quadraticCurveTo(headX, mouthY + 2*scale, headX + mouthW/2, mouthY);
        ctx.stroke();
    }

    // Lips
    ctx.fillStyle = lipColor;
    // Top
    ctx.beginPath();
    ctx.moveTo(headX - mouthW/2 - 2*scale, mouthY); 
    ctx.quadraticCurveTo(headX, mouthY - 5 * scale - (openH * 0.1), headX + mouthW/2 + 2*scale, mouthY);
    ctx.quadraticCurveTo(headX, mouthY + 1 * scale, headX - mouthW/2 - 2*scale, mouthY);
    ctx.fill();
    // Bottom
    ctx.beginPath();
    ctx.moveTo(headX - mouthW/2, mouthY);
    ctx.quadraticCurveTo(headX, mouthY + 2*scale + (openH * 0.2), headX + mouthW/2, mouthY);
    ctx.quadraticCurveTo(headX, mouthY + 10*scale + openH * 0.7, headX - mouthW/2, mouthY);
    ctx.fill();
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
         const dpr = window.devicePixelRatio || 1;
         const rect = canvas.getBoundingClientRect();
         if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
             canvas.width = rect.width * dpr;
             canvas.height = rect.height * dpr;
         }
         drawAvatar(ctx, canvas.width, canvas.height);
      }
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, analyser, avatarId]); 

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%', maxHeight: '550px' }}
        className="object-contain" 
      />
    </div>
  );
};