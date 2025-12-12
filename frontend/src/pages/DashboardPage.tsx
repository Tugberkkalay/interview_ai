import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats, getUsageChart, DashboardStats, DailyUsage } from '../services/dashboardApi';
import DashboardLayout from '../components/DashboardLayout.tsx';

export default function DashboardPage() {
  const { company } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<DailyUsage[]>([]);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadChartData();
  }, [chartPeriod]);

  const loadDashboardData = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async () => {
    try {
      const data = await getUsageChart(chartPeriod);
      setChartData(data);
    } catch (error) {
      console.error('Failed to load chart:', error);
    }
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
            <p className="text-slate-400 font-mono text-sm animate-pulse">VERİLER YÜKLENİYOR...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Genel Bakış</h1>
        <p className="text-slate-400">Hoşgeldiniz, {company?.company_name}. İşte güncel durum raporunuz.</p>
      </div>

      {/* KPI Cards - Compact Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="TOPLAM MÜLAKAT"
            value={stats.total_sessions}
            trend="+12%"
            trendUp={true}
            icon={
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            bg="bg-cyan-500/10 border-cyan-500/20"
            text="text-cyan-400"
          />
          <StatCard
            title="TAMAMLANAN"
            value={stats.completed_sessions}
            trend="+5%"
            trendUp={true}
            icon={
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            bg="bg-emerald-500/10 border-emerald-500/20"
            text="text-emerald-400"
          />
          <StatCard
            title="AKTİF OTURUM"
            value={stats.active_sessions}
            trend="Stabil"
            trendUp={true}
            icon={
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            bg="bg-amber-500/10 border-amber-500/20"
            text="text-amber-400"
          />
          <StatCard
            title="ORT. SÜRE"
            value={`${stats.average_duration_minutes.toFixed(1)} dk`}
            trend="-2%"
            trendUp={false}
            icon={
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            bg="bg-purple-500/10 border-purple-500/20"
            text="text-purple-400"
          />
        </div>
      )}

      {/* Usage Chart */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Mülakat Aktivitesi</h2>
                <p className="text-xs text-slate-400">Zaman içindeki kullanım yoğunluğu</p>
              </div>
              <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                <button
                  onClick={() => setChartPeriod('week')}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    chartPeriod === 'week'
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Haftalık
                </button>
                <button
                  onClick={() => setChartPeriod('month')}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    chartPeriod === 'month'
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Aylık
                </button>
              </div>
            </div>

            <div className="h-64 flex items-end justify-between gap-2 md:gap-4 px-2">
              {chartData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-sm text-slate-500 border border-dashed border-white/10 rounded-xl">
                  Veri bulunamadı
                </div>
              ) : (
                chartData.map((day, idx) => {
                  const maxVal = Math.max(...chartData.map(d => d.count), 5); // min 5 for scale
                  const heightPercent = maxVal > 0 ? (day.count / maxVal) * 100 : 0;
                  
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 transform translate-y-2 group-hover:translate-y-0">
                        <div className="bg-slate-800 border border-white/10 text-white text-[10px] font-bold rounded-lg py-1.5 px-3 whitespace-nowrap shadow-xl">
                          {day.count} Mülakat
                        </div>
                        {/* Triangle */}
                        <div className="w-2 h-2 bg-slate-800 border-r border-b border-white/10 transform rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
                      </div>

                      <div 
                        className="w-full max-w-[40px] bg-white/5 rounded-t-lg transition-all duration-300 group-hover:bg-white/10 relative overflow-hidden"
                        style={{ height: '100%' }}
                      >
                         <div 
                            className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all duration-500 rounded-t-lg opacity-80 group-hover:opacity-100 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]" 
                            style={{ height: `${Math.max(heightPercent, 4)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-3 font-mono font-medium truncate w-full text-center group-hover:text-cyan-400 transition-colors">
                        {new Date(day.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }).split(' ').join(' ')}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
  bg: string;
  text: string;
}

function StatCard({ title, value, trend, trendUp, icon, bg, text }: StatCardProps) {
  return (
    <div className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all group backdrop-blur-sm">
      <div className="flex items-start justify-between mb-4">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
        <div className={`p-2 rounded-lg border ${bg} transition-colors group-hover:scale-110 duration-300`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-3">
          <h3 className="text-2xl font-black text-white leading-none">{value}</h3>
          <div className="mb-0.5 flex items-center gap-1.5 bg-black/20 px-1.5 py-0.5 rounded">
            <span className={`text-[10px] font-bold ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
            </span>
          </div>
      </div>
    </div>
  );
}
