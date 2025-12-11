// API Service for ATS Integration
import { InterviewReport } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface KnowledgeItem {
  category: string;
  keywords: string[];
  content: string;
}

export interface InterviewData {
  candidateName: string;
  candidateEmail: string;
  jobPosition: string;
  companyName: string;
  companyInfo: string;
  jobDescription: string;
  candidateResume: string;
  avatarId: 'female' | 'male';
  companyLogo?: string | null;
  companyKnowledge?: KnowledgeItem[]; // Optional: work_culture, benefits, hiring_process from ATS
}

export interface InterviewReportSubmission {
  token: string;
  report: InterviewReport;
}

/**
 * Fetch interview data from backend using token
 */
export async function fetchInterviewData(token: string): Promise<InterviewData> {
  try {
    const response = await fetch(`${API_BASE_URL}/session/${token}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Geçersiz veya süresi dolmuş mülakat linki.');
      }
      if (response.status === 410) {
        throw new Error('Bu mülakat linki daha önce kullanılmış.');
      }
      throw new Error('Mülakat verileri alınamadı.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Submit interview report to backend
 */
export async function submitInterviewReport(token: string, report: InterviewReport): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/session/${token}/complete/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ report }),
    });

    if (!response.ok) {
      throw new Error('Rapor gönderilirken bir hata oluştu.');
    }
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Mock service for development/testing
 * Returns fake data without needing a real backend
 */
export async function fetchInterviewDataMock(token: string): Promise<InterviewData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock data
  return {
    candidateName: 'Ahmet Yılmaz',
    candidateEmail: 'ahmet.yilmaz@example.com',
    jobPosition: 'Senior Frontend Developer',
    companyName: 'TechCorp A.Ş.',
    companyInfo: 'İnovatif, hızlı büyüyen, çalışan odaklı bir teknoloji şirketi.',
    jobDescription: `
      Aranan Nitelikler:
      - React.js ve TypeScript konusunda uzman
      - 5+ yıl frontend deneyimi
      - UI/UX tasarım prensipleri bilgisi
      - Agile/Scrum deneyimi
      - İngilizce iletişim becerisi
    `,
    candidateResume: JSON.stringify({
      name: 'Ahmet',
      surname: 'Yılmaz',
      email: 'ahmet.yilmaz@example.com',
      city: 'İstanbul',
      country: 'Türkiye',
      skills: ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'Node.js'],
      education_summary: 'Bilgisayar Mühendisliği - İstanbul Teknik Üniversitesi',
      experience_summary: '6 yıllık frontend development deneyimi',
      work_experience_details: [
        {
          company: 'Digital Agency Ltd.',
          position: 'Senior Frontend Developer',
          is_ongoing: true,
          start_date: '2021-05',
          description: 'React ve TypeScript ile kurumsal web uygulamaları geliştirme',
        },
      ],
    }, null, 2),
    avatarId: 'female',
    // Mock companyKnowledge for testing
    companyKnowledge: [
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
        category: "hiring_process",
        keywords: ["süreç", "aşama", "mülakat", "değerlendirme", "sonuç", "geri dönüş"],
        content: "İşe Alım Süreci: Şu anki AI mülakatı ilk aşamadır. Başarılı olmanız durumunda Teknik Lider ile online teknik mülakat ve sonrasında İK Direktörü ile Kültür uyum görüşmesi yapılacaktır. Süreç genellikle 2 hafta içinde sonuçlanır."
      }
    ]
  };
}

/**
 * Mock submit for development/testing
 */
export async function submitInterviewReportMock(token: string, report: InterviewReport): Promise<void> {
  console.log('Mock Report Submission:', { token, report });
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Success
}

