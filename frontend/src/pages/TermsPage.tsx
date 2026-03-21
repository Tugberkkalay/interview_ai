import React from 'react';
import { Link } from 'react-router-dom';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500 selection:text-black">
      <div className="container mx-auto px-6 py-20 max-w-4xl">
        <header className="flex justify-between items-center mb-12">
          <Link to="/" className="text-2xl font-black tracking-tighter group">
            <span className="text-white group-hover:text-cyan-400 transition-colors">Cognivia</span>
            <span className="text-white/50">Interview</span>
          </Link>
          <Link to="/" className="text-sm font-mono text-slate-400 hover:text-white transition-colors">
            ← GERİ DÖN
          </Link>
        </header>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-8">Kullanım Koşulları</h1>

        <div className="prose prose-invert prose-lg max-w-none">
          <p className="lead">
            Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </p>

          <p>
            Cognivia AI hizmetlerini kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Lütfen dikkatlice okuyunuz.
          </p>

          <h3>1. Hizmetin Tanımı</h3>
          <p>
            Cognivia AI, yapay zeka destekli mülakat simülasyonu ve aday değerlendirme hizmeti sunan bir SaaS (Software as a Service) platformudur.
          </p>

          <h3>2. Hesap Güvenliği</h3>
          <p>
            Kullanıcı hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi kimseyle paylaşmamalısınız. Şüpheli bir durum fark ederseniz derhal bize bildirmelisiniz.
          </p>

          <h3>3. Kabul Edilebilir Kullanım</h3>
          <p>
            Hizmetlerimizi sadece yasal amaçlarla kullanabilirsiniz. Sisteme zarar verecek, diğer kullanıcıların haklarını ihlal edecek veya yapay zeka modelini manipüle etmeye yönelik (jailbreak vb.) eylemlerde bulunamazsınız.
          </p>

          <h3>4. Ödeme ve İadeler</h3>
          <p>
            Hizmetlerimiz kredi sistemiyle çalışmaktadır. Satın alınan kredilerin iadesi, yasal cayma hakkı süresi (14 gün) içinde ve krediler kullanılmamışsa mümkündür.
          </p>

          <h3>5. Değişiklikler</h3>
          <p>
            Cognivia AI, bu koşulları dilediği zaman güncelleme hakkını saklı tutar. Değişiklikler sitede yayınlandığı andan itibaren geçerli olur.
          </p>
        </div>
      </div>
    </div>
  );
};

