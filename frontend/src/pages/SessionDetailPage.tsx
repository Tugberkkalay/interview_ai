import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionDetail, SessionDetail } from '../services/dashboardApi';
import DashboardLayout from '../components/DashboardLayout';

export default function SessionDetailPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadSessionDetail();
    }
  }, [token]);

  const loadSessionDetail = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const data = await getSessionDetail(token);
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Session detayları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: SessionDetail['status']) => {
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
      <span className={`inline-flex items-center px-4 py-1.5 rounded-lg text-xs font-bold border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            <p className="text-slate-400 font-mono text-sm animate-pulse">DETAYLAR YÜKLENİYOR...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !session) {
    return (
      <DashboardLayout>
        <div className="bg-red-500/5 rounded-2xl border border-red-500/10 p-12 text-center backdrop-blur-sm">
          <div className="text-red-400 mb-6">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Hata</h3>
          <p className="text-sm text-slate-400 mb-6">{error || 'Session bulunamadı'}</p>
          <button
            onClick={() => navigate('/dashboard/sessions')}
            className="px-6 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold"
          >
            Geri Dön
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/dashboard/sessions')}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-2 transition-colors group"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Mülakatlara Dön
            </button>
            <h1 className="text-2xl font-black text-white tracking-tight">Session Detayları</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">Token: {session.token}</p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(session.status)}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            {/* Session Info */}
            <div className="bg-white/5 rounded-2xl border border-white/10 shadow-xl p-6 backdrop-blur-sm">
              <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-white/5 pb-2">Session Bilgileri</h2>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">External ID</label>
                  <p className="text-sm text-white mt-1.5">{session.external_id || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Token</label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-xs text-cyan-400 font-mono bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg flex-1">{session.token}</p>
                    <button
                      onClick={() => copyToClipboard(session.token)}
                      className="p-1.5 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-lg hover:bg-white/10"
                      title="Kopyala"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interview Link</label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <a
                      href={session.interview_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 underline flex-1 truncate"
                    >
                      {session.interview_link}
                    </a>
                    <button
                      onClick={() => copyToClipboard(session.interview_link)}
                      className="p-1.5 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-lg hover:bg-white/10"
                      title="Kopyala"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Süre</label>
                  <p className="text-sm text-white mt-1.5 font-mono">
                    {session.duration_minutes > 0 
                      ? `${session.duration_minutes.toFixed(1)} dakika (${session.duration_seconds} saniye)`
                      : 'Henüz başlamadı'}
                  </p>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white/5 rounded-2xl border border-white/10 shadow-xl p-6 backdrop-blur-sm">
              <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-white/5 pb-2">Zaman Bilgileri</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Oluşturulma</label>
                  <p className="text-xs text-slate-300 font-mono">{formatDate(session.created_at)}</p>
                </div>
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Son Güncelleme</label>
                  <p className="text-xs text-slate-300 font-mono">{formatDate(session.updated_at)}</p>
                </div>
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">İlk Erişim</label>
                  <p className="text-xs text-slate-300 font-mono">{formatDate(session.accessed_at)}</p>
                </div>
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tamamlanma</label>
                  <p className="text-xs text-slate-300 font-mono">{formatDate(session.completed_at)}</p>
                </div>
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Son Kullanma</label>
                  <p className="text-xs text-slate-300 font-mono">{formatDate(session.expires_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - ATS & Webhook Info */}
          <div className="space-y-6">
            {/* ATS Integration */}
            <div className="bg-white/5 rounded-2xl border border-white/10 shadow-xl p-6 backdrop-blur-sm">
              <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-white/5 pb-2">ATS Entegrasyonu</h2>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Endpoint</label>
                  <p className="text-xs text-slate-300 mt-1.5 font-mono bg-black/30 border border-white/5 px-3 py-2 rounded-lg break-all">
                    {session.ats_data_endpoint || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Webhook URL</label>
                  <p className="text-xs text-slate-300 mt-1.5 font-mono bg-black/30 border border-white/5 px-3 py-2 rounded-lg break-all">
                    {session.ats_webhook_url || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">API Token</label>
                  <p className="text-xs text-slate-300 mt-1.5 font-mono bg-black/30 border border-white/5 px-3 py-2 rounded-lg">
                    {session.ats_api_token_masked || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Webhook Status */}
            <div className="bg-white/5 rounded-2xl border border-white/10 shadow-xl p-6 backdrop-blur-sm">
              <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-white/5 pb-2">Webhook Durumu</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Retry Sayısı</label>
                  <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-2 h-2 rounded-full ${i < session.webhook_retry_count ? 'bg-amber-500' : 'bg-white/10'}`}
                          ></div>
                      ))}
                      <span className="text-xs text-slate-400 ml-2">{session.webhook_retry_count}/5</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Son Deneme</label>
                  <p className="text-xs text-slate-300 font-mono">{formatDate(session.last_webhook_attempt)}</p>
                </div>
                {session.webhook_last_error && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Son Hata</label>
                    <p className="text-xs text-red-400 font-mono bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg break-all">
                      {session.webhook_last_error}
                    </p>
                  </div>
                )}
                {session.has_temp_report && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Geçici Rapor</label>
                    <p className="text-xs text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
                      Mevcut (Süre: {formatDate(session.temp_report_expires_at)})
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Flags */}
            <div className="bg-white/5 rounded-2xl border border-white/10 shadow-xl p-6 backdrop-blur-sm">
              <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider border-b border-white/5 pb-2">Durum</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Süresi Dolmuş</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${session.is_expired ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {session.is_expired ? 'EVET' : 'HAYIR'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Erişilebilir</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${session.is_accessible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {session.is_accessible ? 'EVET' : 'HAYIR'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
