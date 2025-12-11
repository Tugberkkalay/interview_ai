import React from 'react';
import { AvatarId } from '../../types';

interface WaitingRoomProps {
  onConnect: () => void;
  avatarId: AvatarId;
  isRequestingPermissions?: boolean;
  permissionsError?: string | null;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({ 
  onConnect, 
  avatarId, 
  isRequestingPermissions = false,
  permissionsError = null 
}) => {
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
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {isRequestingPermissions ? 'İzinler Alınıyor...' : 'Mülakat Odası Hazır'}
                </h2>
                <p className="text-slate-400 text-base md:text-lg">
                  {isRequestingPermissions 
                    ? 'Kamera ve mikrofon izinleri alınıyor...' 
                    : 'Kamera ve mikrofonunuzun hazır olduğundan emin olun.'}
                </p>
            </div>

            {/* Error Message */}
            {permissionsError && (
              <div className="w-full max-w-md p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm text-center">{permissionsError}</p>
              </div>
            )}

            {/* Spacer only for mobile, hidden on desktop to save space */}
            <div className="h-4 md:hidden"></div>

            <button 
                onClick={onConnect}
                disabled={isRequestingPermissions || !!permissionsError}
                className={`group relative w-full md:w-auto px-8 py-4 font-bold rounded-2xl overflow-hidden transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] ${
                  isRequestingPermissions || permissionsError
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-black hover:scale-105 active:scale-95'
                }`}
            >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative flex items-center justify-center gap-3 text-lg group-hover:text-white transition-colors">
                        {isRequestingPermissions ? (
                          <>
                            <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                            İZİNLER ALINIYOR...
                          </>
                        ) : permissionsError ? (
                          <>
                            <span className="text-red-400">⚠️</span>
                            İZİN HATASI
                          </>
                        ) : (
                          <>
                            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                            BAĞLAN VE BAŞLAT
                          </>
                        )}
                    </span>
            </button>

            {!isRequestingPermissions && !permissionsError && (
              <p className="text-xs text-slate-600 mt-2 text-center max-w-xs">
                İzinler alındı. "Bağlan" butonuna tıklayarak mülakatı başlatabilirsiniz.
              </p>
            )}
        </div>
      </div>
    </div>
  );
};