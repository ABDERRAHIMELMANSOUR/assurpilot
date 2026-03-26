"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import StatCard from "@/components/ui/StatCard";
import DateFilter, { DateFilterState, buildQueryString } from "@/components/ui/DateFilter";
import Link from "next/link";

const EMPTY: DateFilterState = { period: "month", dateFrom: "", dateTo: "" };
const MEDALS = ["🥇", "🥈", "🥉"];

export default function SuperviseurPage() {
  const { data: session } = useSession();
  const [stats,   setStats]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<DateFilterState>(EMPTY);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setStats(await fetch("/api/analytics" + buildQueryString(filter)).then((r) => r.json()));
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const user = session?.user as any;

  return (
    <div className="animate-fade-in">
      <div className="page-header mb-5 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Mon équipe</h1>
          <p className="page-subtitle">Performance et activité de vos conseillers</p>
        </div>
        <div className="flex items-center gap-2">
          <DateFilter value={filter} onChange={setFilter} />
          <Link href="/superviseur/appels" className="btn btn-secondary">Voir les appels</Link>
        </div>
      </div>

      {/* Team stats */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" style={{ animationDelay: `${i * 60}ms` }} />)}
        </div>
      ) : stats && (
        <div className="stagger grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total appels"    value={stats.total}   accent="blue"
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>} />
          <StatCard label="Devis réalisés"  value={stats.devis}   accent="green"
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} />
          <StatCard label="Appels manqués"  value={stats.manques} accent="red"
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>} />
          <StatCard label="Taux conversion" value={`${stats.tauxConversion ?? 0}%`}
            accent={stats.tauxConversion >= 30 ? "green" : stats.tauxConversion >= 15 ? "orange" : "red"}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>} />
        </div>
      )}

      {/* Agent breakdown */}
      {!loading && stats?.agents?.length > 0 && (
        <div className="card overflow-hidden animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="section-title mb-0">Conseillers — {stats.agents.length} actifs</h2>
            <Link href="/superviseur/equipe" className="text-xs font-medium" style={{ color: "var(--brand)" }}>Gérer l'équipe →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: "600px" }}>
              <thead>
                <tr>
                  <th className="table-th">#</th>
                  <th className="table-th">Conseiller</th>
                  <th className="table-th">Téléphone</th>
                  <th className="table-th text-right">Appels</th>
                  <th className="table-th text-right">Devis</th>
                  <th className="table-th text-right">Manqués</th>
                  <th className="table-th" style={{ minWidth: "160px" }}>Conversion</th>
                </tr>
              </thead>
              <tbody>
                {[...stats.agents]
                  .sort((a: any, b: any) => b.devis - a.devis || b.total - a.total)
                  .map((a: any, i: number) => {
                    const pct      = a.tauxConversion ?? 0;
                    const barColor = pct >= 40 ? "#22C55E" : pct >= 20 ? "#F59E0B" : "#EF4444";
                    return (
                      <tr key={a.id}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                        <td className="table-td w-8 text-center text-base">
                          {i < 3 ? MEDALS[i] : <span className="text-xs" style={{ color: "var(--text-muted)" }}>{i + 1}</span>}
                        </td>
                        <td className="table-td">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{ background: "var(--brand-light)", color: "var(--brand)" }}>
                              {a.prenom?.[0]}{a.nom?.[0]}
                            </div>
                            <span className="text-sm font-medium">{a.prenom} {a.nom}</span>
                          </div>
                        </td>
                        <td className="table-td"><span className="mono text-xs" style={{ color: "var(--text-muted)" }}>{a.phoneNumber || "—"}</span></td>
                        <td className="table-td text-right font-semibold text-sm">{a.total}</td>
                        <td className="table-td text-right">
                          <span className="badge badge-green">{a.devis}</span>
                        </td>
                        <td className="table-td text-right">
                          <span className="badge badge-red">{a.manques}</span>
                        </td>
                        <td className="table-td">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--surface-3)" }}>
                              <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
                            </div>
                            <span className="text-xs font-bold tabular-nums w-10 text-right" style={{ color: barColor }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !stats?.agents?.length && (
        <div className="card empty-state animate-fade-in">
          <div className="empty-state-icon">
            <svg className="w-6 h-6" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <p className="empty-state-title">Aucun conseiller dans votre équipe</p>
          <p className="empty-state-text">
            <Link href="/superviseur/equipe" style={{ color: "var(--brand)" }}>Gérer mon équipe →</Link>
          </p>
        </div>
      )}
    </div>
  );
}
