"use client";
import { useEffect, useState } from "react";

export default function KeyyoPage() {
  const [config, setConfig] = useState<any>(null);
  const [apiKey, setApiKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/config/keyyo")
      .then((r) => r.json())
      .then((d) => {
        setConfig(d);
        setWebhookUrl(d.webhookUrl ?? "");
        setIsActive(d.isActive ?? false);
      });
  }, []);

  async function handleSave() {
    setSaving(true); setSaved(false);
    const body: any = { webhookUrl, isActive };
    if (apiKey.trim()) body.apiKey = apiKey;
    const res = await fetch("/api/config/keyyo", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json();
    setConfig(d);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleTest() {
    setTesting(true); setTestResult(null);
    const res = await fetch("/api/config/keyyo", { method: "POST" });
    const d = await res.json();
    setTestResult(d);
    setTesting(false);
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Intégration Keyyo</h1>
          <p className="page-subtitle">Configuration de la source de données d'appels</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`status-dot ${isActive ? "status-dot-green" : "status-dot-gray"}`} />
          <span className="text-sm text-slate-500">{isActive ? "Actif" : "Inactif"}</span>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-xl p-4 mb-6 flex gap-3" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <p className="text-sm font-semibold text-blue-900 mb-1">Rôle de Keyyo dans votre setup</p>
          <p className="text-sm text-blue-700 leading-relaxed">
            Keyyo gère entièrement la distribution des appels entrants vers vos conseillers.
            AssurPilot n'intervient pas dans le routage — il <strong>importe et analyse</strong> uniquement les journaux d'appels fournis par Keyyo via webhook ou fichier CSV.
          </p>
        </div>
      </div>

      {!config ? (
        <div className="card p-8 flex items-center justify-center">
          <span className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">

          {/* Webhook config */}
          <div className="card p-6">
            <h2 className="section-title mb-4">Connexion webhook</h2>
            <p className="text-sm text-slate-500 mb-5">
              Configurez cette URL dans votre interface Keyyo pour qu'AssurPilot reçoive automatiquement les événements d'appels.
            </p>

            <div className="space-y-4">
              <div>
                <label className="label">URL de webhook <span className="text-red-400">*</span></label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://votre-app.vercel.app/api/webhooks/keyyo"
                  className="input"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Collez cette URL dans : Keyyo → Paramètres → Webhooks
                </p>
              </div>

              <div>
                <label className="label">Clé API Keyyo <span className="text-slate-400 font-normal">(optionnel)</span></label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={config.apiKeyMasked || "Laisser vide pour conserver la clé actuelle"}
                  className="input"
                />
                {config.apiKeyMasked && (
                  <p className="text-xs text-slate-400 mt-1.5">Clé actuelle : {config.apiKeyMasked}</p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => setIsActive(!isActive)}
                  className="relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 focus:outline-none"
                  style={{ background: isActive ? "var(--brand)" : "#CBD5E1" }}
                >
                  <span
                    className="inline-block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                    style={{ transform: isActive ? "translateX(18px)" : "translateX(2px)", marginTop: "2px" }}
                  />
                </button>
                <label className="text-sm text-slate-600 cursor-pointer select-none" onClick={() => setIsActive(!isActive)}>
                  Intégration {isActive ? "activée" : "désactivée"}
                </label>
              </div>
            </div>
          </div>

          {/* Import CSV section */}
          <div className="card p-6">
            <h2 className="section-title mb-1">Import de fichiers</h2>
            <p className="text-sm text-slate-500 mb-4">
              Si vous n'utilisez pas le webhook, vous pouvez importer manuellement les exports CSV/Excel de Keyyo.
            </p>
            <div className="flex gap-3">
              <a href="/admin/appels/import" className="btn btn-secondary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4-4 4M12 8v8"/>
                </svg>
                Importer un fichier
              </a>
              <a href="/admin/appels" className="btn btn-ghost">
                Voir tous les appels →
              </a>
            </div>
          </div>

          {/* Test result */}
          {testResult && (
            <div className="rounded-xl px-4 py-3 text-sm flex items-start gap-2 animate-fade-in"
              style={{ background: testResult.success ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${testResult.success ? "#BBF7D0" : "#FECACA"}`, color: testResult.success ? "#15803D" : "#DC2626" }}>
              <span className="mt-0.5">{testResult.success ? "✓" : "✗"}</span>
              {testResult.message}
            </div>
          )}

          {saved && (
            <div className="rounded-xl px-4 py-3 text-sm text-green-700 flex items-center gap-2 animate-fade-in" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
              <span>✓</span> Configuration sauvegardée
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sauvegarde…</> : "Sauvegarder"}
            </button>
            <button onClick={handleTest} disabled={testing} className="btn btn-secondary">
              {testing ? "Test en cours…" : "Tester la configuration"}
            </button>
          </div>

          {/* Last test info */}
          {config.lastTestedAt && (
            <p className="text-xs text-slate-400">
              Dernier test : {new Date(config.lastTestedAt).toLocaleString("fr-FR")} —{" "}
              <span style={{ color: config.lastTestSuccess ? "#16A34A" : "#DC2626" }}>
                {config.lastTestSuccess ? "Succès" : "Échec"}
              </span>
              {config.lastTestMessage ? ` — ${config.lastTestMessage}` : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
