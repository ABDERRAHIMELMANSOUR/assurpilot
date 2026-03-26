"use client";
import { useState, useEffect } from "react";

interface Option { value: string; label: string; color: string; }

interface Props {
  callId:        string;
  currentResult: { resultat: string; notes?: string | null } | null | undefined;
  onClose:       () => void;
  onSaved:       () => void;
}

const COLOR_BADGE: Record<string, string> = {
  green:  "badge-green",
  blue:   "badge-blue",
  red:    "badge-red",
  yellow: "badge-yellow",
  purple: "badge-purple",
  gray:   "badge-gray",
};

export default function ResultModal({ callId, currentResult, onClose, onSaved }: Props) {
  const [options,  setOptions]  = useState<Option[]>([]);
  const [resultat, setResultat] = useState(currentResult?.resultat ?? "");
  const [notes,    setNotes]    = useState(currentResult?.notes ?? "");
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    fetch("/api/call-result-options")
      .then((r) => r.json())
      .then((d) => setOptions(Array.isArray(d) ? d : []));
  }, []);

  async function handleSave() {
    if (!resultat) return;
    setSaving(true);
    await fetch(`/api/calls/${callId}/result`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resultat, notes }),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              {currentResult ? "Modifier le résultat" : "Qualifier l'appel"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Sélectionnez le résultat de cet appel</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost p-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Result options */}
          <div>
            <label className="label">Résultat <span style={{ color: "#EF4444" }}>*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setResultat(opt.value)}
                  className="px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-150 border"
                  style={
                    resultat === opt.value
                      ? { background: "var(--brand-light)", borderColor: "var(--brand)", color: "var(--brand)" }
                      : { background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }
                  }
                >
                  <span className={`badge ${COLOR_BADGE[opt.color] ?? "badge-gray"} mb-1 text-[10px]`}>{opt.label}</span>
                  <br/>
                  <span className="text-xs opacity-70">{opt.label}</span>
                </button>
              ))}
            </div>
            {options.length === 0 && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Aucune option configurée — Admin → Résultats d'appel</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes <span className="font-normal" style={{ color: "var(--text-muted)" }}>(optionnel)</span></label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Informations sur l'appel, observations…"
              className="input resize-none"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Annuler</button>
          <button onClick={handleSave} disabled={!resultat || saving} className="btn btn-primary">
            {saving
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sauvegarde…</>
              : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
