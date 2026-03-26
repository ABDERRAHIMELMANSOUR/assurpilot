"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import CallsTable from "@/components/ui/CallsTable";
import StatCard from "@/components/ui/StatCard";
import DateFilter, { DateFilterState, buildQueryString } from "@/components/ui/DateFilter";

const EMPTY: DateFilterState = { period: "week", dateFrom: "", dateTo: "" };

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

export default function ConseillerPage() {
  const { data: session } = useSession();
  const [calls,   setCalls]   = useState<any[]>([]);
  const [stats,   setStats]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<DateFilterState>(EMPTY);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const qs = buildQueryString(filter);
    const [c, s] = await Promise.all([
      fetch("/api/calls" + qs).then((r) => r.json()),
      fetch("/api/analytics" + qs).then((r) => r.json()),
    ]);
    setCalls(c); setStats(s); setLoading(false);
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const user         = session?.user as any;
  const firstName    = user?.name?.split(" ")[0] ?? "";
  const pendingCount = calls.filter((c) => !c.isMissed && !c.result).length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header mb-5 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Bonjour, {firstName} 👋</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <DateFilter value={filter} onChange={setFilter} />
      </div>

      {/* Pending banner */}
      {!loading && pendingCount > 0 && (
        <div className="rounded-xl px-4 py-3 mb-5 flex items-center gap-3 animate-fade-in"
          style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
          <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#D97706" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <p className="text-sm" style={{ color: "#92400E" }}>
            <strong>{pendingCount} appel{pendingCount > 1 ? "s" : ""}</strong>{" "}
            {pendingCount > 1 ? "nécessitent" : "nécessite"} un résultat — cliquez <em>+ Résultat</em> dans le tableau.
          </p>
        </div>
      )}

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" style={{ animationDelay: `${i * 60}ms` }} />)}
        </div>
      ) : stats && (
        <div className="stagger grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Appels reçus" value={stats.total}
            sub={`${stats.repondus} répondus`} accent="blue"
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>}
          />
          <StatCard
            label="Appels manqués" value={stats.manques}
            sub={stats.total > 0 ? `${Math.round((stats.manques / stats.total) * 100)}% du total` : "0%"}
            accent="red"
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>}
          />
          <StatCard
            label="Devis réalisés" value={stats.devis}
            sub={`Taux ${stats.tauxConversion}%`} accent="green"
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
          <StatCard
            label="Durée moyenne" value={fmt(stats.dureeMoyenne)}
            sub="min:sec par appel" accent="purple"
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
        </div>
      )}

      {/* Calls table */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title mb-0">Mes appels</h2>
        {!loading && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {calls.length} appel{calls.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading
        ? <div className="card p-10 flex items-center justify-center gap-2" style={{ color: "var(--text-muted)" }}>
            <span className="w-4 h-4 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
            Chargement…
          </div>
        : <CallsTable calls={calls} allowResult showNotes onRefresh={fetchData} />
      }
    </div>
  );
}
