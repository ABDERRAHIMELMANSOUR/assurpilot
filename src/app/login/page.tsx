"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const TEST_ACCOUNTS = [
  { role: "Administrateur", email: "admin@assurpilot.fr",         pw: "admin123", color: "badge-purple" },
  { role: "Coach",          email: "coach@assurpilot.fr",         pw: "coach123", color: "badge-orange" },
  { role: "Conseiller",     email: "marie.laurent@assurpilot.fr", pw: "agent123", color: "badge-blue"   },
  { role: "Conseiller",     email: "pierre.durand@assurpilot.fr", pw: "agent123", color: "badge-blue"   },
];

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
    } else {
      router.push("/"); router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 50%, #F1F5F9 100%)" }}>

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, #2563EB 1px, transparent 0)",
          backgroundSize: "32px 32px"
        }} />
        <div className="relative z-10 max-w-md animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-xl mb-8">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
            Pilotez vos<br/>appels entrants.
          </h1>
          <p className="text-lg text-slate-500 mb-10 leading-relaxed">
            Suivez la performance de vos conseillers, analysez les conversions et gérez vos équipes depuis une interface claire.
          </p>
          <div className="stagger space-y-4">
            {[
              { icon: "📊", label: "Tableaux de bord en temps réel" },
              { icon: "📞", label: "Import automatique depuis Keyyo" },
              { icon: "🏆", label: "Classement et suivi des performances" },
            ].map((f) => (
              <div key={f.label} className="animate-fade-in flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-base flex-shrink-0">{f.icon}</span>
                <span className="text-sm text-slate-600 font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-scale-in">

          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-900">AssurPilot</span>
            </div>
          </div>

          {/* Form card */}
          <div className="card p-8 mb-4">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Connexion</h2>
            <p className="text-sm text-slate-500 mb-6">Accédez à votre espace de travail</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Adresse email</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.fr" required
                  className="input"
                />
              </div>
              <div>
                <label className="label">Mot de passe</label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="input"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-700" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-2.5 mt-2">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Connexion…</>
                ) : "Se connecter"}
              </button>
            </form>
          </div>

          {/* Test accounts */}
          <div className="card p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Comptes de démonstration</p>
            <div className="space-y-1.5">
              {TEST_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  onClick={() => { setEmail(a.email); setPassword(a.pw); }}
                  className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                >
                  <span className={`badge ${a.color} flex-shrink-0`}>{a.role}</span>
                  <span className="text-xs text-slate-500 mono truncate">{a.email}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2.5 pl-1">Cliquez pour remplir automatiquement</p>
          </div>

        </div>
      </div>
    </div>
  );
}
