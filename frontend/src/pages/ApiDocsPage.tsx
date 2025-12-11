import React, { useState } from 'react';

export default function ApiDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<'curl' | 'python' | 'javascript' | 'php'>('curl');

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const apiKey = 'sk_live_YOUR_API_KEY_HERE';
  const baseUrl = 'https://api.aiinterview.com';

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-20%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[50vw] h-[50vw] bg-cyan-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
      </div>

      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-black text-xl">API</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">AI Interview API</h1>
              <p className="text-sm text-slate-400 font-mono">v1.0.0</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`${API_BASE_URL}/docs/`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition font-bold text-sm shadow-lg shadow-cyan-900/20"
            >
              🔗 Interactive Swagger
            </a>
            <a
              href={`${API_BASE_URL}/redoc/`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/10 text-white border border-white/10 rounded-lg hover:bg-white/20 transition font-bold text-sm"
            >
              📖 ReDoc
            </a>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Introduction */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-cyan-900/40 via-purple-900/40 to-cyan-900/40 border border-white/10 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-4xl font-black tracking-tight mb-4">Welcome to AI Interview API</h2>
                <p className="text-xl text-slate-300 mb-8 max-w-2xl">
                Integrate AI-powered video interviews into your ATS with just a few API calls.
                No frontend development required!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="text-3xl mb-3">⚡</div>
                    <div className="font-bold text-white mb-1">Fast Integration</div>
                    <div className="text-sm text-slate-400">15 minutes to go live</div>
                </div>
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="text-3xl mb-3">🔒</div>
                    <div className="font-bold text-white mb-1">Zero-Knowledge</div>
                    <div className="text-sm text-slate-400">We never store candidate data</div>
                </div>
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="text-3xl mb-3">🎯</div>
                    <div className="font-bold text-white mb-1">RESTful API</div>
                    <div className="text-sm text-slate-400">Simple & predictable</div>
                </div>
                </div>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section className="mb-16">
          <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
            <span className="text-cyan-400">🚀</span> Quick Start
          </h2>
          <div className="bg-[#0a0f1e] border border-white/10 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
            <div className="space-y-8 relative z-10">
              <Step 
                number={1}
                title="Get Your API Key"
                description="Register on the dashboard and copy your API key from Settings"
              >
                <div className="flex items-center gap-3 p-4 bg-black/50 rounded-xl border border-white/10 text-emerald-400 font-mono text-sm">
                  <span className="text-slate-500">$</span>
                  <code>sk_live_abc123xyz...</code>
                  <button className="ml-auto px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-bold transition">
                    Copy
                  </button>
                </div>
              </Step>

              <Step
                number={2}
                title="Create Interview Session"
                description="Send a POST request with candidate details"
              >
                <CodeBlock
                  code={examples.createSession[selectedLang]}
                  language={selectedLang}
                  onCopy={() => copyCode(examples.createSession[selectedLang], 'create')}
                  copied={copiedCode === 'create'}
                />
              </Step>

              <Step
                number={3}
                title="Send Link to Candidate"
                description="Candidate opens the link and completes the interview"
              >
                <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-xl">
                  <p className="text-sm text-cyan-400 font-mono break-all">
                    {baseUrl}/interview/9eaa2e6c-0cb2-4ba1-810b-9276c369803d
                  </p>
                </div>
              </Step>

              <Step
                number={4}
                title="Receive Webhook"
                description="Get the report automatically when interview completes"
              >
                <CodeBlock
                  code={examples.webhook}
                  language="json"
                  onCopy={() => copyCode(examples.webhook, 'webhook')}
                  copied={copiedCode === 'webhook'}
                />
              </Step>
            </div>
          </div>
        </section>

        {/* Language Selector */}
        <div className="mb-12 flex justify-center sticky top-24 z-40">
          <div className="inline-flex bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 shadow-2xl">
            {(['curl', 'python', 'javascript', 'php'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  selectedLang === lang
                    ? 'bg-white text-black shadow-lg transform scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* API Endpoints */}
        <section className="mb-16">
          <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
            <span className="text-purple-400">📡</span> API Endpoints
          </h2>
          
          <ApiEndpoint
            method="POST"
            path="/api/session/create/"
            title="Create Interview Session"
            description="Creates a new interview session and returns the candidate link"
          >
            <CodeBlock
              code={examples.createSession[selectedLang]}
              language={selectedLang}
              onCopy={() => copyCode(examples.createSession[selectedLang], 'create2')}
              copied={copiedCode === 'create2'}
            />
            
            <div className="mt-6">
              <h4 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">Response:</h4>
              <CodeBlock
                code={examples.createSessionResponse}
                language="json"
                onCopy={() => copyCode(examples.createSessionResponse, 'create-res')}
                copied={copiedCode === 'create-res'}
              />
            </div>
          </ApiEndpoint>

          <ApiEndpoint
            method="GET"
            path="/api/session/{token}/"
            title="Get Interview Data (Proxy)"
            description="Fetches candidate data from your ATS (zero-knowledge proxy)"
          >
            <CodeBlock
              code={examples.getSession[selectedLang]}
              language={selectedLang}
              onCopy={() => copyCode(examples.getSession[selectedLang], 'get')}
              copied={copiedCode === 'get'}
            />
          </ApiEndpoint>

          <ApiEndpoint
            method="POST"
            path="/api/session/{token}/complete/"
            title="Complete Interview"
            description="Submits the final report and sends webhook to your ATS"
          >
            <CodeBlock
              code={examples.completeSession}
              language="json"
              onCopy={() => copyCode(examples.completeSession, 'complete')}
              copied={copiedCode === 'complete'}
            />
          </ApiEndpoint>
        </section>

        {/* Webhook Format */}
        <section className="mb-16">
          <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
            <span className="text-amber-400">🔔</span> Webhook Format
          </h2>
          <div className="bg-[#0a0f1e] border border-white/10 rounded-3xl shadow-xl p-8">
            <p className="text-slate-400 mb-6">
              When the interview is completed, we'll send a POST request to your webhook URL:
            </p>
            <CodeBlock
              code={examples.webhookDetailed}
              language="json"
              onCopy={() => copyCode(examples.webhookDetailed, 'webhook-detailed')}
              copied={copiedCode === 'webhook-detailed'}
            />
          </div>
        </section>

        {/* Security */}
        <section className="mb-16">
          <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
            <span className="text-emerald-400">🔐</span> Security Best Practices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SecurityCard
              icon="🔑"
              title="API Key Protection"
              items={[
                'Never commit API keys to git',
                'Rotate keys regularly',
                'Use different keys for test/production',
                'Store keys in environment variables'
              ]}
            />
            <SecurityCard
              icon="🔒"
              title="Webhook Security"
              items={[
                'Use HTTPS endpoints only',
                'Validate incoming requests',
                'Implement retry logic',
                'Log all webhook attempts'
              ]}
            />
            <SecurityCard
              icon="📊"
              title="Data Privacy"
              items={[
                'We use zero-knowledge architecture',
                'Candidate data is never stored',
                'Reports are encrypted if webhook fails',
                'Auto-cleanup after 24 hours'
              ]}
            />
            <SecurityCard
              icon="⚡"
              title="Rate Limiting"
              items={[
                'Free: 10 sessions/month',
                'Pro: 100 sessions/month',
                'Enterprise: Custom limits',
                'Quota resets monthly'
              ]}
            />
          </div>
        </section>

        {/* Support */}
        <section>
          <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-white/10 rounded-3xl shadow-2xl p-12 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="relative z-10">
                <h2 className="text-3xl font-black text-white mb-4">Need Help?</h2>
                <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Our team is here to help you integrate successfully. Join our community or contact support directly.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] w-full sm:w-auto">
                    📧 Contact Support
                </button>
                <button className="px-8 py-4 bg-black/40 text-white border border-white/20 rounded-xl font-bold hover:bg-white/10 transition-all w-full sm:w-auto">
                    💬 Join Discord
                </button>
                </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Helper Components

interface StepProps {
  number: number;
  title: string;
  description: string;
  children: React.ReactNode;
}

function Step({ number, title, description, children }: StepProps) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-cyan-500/20">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        <p className="text-slate-400 text-sm mb-4">{description}</p>
        {children}
      </div>
    </div>
  );
}

interface CodeBlockProps {
  code: string;
  language: string;
  onCopy: () => void;
  copied: boolean;
}

function CodeBlock({ code, language, onCopy, copied }: CodeBlockProps) {
  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onCopy}
          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white text-xs font-bold transition border border-white/10"
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>
      <pre className="bg-black/50 text-slate-300 p-6 rounded-xl overflow-x-auto text-sm border border-white/10 font-mono leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
        <code>{code}</code>
      </pre>
    </div>
  );
}

