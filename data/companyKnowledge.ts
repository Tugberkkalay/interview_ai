export interface KnowledgeItem {
  category: string;
  keywords: string[];
  content: string;
}

export const COMPANY_KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    category: "work_culture",
    keywords: ["kültür", "ortam", "mesai", "saat", "dress", "giyim", "kıyafet", "uzaktan", "remote", "hibrit", "ofis"],
    content: "Çalışma Kültürü: Esnek çalışma saatlerine sahibiz (Çekirdek saatler 10:00-16:00). Haftanın 3 günü uzaktan (Remote), 2 günü ofisten hibrit çalışma modelimiz var. Ofiste 'Smart Casual' giyim kodu geçerlidir. Hiyerarşiden uzak, fikirlerin özgürce tartışıldığı açık bir iletişim ortamımız vardır."
  },
  {
    category: "benefits",
    keywords: ["yan hak", "maaş", "sigorta", "yemek", "ticket", "prim", "izin", "tatil", "spor", "eğitim"],
    content: "Yan Haklar: Tüm çalışanlarımıza ve ailelerine %100 kapsamlı Tamamlayıcı Sağlık Sigortası yapıyoruz. Günlük yemek ücreti sektör standartlarının üzerindedir (Setcard). Yılda bir kez performans primi, doğum günü izni ve yıllık 10.000 TL eğitim/kitap bütçesi sunuyoruz. Ayrıca ofiste ücretsiz spor salonu üyeliği mevcuttur."
  },
  {
    category: "tech_stack",
    keywords: ["teknoloji", "stack", "yazılım", "dil", "framework", "backend", "frontend", "aws", "cloud", "ci/cd"],
    content: "Teknoloji Stack'imiz: Frontend tarafında React, Next.js ve Tailwind CSS kullanıyoruz. Backend'de Node.js (NestJS) ve Go (Golang) ile mikroservis mimarisi uyguluyoruz. Veritabanı olarak PostgreSQL ve Redis, altyapı olarak AWS (EKS, Lambda) kullanmaktayız. CI/CD süreçlerimiz GitHub Actions ile otomatize edilmiştir."
  },
  {
    category: "hiring_process",
    keywords: ["süreç", "aşama", "mülakat", "değerlendirme", "sonuç", "geri dönüş"],
    content: "İşe Alım Süreci: Şu anki AI mülakatı ilk aşamadır. Başarılı olmanız durumunda Teknik Lider ile online teknik mülakat ve sonrasında İK Direktörü ile Kültür uyum görüşmesi yapılacaktır. Süreç genellikle 2 hafta içinde sonuçlanır."
  }
];