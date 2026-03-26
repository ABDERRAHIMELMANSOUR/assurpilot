"use client";
import { useEffect, useState, useCallback } from "react";
import StatCard from "@/components/ui/StatCard";
import DateFilter, { DateFilterState, buildQueryString } from "@/components/ui/DateFilter";
import Link from "next/link";

const EMPTY: DateFilterState = { period: "month", dateFrom: "", dateTo: "" };
const MEDALS = ["🥇", "🥈", "🥉"];

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton h-28 rounded-xl" style={{ animationDelay: `${i * 60}ms` }} />
      ))}
    </div>
  );
}

export default function AdminPage() {
  const [stats,   setStats]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<DateFilterState>(EMPTY);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    const data = await fetch("/api/analytics" + buildQueryString(filter)).then((r) => r.json());
    setStats(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const tauxGlobal = stats && stats.repondus > 0
    ? Math.round((stats.devis / stats.repondus) * 100)
    : 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Vue globale</h1>
          <p className="page-subtitle">Statistiques de toute la plateforme</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateFilter value={filter} onChange={setFilter} />
          <Link href="/admin/appels/import"  className="btn btn-secondary">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4-4 4M12 8v8"/></svg>
            Importer
          </Link>
          <Link href="/admin/appels/nouveau" className="btn btn-primary">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Appel manuel
          </Link>
        </div>
      </div>

      {/* Stats */}
      {loading ? <LoadingGrid /> : stats && (
        <div className="stagger grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total appels" value={stats.total}
            accent="blue"
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>}
          />
          <StatCard
            label="Devis réalisés" value={stats.devis}
            accent="green"
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
          <StatCard
            label="Appels manqués" value={stats.manques}
            accent="red"
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>}
          />
          <StatCard
            label="Taux conversion" value={`${tauxGlobal}%`}
            accent={tauxGlobal >= 30 ? "green" : tauxGlobal >= 15 ? "orange" : "red"}
            sub="sur appels répondus"
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
          />
        </div>
      )}

      {/* Leaderboard */}
      {!loading && stats?.leaderboard?.length > 0 && (
        <div className="card overflow-hidden animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="section-title mb-0">Classement des conseillers</h2>
            <Link href="/admin/classement" className="text-xs font-medium" style={{ color: "var(--brand)" }}>
              Voir tout →
            </Link>
          </div>
          <div>
            {stats.leaderboard.slice(0, 6).map((agent: any, i: number) => {
              const pct = agent.tauxConversion ?? 0;
              const barColor = pct >= 40 ? "#22C55E" : pct >= 20 ? "#F59E0B" : "#EF4444";
              return (
                <div
                  key={agent.id}
                  className="px-5 py-3.5 flex items-center gap-4 transition-colors"
                  style={{ borderBottom: i < stats.leaderboard.slice(0,6).length - 1 ? "1px solid var(--border-light)" : "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <span className="w-7 text-center text-base flex-shrink-0">
                    {i < 3 ? MEDALS[i] : <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>{i + 1}</span>}
                  </span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: "var(--brand-light)", color: "var(--brand)" }}>
                    {agent.prenom?.[0]}{agent.nom?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{agent.prenom} {agent.nom}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{agent.total} appels · {agent.devis} devis</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-24 h-1.5 rounded-full" style={{ background: "var(--surface-3)" }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
                    </div>
                    <span className="text-sm font-bold tabular-nums w-12 text-right" style={{ color: barColor }}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && stats && !stats?.leaderboard?.length && (
        <div className="card empty-state animate-fade-in">
          <div className="empty-state-icon">
            <svg className="w-6 h-6" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          </div>
          <p className="empty-state-title">Aucune donnée pour cette période</p>
          <p className="empty-state-text">Modifiez la période ou importez des appels.</p>
        </div>
      )}
    </div>
  );
}
