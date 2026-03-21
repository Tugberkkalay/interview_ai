import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { regenerateApiKey, updateProfile, uploadLogo } from '../services/dashboardApi';
import DashboardLayout from '../components/DashboardLayout';

export default function SettingsPage() {
  const { company, refreshCompany } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'plan'>('general');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  
  // State for General Tab
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    website: '',
    phone: '',
  });
  
  // State for Logo
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // State for API Tab
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Sync data
  useEffect(() => {
    if (company) {
      setFormData({
        company_name: company.company_name || '',
        website: company.website || '',
        phone: company.phone || '',
      });
    }
  }, [company]);

  // --- Handlers for General ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    if (company) {
      setFormData({
        company_name: company.company_name || '',
        website: company.website || '',
        phone: company.phone || '',
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        company_name: formData.company_name,
        website: formData.website,
        phone: formData.phone,
      });
      await refreshCompany();
      setIsEditing(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Kaydetme hatası');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Lütfen resim dosyası seçin');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Logo dosyası 5MB\'dan büyük olamaz');
      return;
    }
    
    // Show preview immediately
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
    
    // Upload logo immediately
    setUploadingLogo(true);
    try {
      await uploadLogo(file);
      await refreshCompany();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Logo yükleme hatası');
      // Reset preview on error
      setLogoPreview(null);
      setLogoFile(null);
    } finally {
      setUploadingLogo(false);
    }
  };

  // --- Handlers for API ---
  const copyApiKey = () => {
    if (company?.api_key) {
      navigator.clipboard.writeText(company.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerateKey = async () => {
    if (!confirm('API key yenilenecek. Mevcut entegrasyonlarınız durabilir. Devam edilsin mi?')) return;
    setRegenerating(true);
    try {
      await regenerateApiKey();
      await refreshCompany();
      alert('Yeni API key oluşturuldu.');
    } catch (err) {
      alert('Hata oluştu');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            {/* Avatar / Initial */}
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-3xl font-black text-white">
                {company?.full_name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-white tracking-tight leading-none">{company?.full_name}</h1>
              <div className="flex items-center gap-1.5 mt-1.5 text-slate-400">
                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                 </svg>
                 <span className="text-sm font-medium">{company?.email}</span>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
             <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black bg-white/5 text-cyan-400 border border-white/10 tracking-widest uppercase">
                {company?.plan.toUpperCase()} PLAN
             </span>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-white/10">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'general', name: 'Genel Bilgiler', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { id: 'api', name: 'API ve Entegrasyon', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
              { id: 'plan', name: 'Abonelik', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200
                  ${activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-white hover:border-white/20'
                  }
                `}
              >
                <svg
                  className={`
                    -ml-0.5 mr-2 h-5 w-5
                    ${activeTab === tab.id ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}
                  `}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="bg-white/5 rounded-2xl shadow-xl border border-white/10 p-6 sm:p-8 backdrop-blur-sm">
              
              <div className="flex items-center justify-between mb-8">
            <div>
                  <h2 className="text-lg font-bold text-white">Şirket Profili</h2>
                  <p className="text-sm text-slate-400 mt-1">Logo ve şirket bilgilerinizi buradan yönetebilirsiniz.</p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center px-4 py-2 border border-white/10 shadow-sm text-sm font-bold rounded-xl text-white bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <svg className="-ml-1 mr-2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Düzenle
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-white/10 shadow-sm text-sm font-bold rounded-xl text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl shadow-sm text-black bg-cyan-400 hover:bg-cyan-300 transition-colors disabled:opacity-50"
                    >
                      {saving && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      Kaydet
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-8">
                {/* Left Column: Logo */}
                <div className="w-full sm:w-80 flex-shrink-0">
                  <div className="bg-black/30 rounded-2xl p-6 border border-white/5">
                    <label className="block text-xs font-bold text-slate-500 mb-4 text-center uppercase tracking-wider">Şirket Logosu</label>
                    <div className="relative group w-48 h-48 mx-auto">
                      <div className="w-full h-full rounded-2xl bg-black/40 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden hover:border-cyan-500/50 transition-colors shadow-inner">
                        {uploadingLogo ? (
                          <div className="text-center p-4">
                            <svg className="animate-spin mx-auto h-8 w-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-xs text-slate-400 mt-2">Yükleniyor...</p>
                          </div>
                        ) : logoPreview || company?.logo ? (
                          <img 
                            src={logoPreview || company?.logo || ''} 
                            alt="Logo" 
                            className="w-full h-full object-contain p-4"
                          />
                        ) : (
                          <div className="text-center p-4">
                             <svg className="mx-auto h-8 w-8 text-slate-600" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                             </svg>
                          </div>
                        )}
                        
                        {/* Hover Overlay for Upload */}
                        <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl backdrop-blur-sm">
                           <svg className="w-8 h-8 mb-1 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                           </svg>
                           <span className="text-xs font-bold uppercase tracking-wide">Değiştir</span>
                           <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                        </label>
                      </div>
                    </div>
                    <p className="text-[10px] text-center text-slate-500 mt-4 leading-relaxed">
                      Mülakat ekranında sol üst köşede görünür. <br/>
                      <span className="text-cyan-500 font-bold">Öneri: 1:1, PNG, Şeffaf</span>
                    </p>
                  </div>
                </div>

                {/* Right Column: Form Fields */}
                <div className="flex-1 min-w-0">
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Şirket Adı</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="company_name"
                          value={formData.company_name}
                          onChange={handleChange}
                          className="block w-full rounded-xl border-white/10 bg-black/30 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm py-3 px-4 border text-white placeholder:text-slate-600 focus:outline-none focus:bg-black/50 transition-colors"
                        />
                      ) : (
                        <div className="py-3 px-4 bg-white/5 rounded-xl text-white text-sm border border-transparent font-medium">
                          {formData.company_name}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Web Sitesi</label>
                      {isEditing ? (
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          className="block w-full rounded-xl border-white/10 bg-black/30 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm py-3 px-4 border text-white placeholder:text-slate-600 focus:outline-none focus:bg-black/50 transition-colors"
                          placeholder="https://"
                        />
                      ) : (
                        <div className="py-3 px-4 bg-white/5 rounded-xl text-white text-sm border border-transparent">
                          {formData.website || '-'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Telefon</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="block w-full rounded-xl border-white/10 bg-black/30 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm py-3 px-4 border text-white placeholder:text-slate-600 focus:outline-none focus:bg-black/50 transition-colors"
                        />
                      ) : (
                        <div className="py-3 px-4 bg-white/5 rounded-xl text-white text-sm border border-transparent">
                          {formData.phone || '-'}
                        </div>
                      )}
                    </div>
              </div>
            </div>
          </div>
        </div>
          )}

          {/* API TAB */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="bg-[#0a0f1e] rounded-2xl shadow-xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
            <div>
                      <h2 className="text-xl font-bold text-white">API Anahtarı</h2>
                      <p className="text-slate-400 text-sm mt-1">Bu anahtarı mülakat oluşturmak için kullanın.</p>
            </div>
            <button
              onClick={handleRegenerateKey}
              disabled={regenerating}
                      className="text-xs bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition font-bold border border-white/10"
            >
                      {regenerating ? 'Yenileniyor...' : 'YENİLE'}
            </button>
          </div>

                  <div className="mt-6 bg-black/40 rounded-xl p-4 border border-white/10 flex items-center justify-between gap-4">
                    <code className="font-mono text-sm text-emerald-400 truncate flex-1">
                      {showKey ? company?.api_key : '•'.repeat(32)}
                    </code>
                    <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowKey(!showKey)}
                        className="p-2 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white"
                        title={showKey ? "Gizle" : "Göster"}
                      >
                        {showKey ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                </button>
                <button
                  onClick={copyApiKey}
                        className="p-2 hover:bg-white/10 rounded-lg transition text-cyan-400 hover:text-cyan-300"
                        title="Kopyala"
                      >
                        {copied ? (
                          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                </button>
              </div>
            </div>

                  <div className="mt-4 flex gap-6 text-xs text-slate-500 font-mono">
                    <p>Oluşturulma: <span className="text-slate-300">{new Date(company?.api_key_created_at || '').toLocaleDateString()}</span></p>
                    <p>Son Kullanım: <span className="text-slate-300">{company?.api_key_last_used ? new Date(company.api_key_last_used).toLocaleDateString() : 'Henüz yok'}</span></p>
                  </div>
                </div>
              </div>

              {/* API Documentation */}
              <div className="space-y-6">
                {/* Quick Start */}
                <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-2xl shadow-lg border border-cyan-500/20 p-6 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                      <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-2">Hızlı Başlangıç</h3>
                      <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                        API anahtarınızı kullanarak mülakat session'ları oluşturabilirsiniz. Session oluşturduktan sonra adaylara gönderebileceğiniz bir link alırsınız.
                      </p>
                      <div className="bg-black/30 rounded-lg p-4 border border-white/5">
                        <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Endpoint</div>
                        <code className="text-sm font-mono text-cyan-400">POST /api/session/create/</code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Request Example */}
                <div className="bg-white/5 rounded-2xl shadow-xl border border-white/10 p-6 backdrop-blur-sm">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Request Örneği
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Headers</div>
                      <pre className="bg-black/30 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto border border-white/5 scrollbar-thin scrollbar-thumb-white/10">
{`Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`}
                      </pre>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Request Body</div>
                      <pre className="bg-black/30 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto border border-white/5 scrollbar-thin scrollbar-thumb-white/10">
{`{
  "external_session_id": "ATS-12345",
  "ats_data_endpoint": "https://your-ats.com/api/interview-data",
  "ats_webhook_url": "https://your-ats.com/api/webhook/receive-report",
  "ats_api_token": "your-ats-api-token",
  "expires_in_hours": 24
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Response Example */}
                <div className="bg-white/5 rounded-2xl shadow-xl border border-white/10 p-6 backdrop-blur-sm">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Response Örneği
                  </h3>
                  <pre className="bg-black/30 rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto border border-white/5 scrollbar-thin scrollbar-thumb-white/10">
{`{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "interview_link": "http://localhost:5175/interview/550e8400-e29b-41d4-a716-446655440000",
  "expires_at": "2024-12-11T10:00:00Z",
  "message": "Session başarıyla oluşturuldu"
}`}
                  </pre>
                </div>

                {/* Code Examples */}
                <div className="bg-white/5 rounded-2xl shadow-xl border border-white/10 p-6 backdrop-blur-sm">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Kod Örnekleri
                  </h3>

                  <div className="space-y-4">
                    {/* cURL */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">cURL</span>
                      </div>
                      <pre className="bg-black/30 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto border border-white/5 scrollbar-thin scrollbar-thumb-white/10">
{`curl -X POST ${API_BASE_URL}/session/create/ \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "external_session_id": "ATS-12345",
    "ats_data_endpoint": "https://your-ats.com/api/interview-data",
    "ats_webhook_url": "https://your-ats.com/api/webhook/receive-report",
    "ats_api_token": "your-ats-api-token",
    "expires_in_hours": 24
  }'`}
                      </pre>
                    </div>

                    {/* JavaScript/Node.js */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">JavaScript / Node.js</span>
                      </div>
                      <pre className="bg-black/30 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto border border-white/5 scrollbar-thin scrollbar-thumb-white/10">
{`const response = await fetch('${API_BASE_URL}/session/create/', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    external_session_id: 'ATS-12345',
    ats_data_endpoint: 'https://your-ats.com/api/interview-data',
    ats_webhook_url: 'https://your-ats.com/api/webhook/receive-report',
    ats_api_token: 'your-ats-api-token',
    expires_in_hours: 24
  })
});

const data = await response.json();
console.log('Interview Link:', data.interview_link);`}
                      </pre>
                    </div>

                    {/* Python */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Python</span>
                      </div>
                      <pre className="bg-black/30 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto border border-white/5 scrollbar-thin scrollbar-thumb-white/10">
{`import requests

response = requests.post(
    '${API_BASE_URL}/session/create/',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'external_session_id': 'ATS-12345',
        'ats_data_endpoint': 'https://your-ats.com/api/interview-data',
        'ats_webhook_url': 'https://your-ats.com/api/webhook/receive-report',
        'ats_api_token': 'your-ats-api-token',
        'expires_in_hours': 24
    }
)

data = response.json()
print(f"Interview Link: {data['interview_link']}")`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* How It Works */}
                <div className="bg-white/5 rounded-2xl shadow-xl border border-white/10 p-6 backdrop-blur-sm">
                  <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Nasıl Çalışır?
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">Session Oluştur</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          API anahtarınızla <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">/api/session/create/</code> endpoint'ine POST request gönderin. ATS entegrasyon bilgilerinizi (endpoint'ler, token) gönderin.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">Link'i Adaya Gönder</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          Response'da dönen <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">interview_link</code> değerini kopyalayın ve adaya gönderin.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">Aday Mülakata Başlar</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          Aday link'e tıkladığında, sistem ATS'nizin <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">ats_data_endpoint</code> endpoint'inden mülakat verilerini çeker (zero-knowledge architecture).
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                        4
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">Rapor Webhook ile Gönderilir</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          Mülakat tamamlandığında, detaylı rapor otomatik olarak <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">ats_webhook_url</code> adresinize POST request ile gönderilir.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ATS Integration Requirements */}
                <div className="bg-amber-500/5 rounded-2xl shadow-xl border border-amber-500/20 p-6 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <svg className="w-6 h-6 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-2">ATS Entegrasyon Gereksinimleri</h3>
                      <p className="text-sm text-slate-300 mb-4">
                        Zero-knowledge architecture kullanıyoruz. Veriler ATS'nizde tutulur, bizde saklanmaz.
                      </p>
                      <ul className="space-y-3 text-sm text-slate-400">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-1">•</span>
                          <span><strong className="text-white">ats_data_endpoint:</strong> Aday link'e tıkladığında çağrılacak endpoint. Mülakat verilerini (candidate info, job details, resume) JSON formatında döndürmeli.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-1">•</span>
                          <span><strong className="text-white">ats_webhook_url:</strong> Mülakat tamamlandığında raporun gönderileceği webhook URL'i. POST request ile JSON body almalı.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-1">•</span>
                          <span><strong className="text-white">ats_api_token:</strong> ATS endpoint'lerinize erişim için kullanılacak token (header'da gönderilir).</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Data Format Examples */}
                <div className="bg-white/5 rounded-2xl shadow-xl border border-white/10 p-6 backdrop-blur-sm">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    Veri Formatı Örnekleri
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">ATS Data Endpoint Response (GET)</div>
                      <pre className="bg-black/30 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto border border-white/5 scrollbar-thin scrollbar-thumb-white/10">
{`{
  "candidateName": "Ahmet Yılmaz",
  "candidateEmail": "ahmet@example.com",
  "jobPosition": "Senior Frontend Developer",
  "companyName": "TechCorp A.Ş.",
  "companyInfo": "İnovatif teknoloji şirketi...",
  "jobDescription": "Aranan nitelikler...",
  "candidateResume": "{...JSON resume data...}",
  "avatarId": "female"
}`}
                      </pre>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Webhook Request Body (POST) — Tam Format</div>
                      <p className="text-xs text-slate-400 mb-3">Mülakat tamamlandığında <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">ats_webhook_url</code> adresinize aşağıdaki formatta POST request gönderilir:</p>
                      <pre className="bg-black/30 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto border border-white/5 scrollbar-thin scrollbar-thumb-white/10">
{`{
  "session_id": "ATS-12345",
  "interview_token": "550e8400-e29b-41d4-a716-446655440000",
  "completed_at": "2026-03-21T12:00:00+03:00",
  "report": {
    "candidateName": "Ahmet Yılmaz",
    "overallScore": 85,
    "duration": "25 dakika",
    "categoryScores": {
      "technical": 90,
      "communication": 85,
      "problemSolving": 80,
      "culturalFit": 85,
      "confidence": 80
    },
    "visualAnalysis": {
      "attire": "Profesyonel görünüm",
      "environment": "Düzenli ve sessiz ortam",
      "bodyLanguage": "Açık ve güvenli postür",
      "eyeContact": "İyi göz teması"
    },
    "behavioralAnalysis": {
      "reactionSpeed": "Hızlı ve yapıcı yanıtlar",
      "stressManagement": "Sakin ve kontrollü",
      "toneOfVoice": "Profesyonel ve samimi ton"
    },
    "keyStrengths": [
      "Python ve Django konusunda derin bilgi",
      "İyi iletişim becerileri"
    ],
    "areasForImprovement": [
      "DevOps deneyimi sınırlı",
      "Sistem tasarımı konusunda gelişme potansiyeli"
    ],
    "summary": "Aday teknik konularda güçlü performans sergiledi...",
    "hiringRecommendation": "Hire",
    "transcript": [
      { "role": "Uzman", "text": "Merhaba, görüşmemize hoş geldiniz..." },
      { "role": "Aday", "text": "Merhaba, teşekkür ederim..." }
    ]
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Field Reference Table */}
                <div className="bg-white/5 rounded-2xl shadow-xl border border-white/10 p-6 backdrop-blur-sm">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Rapor Alanları Referansı
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="py-2.5 px-3 font-bold text-slate-400 uppercase tracking-wider">Alan</th>
                          <th className="py-2.5 px-3 font-bold text-slate-400 uppercase tracking-wider">Tip</th>
                          <th className="py-2.5 px-3 font-bold text-slate-400 uppercase tracking-wider">Açıklama</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-300">
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-cyan-400">session_id</td>
                          <td className="py-2.5 px-3 text-slate-500">string</td>
                          <td className="py-2.5 px-3">Session oluştururken gönderdiğiniz <code className="text-[10px] bg-white/10 px-1 py-0.5 rounded text-white">external_session_id</code></td>
                        </tr>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-cyan-400">interview_token</td>
                          <td className="py-2.5 px-3 text-slate-500">UUID</td>
                          <td className="py-2.5 px-3">Sistemimizin oluşturduğu benzersiz session token</td>
                        </tr>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-cyan-400">completed_at</td>
                          <td className="py-2.5 px-3 text-slate-500">ISO 8601</td>
                          <td className="py-2.5 px-3">Mülakatın tamamlanma zamanı</td>
                        </tr>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-cyan-400">overallScore</td>
                          <td className="py-2.5 px-3 text-slate-500">number (0-100)</td>
                          <td className="py-2.5 px-3">Genel performans skoru</td>
                        </tr>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-cyan-400">categoryScores</td>
                          <td className="py-2.5 px-3 text-slate-500">object</td>
                          <td className="py-2.5 px-3">5 kategori: technical, communication, problemSolving, culturalFit, confidence (0-100)</td>
                        </tr>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-cyan-400">visualAnalysis</td>
                          <td className="py-2.5 px-3 text-slate-500">object</td>
                          <td className="py-2.5 px-3">Görüntü analizi: attire, environment, bodyLanguage, eyeContact</td>
                        </tr>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-cyan-400">behavioralAnalysis</td>
                          <td className="py-2.5 px-3 text-slate-500">object</td>
                          <td className="py-2.5 px-3">Davranış analizi: reactionSpeed, stressManagement, toneOfVoice</td>
                        </tr>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-cyan-400">hiringRecommendation</td>
                          <td className="py-2.5 px-3 text-slate-500">enum</td>
                          <td className="py-2.5 px-3">"Strong Hire" | "Hire" | "Maybe" | "No Hire"</td>
                        </tr>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-cyan-400">keyStrengths</td>
                          <td className="py-2.5 px-3 text-slate-500">string[]</td>
                          <td className="py-2.5 px-3">Adayın güçlü yönleri listesi</td>
                        </tr>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-cyan-400">areasForImprovement</td>
                          <td className="py-2.5 px-3 text-slate-500">string[]</td>
                          <td className="py-2.5 px-3">Gelişim alanları listesi</td>
                        </tr>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-cyan-400">summary</td>
                          <td className="py-2.5 px-3 text-slate-500">string</td>
                          <td className="py-2.5 px-3">AI tarafından oluşturulan genel değerlendirme metni</td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-cyan-400">transcript</td>
                          <td className="py-2.5 px-3 text-slate-500">array</td>
                          <td className="py-2.5 px-3">Mülakat transkripti (role + text)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ATS Implementation Guide */}
                <div className="bg-emerald-500/5 rounded-2xl shadow-xl border border-emerald-500/20 p-6 backdrop-blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <svg className="w-6 h-6 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-2">Webhook Endpoint'inizi Nasıl Hazırlamalısınız?</h3>
                      <ul className="space-y-3 text-sm text-slate-400">
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-1 font-bold">✓</span>
                          <span><strong className="text-white">HTTP Status:</strong> Başarılı işlem için <code className="text-[10px] bg-white/10 px-1 py-0.5 rounded text-emerald-400">200</code>, <code className="text-[10px] bg-white/10 px-1 py-0.5 rounded text-emerald-400">201</code> veya <code className="text-[10px] bg-white/10 px-1 py-0.5 rounded text-emerald-400">204</code> dönün.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-1 font-bold">✓</span>
                          <span><strong className="text-white">Authorization:</strong> Header'da gelen <code className="text-[10px] bg-white/10 px-1 py-0.5 rounded text-white">Bearer {'{ats_api_token}'}</code> değerini doğrulayın.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-1 font-bold">✓</span>
                          <span><strong className="text-white">session_id:</strong> Gelen <code className="text-[10px] bg-white/10 px-1 py-0.5 rounded text-white">session_id</code> ile kendi tarafınızdaki kaydı eşleştirin.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-1 font-bold">✓</span>
                          <span><strong className="text-white">Retry:</strong> Webhook başarısız olursa (non-2xx) sistem otomatik olarak <strong className="text-white">5 kereye kadar</strong> tekrar dener. Rapor 24 saat boyunca şifrelenmiş olarak tutulur.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400 mt-1 font-bold">✓</span>
                          <span><strong className="text-white">HTTPS:</strong> Production'da webhook endpoint'iniz mutlaka HTTPS olmalıdır.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PLAN TAB */}
          {activeTab === 'plan' && (
            <div className="bg-white/5 rounded-2xl shadow-xl border border-white/10 overflow-hidden backdrop-blur-sm">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-white">{company?.plan.toUpperCase()} Plan</h2>
                    <p className="text-slate-400 mt-1">Mevcut aboneliğiniz ve kullanım limitleriniz.</p>
                  </div>
                  <span className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl">
                    🌱
                  </span>
            </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span className="text-slate-300">Kredi Durumu</span>
                      <span className="text-cyan-400">
                        {company?.plan === 'enterprise' ? (
                          <span className="text-yellow-400">∞ Sınırsız</span>
                        ) : (
                          `${company?.credits_used || 0} / ${company?.credits_total || 0}`
                        )}
                      </span>
                    </div>
                    {company?.plan !== 'enterprise' && (
                      <>
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                            style={{ width: `${Math.min(((company?.credits_used || 0) / (company?.credits_total || 1)) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 font-mono">
                          Kalan: {company?.credits_remaining || 0} kredi (1 Kredi = 1 Mülakat)
                        </p>
                      </>
                    )}
                    {company?.plan === 'enterprise' && (
                      <p className="text-[10px] text-slate-500 mt-2 font-mono">
                        Enterprise planında sınırsız kredi kullanabilirsiniz.
                      </p>
                    )}
              </div>

                  <div className="pt-6 border-t border-white/5">
                    <h4 className="font-bold text-white mb-4">Plan Özellikleri</h4>
                    <ul className="space-y-3 text-sm text-slate-400">
                      <li className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {company?.plan === 'enterprise' ? (
                          'Sınırsız mülakat hakkı'
                        ) : (
                          `Toplam ${company?.credits_total || 0} kredi (1 Kredi = 1 Mülakat)`
                        )}
                      </li>
                      <li className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Detaylı yapay zeka analizi
                      </li>
                      <li className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        API Erişimi
                      </li>
                    </ul>
            </div>
          </div>
        </div>
              <div className="bg-black/20 px-8 py-4 flex justify-between items-center border-t border-white/5">
                <span className="text-sm text-slate-500">Daha fazla özellik mi lazım?</span>
                <button className="text-cyan-400 font-bold text-sm hover:text-cyan-300 transition">
                  Planları İncele →
              </button>
            </div>
          </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
