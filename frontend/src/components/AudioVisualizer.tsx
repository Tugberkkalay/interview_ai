import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyser, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!analyser || !isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    if (!dataArrayRef.current) {
      dataArrayRef.current = new Uint8Array(bufferLength);
    }

    // Vapi.ai style color palette
    const colors = [
      '#FFFFFF', // White
      '#60A5FA', // Blue
      '#A78BFA', // Purple
      '#34D399', // Green
      '#FBBF24', // Yellow
      '#FB923C', // Orange
      '#F472B6', // Pink
      '#22D3EE', // Cyan
    ];

    const draw = () => {
      if (!analyser || !isActive || !canvas || !ctx) return;

      requestRef.current = requestAnimationFrame(draw);

      // Set canvas size on each frame (responsive)
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }

      analyser.getByteFrequencyData(dataArrayRef.current!);

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Configuration for Vapi.ai look
      const barCount = 32; // Fewer bars for wider look
      const gapRatio = 0.4; // Space between bars
      const totalWidth = rect.width;
      const totalGap = totalWidth * 0.1; // 10% total padding
      const usableWidth = totalWidth - totalGap;
      const barWidth = usableWidth / barCount;
      const gap = barWidth * gapRatio;
      const actualBarWidth = barWidth - gap;
      
      const segmentHeight = 8; // Height of each pill segment
      const segmentGap = 4; // Vertical gap between segments
      const maxSegments = Math.floor(rect.height / (segmentHeight + segmentGap));

      // Draw bars
      for (let i = 0; i < barCount; i++) {
        // Map frequency data to bars (skip lower frequencies for cleaner look)
        const dataIndex = Math.floor(i * (bufferLength / barCount) * 0.8); 
        const value = dataArrayRef.current![dataIndex];
        
        // Normalize value and add some base height
        const normalizedHeight = (value / 255);
        const activeSegments = Math.max(1, Math.floor(normalizedHeight * maxSegments));

        // Use a consistent color for each bar position
        const color = colors[i % colors.length];
        ctx.fillStyle = color;

        const x = (totalGap / 2) + i * barWidth;

        // Draw segments from bottom up
        for (let j = 0; j < activeSegments; j++) {
          const y = rect.height - (j + 1) * (segmentHeight + segmentGap);
          
          // Draw rounded pill segment
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, actualBarWidth, segmentHeight, segmentHeight / 2);
          } else {
            // Fallback
            ctx.fillRect(x, y, actualBarWidth, segmentHeight);
          }
          ctx.fill();
        }
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [analyser, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
    />
  );
};
