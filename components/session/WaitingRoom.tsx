import React from 'react';
import { AvatarId } from '../../types';

interface WaitingRoomProps {
  onConnect: () => void;
  avatarId: AvatarId;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({ onConnect, avatarId }) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col h-full overflow-y-auto md:overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 min-h-full md:pb-6">
        <div className="flex flex-col items-center justify-center space-y-6 md:space-y-5 animate-fade-in-up w-full max-w-md">
            
            {/* Visual Avatar Preview */}
            <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse"></div>
                <div className="w-full h-full rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden relative shadow-2xl">
                        <div className="absolute inset-0 flex items-center justify-center text-5xl md:text-6xl">
                        {avatarId === 'female' ? '👩‍💼' : '👨‍💼'}
                        </div>
                </div>
            </div>
            
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Mülakat Odası Hazır</h2>
                <p className="text-slate-400 text-base md:text-lg">Kamera ve mikrofonunuzun hazır olduğundan emin olun.</p>
            </div>

            {/* Spacer only for mobile, hidden on desktop to save space */}
            <div className="h-4 md:hidden"></div>

            <button 
                onClick={onConnect}
                className="group relative w-full md:w-auto px-8 py-4 bg-white text-black font-bold rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative flex items-center justify-center gap-3 text-lg group-hover:text-white transition-colors">
                        <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                        BAĞLAN VE BAŞLAT
                    </span>
            </button>

            <p className="text-xs text-slate-600 mt-2 text-center max-w-xs">
              "Bağlan" butonuna tıkladığınızda tarayıcınız mikrofon ve kamera izni isteyecektir.
            </p>
        </div>
      </div>
    </div>
  );
};