interface ApiEndpointProps {
  method: string;
  path: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

function ApiEndpoint({ method, path, title, description, children }: ApiEndpointProps) {
  const methodColors = {
    GET: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="bg-[#0a0f1e] border border-white/10 rounded-3xl shadow-xl p-8 mb-8 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <span className={`px-4 py-1.5 rounded-lg font-black text-sm border self-start ${methodColors[method as keyof typeof methodColors]}`}>
            {method}
            </span>
            <code className="text-slate-300 font-mono text-sm bg-black/30 px-3 py-1.5 rounded-lg border border-white/5 break-all">{path}</code>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 mb-8 max-w-3xl">{description}</p>
        {children}
      </div>
    </div>
  );
}

interface SecurityCardProps {
  icon: string;
  title: string;
  items: string[];
}

function SecurityCard({ icon, title, items }: SecurityCardProps) {
  return (
    <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl shadow-xl p-8 hover:border-cyan-500/30 transition-colors group">
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">{title}</h3>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-slate-400">
            <span className="text-cyan-500 mt-0.5 font-bold">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Code Examples

const examples = {
  createSession: {
    curl: `curl -X POST https://api.aiinterview.com/api/session/create/ \\
  -H "Authorization: Bearer sk_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "external_session_id": "ATS-12345",
    "ats_data_endpoint": "https://your-ats.com/api/interview/12345",
    "ats_webhook_url": "https://your-ats.com/webhook/report",
    "ats_api_token": "your_ats_token",
    "expires_in_hours": 24
  }'`,
    python: `import requests

api_key = "sk_live_YOUR_API_KEY"
url = "https://api.aiinterview.com/api/session/create/"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

data = {
    "external_session_id": "ATS-12345",
    "ats_data_endpoint": "https://your-ats.com/api/interview/12345",
    "ats_webhook_url": "https://your-ats.com/webhook/report",
    "ats_api_token": "your_ats_token",
    "expires_in_hours": 24
}

response = requests.post(url, headers=headers, json=data)
session = response.json()
print(f"Interview link: {session['interview_link']}")`,
    javascript: `const apiKey = 'sk_live_YOUR_API_KEY';
const url = 'https://api.aiinterview.com/api/session/create/';

const data = {
  external_session_id: 'ATS-12345',
  ats_data_endpoint: 'https://your-ats.com/api/interview/12345',
  ats_webhook_url: 'https://your-ats.com/webhook/report',
  ats_api_token: 'your_ats_token',
  expires_in_hours: 24
};

fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${apiKey}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
.then(res => res.json())
.then(session => {
  console.log('Interview link:', session.interview_link);
});`,
    php: `<?php
$api_key = 'sk_live_YOUR_API_KEY';
$url = 'https://api.aiinterview.com/api/session/create/';

$data = [
    'external_session_id' => 'ATS-12345',
    'ats_data_endpoint' => 'https://your-ats.com/api/interview/12345',
    'ats_webhook_url' => 'https://your-ats.com/webhook/report',
    'ats_api_token' => 'your_ats_token',
    'expires_in_hours' => 24
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $api_key,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$session = json_decode($response, true);
echo "Interview link: " . $session['interview_link'];
?>`
  },
  
  createSessionResponse: `{
  "token": "9eaa2e6c-0cb2-4ba1-810b-9276c369803d",
  "interview_link": "https://app.aiinterview.com/interview/9eaa2e6c-0cb2-4ba1-810b-9276c369803d",
  "expires_at": "2025-12-11T14:50:22.009293+00:00",
  "status": "created"
}`,

  getSession: {
    curl: `curl -X GET https://api.aiinterview.com/api/session/{token}/`,
    python: `response = requests.get(f"https://api.aiinterview.com/api/session/{token}/")
data = response.json()`,
    javascript: `fetch(\`https://api.aiinterview.com/api/session/\${token}/\`)
  .then(res => res.json())
  .then(data => console.log(data));`,
    php: `$response = file_get_contents("https://api.aiinterview.com/api/session/$token/");
$data = json_decode($response, true);`
  },

  completeSession: `POST /api/session/{token}/complete/

{
  "report": {
    "overallScore": 85,
    "recommendation": "Strongly Recommended",
    "technicalSkills": { ... },
    "softSkills": { ... }
  }
}`,

  webhook: `POST https://your-ats.com/webhook/report
Authorization: Bearer your_ats_token

{
  "session_id": "ATS-12345",
  "interview_token": "9eaa2e6c-0cb2-4ba1-810b-9276c369803d",
  "completed_at": "2025-12-10T15:30:00Z",
  "report": { ... }
}`,

  webhookDetailed: `{
  "session_id": "ATS-12345",
  "interview_token": "9eaa2e6c-0cb2-4ba1-810b-9276c369803d",
  "completed_at": "2025-12-10T15:30:00Z",
  "report": {
    "overallScore": 85,
    "recommendation": "Kesinlikle İşe Alınmalı",
    "technicalSkills": {
      "score": 88,
      "strengths": ["Python", "Django", "API Design"],
      "weaknesses": ["DevOps", "Docker"]
    },
    "softSkills": {
      "communication": 90,
      "problemSolving": 85,
      "teamwork": 80
    },
    "detailedAnalysis": "Aday teknik konularda çok güçlü...",
    "strengths": [
      "Excellent technical knowledge",
      "Clear communication",
      "Problem-solving approach"
    ],
    "weaknesses": [
      "Limited DevOps experience",
      "Could improve on system design"
    ],
    "interviewTranscript": [
      {
        "speaker": "ai",
        "text": "Merhaba, görüşmemize hoş geldiniz..."
      },
      {
        "speaker": "candidate",
        "text": "Merhaba, teşekkür ederim..."
      }
    ]
  }
}`
};
