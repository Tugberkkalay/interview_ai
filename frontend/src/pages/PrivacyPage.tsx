import React from 'react';
import { Link } from 'react-router-dom';

export const PrivacyPage: React.FC = () => {
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

        <h1 className="text-4xl md:text-5xl font-black text-white mb-8">Gizlilik Politikası</h1>

        <div className="prose prose-invert prose-lg max-w-none">
          <p className="lead">
            Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </p>

          <p>
            Cognivia AI ("Biz", "Şirket"), gizliliğinize önem verir. Bu Gizlilik Politikası, web sitemizi ve hizmetlerimizi kullandığınızda kişisel verilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar.
          </p>

          <h3>1. Toplanan Veriler</h3>
          <p>
            Hizmetlerimizi kullandığınızda aşağıdaki türde bilgileri toplayabiliriz:
          </p>
          <ul>
            <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, e-posta adresi, telefon numarası.</li>
            <li><strong>Mülakat Verileri:</strong> Ses kayıtları, video kayıtları, transkriptler ve analiz sonuçları (KVKK ve GDPR uyumlu olarak işlenir).</li>
            <li><strong>Teknik Veriler:</strong> IP adresi, tarayıcı türü, cihaz bilgileri.</li>
          </ul>

          <h3>2. Verilerin Kullanımı</h3>
          <p>
            Topladığımız verileri şu amaçlarla kullanırız:
          </p>
          <ul>
            <li>Mülakat simülasyonlarını gerçekleştirmek ve analiz raporları oluşturmak.</li>
            <li>Hizmetlerimizi iyileştirmek ve kişiselleştirmek.</li>
            <li>Yasal yükümlülükleri yerine getirmek.</li>
          </ul>

          <h3>3. Veri Güvenliği</h3>
          <p>
            Verileriniz endüstri standardı şifreleme yöntemleri (AES-256) ile korunmaktadır. Mülakat kayıtlarınız, analiz tamamlandıktan sonra belirlenen saklama süresi sonunda otomatik olarak anonimleştirilir veya silinir.
          </p>

          <h3>4. İletişim</h3>
          <p>
            Gizlilik politikamızla ilgili sorularınız için <a href="mailto:info@plena.pro" className="text-cyan-400 hover:underline">info@plena.pro</a> adresinden bize ulaşabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};

