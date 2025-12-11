import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessions, Session } from '../services/dashboardApi';
import DashboardLayout from '../components/DashboardLayout';

export default function SessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await getSessions(50);
      setSessions(data.sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Session['status']) => {
    const styles = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      active: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      expired: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    const labels = {
      pending: 'Beklemede',
      active: 'Aktif',
      completed: 'Tamamlandı',
      expired: 'Süresi Doldu',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-400 font-mono text-sm animate-pulse">MÜLAKATLAR YÜKLENİYOR...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Mülakatlar</h1>
            <p className="text-xs text-slate-400 mt-1">Tüm mülakat kayıtları ve durumları</p>
          </div>
          <div className="text-xs text-white bg-white/5 px-4 py-2 rounded-lg border border-white/10 font-bold">
            Toplam: <span className="text-cyan-400">{sessions.length}</span>
          </div>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="bg-white/5 rounded-2xl border border-white/10 border-dashed p-16 text-center backdrop-blur-sm">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Henüz mülakat yok</h3>
            <p className="text-sm text-slate-400">API key'inizi kullanarak ilk mülakatınızı oluşturun</p>
          </div>
        ) : (
          <div className="bg-white/5 rounded-2xl border border-white/10 shadow-xl overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/20 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Session ID / Ref
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Durum
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                      Süre
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Oluşturulma
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Bitiş
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sessions.map((session) => (
                    <tr key={session.token} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">{session.external_id || 'N/A'}</span>
                          <span className="text-[10px] text-slate-500 font-mono mt-1">{session.token.slice(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(session.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-xs text-slate-300">
                          {session.duration_minutes > 0 ? (
                            <>
                              <span className="font-mono font-bold text-cyan-400">{session.duration_minutes.toFixed(1)}</span>
                              <span className="text-[10px] text-slate-500">dk</span>
                            </>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(session.created_at).toLocaleString('tr-TR', { 
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {session.completed_at
                          ? new Date(session.completed_at).toLocaleString('tr-TR', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })
                          : <span className="text-slate-600">-</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => navigate(`/dashboard/sessions/${session.token}`)}
                           className="text-slate-500 hover:text-white transition-all p-2 rounded-lg hover:bg-cyan-500/20 group-hover:scale-110"
                           title="Detayları Görüntüle"
                         >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Placeholder */}
            <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex items-center justify-between">
               <div className="text-[10px] text-slate-500 font-medium">
                 1-{sessions.length} gösteriliyor
               </div>
               <div className="flex gap-2">
                 <button className="p-2 rounded-lg hover:bg-white/5 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent" disabled>
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                   </svg>
                 </button>
                 <button className="p-2 rounded-lg hover:bg-white/5 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent" disabled>
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                   </svg>
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
