"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

function NavLink({ href, label, icon }: { href: string; label: string; icon?: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href) && href.length > 1);
  return (
    <Link
      href={href}
      className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
        active
          ? "bg-blue-50 text-blue-700 font-medium shadow-[inset_0_1px_2px_rgba(37,99,235,.08)]"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      }`}
    >
      {icon ? (
        <span className={`flex-shrink-0 transition-colors ${active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}>
          {icon}
        </span>
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${active ? "bg-blue-500" : "bg-slate-300 group-hover:bg-slate-400"}`} />
      )}
      {label}
    </Link>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-[0.08em]">
      {label}
    </p>
  );
}

function Divider() {
  return <div className="mx-3 my-1.5 h-px bg-slate-100" />;
}

/* ─── Icons (inline SVG, no extra dep) ─── */
const icons = {
  home:      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"/></svg>,
  phone:     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>,
  upload:    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4-4 4M12 8v8"/></svg>,
  chart:     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
  team:      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  activity:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  users:     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>,
  trophy:    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>,
  settings:  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3" strokeWidth={1.8} /></svg>,
  profile:   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  keyyo:     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  results:   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>,
};

const roleLabel: Record<string, string> = {
  CONSEILLER:     "Conseiller",
  SUPERVISEUR:    "Coach",
  ADMINISTRATEUR: "Administrateur",
};

const roleGradient: Record<string, string> = {
  CONSEILLER:     "from-blue-500 to-blue-600",
  SUPERVISEUR:    "from-amber-500 to-orange-500",
  ADMINISTRATEUR: "from-violet-500 to-purple-600",
};

const roleBadge: Record<string, string> = {
  CONSEILLER:     "badge-blue",
  SUPERVISEUR:    "badge-orange",
  ADMINISTRATEUR: "badge-purple",
};

export default function Sidebar() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = user?.role ?? "CONSEILLER";
  const initials = user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() ?? "?";

  return (
    <aside className="w-60 min-h-screen flex flex-col flex-shrink-0" style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}>

      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md flex-shrink-0">
            <svg className="w-4.5 h-4.5 text-white" style={{width:"18px",height:"18px"}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-none">AssurPilot</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Gestion des appels</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">

        {role === "CONSEILLER" && (
          <div className="animate-slide-in space-y-0.5">
            <NavLink href="/conseiller"       label="Mes appels"       icon={icons.phone} />
            <NavLink href="/conseiller/stats" label="Mes statistiques" icon={icons.chart} />
            <SectionLabel label="Mon compte" />
            <NavLink href="/profil" label="Mon profil" icon={icons.profile} />
          </div>
        )}

        {role === "SUPERVISEUR" && (
          <div className="animate-slide-in space-y-0.5">
            <SectionLabel label="Tableau de bord" />
            <NavLink href="/superviseur"          label="Vue d'ensemble"  icon={icons.home} />
            <NavLink href="/superviseur/appels"   label="Appels équipe"   icon={icons.phone} />
            <SectionLabel label="Équipe" />
            <NavLink href="/superviseur/equipe"   label="Mon équipe"      icon={icons.team} />
            <NavLink href="/superviseur/activite" label="Activité"        icon={icons.activity} />
            <SectionLabel label="Mon compte" />
            <NavLink href="/profil" label="Mon profil" icon={icons.profile} />
          </div>
        )}

        {role === "ADMINISTRATEUR" && (
          <div className="animate-slide-in space-y-0.5">
            <SectionLabel label="Tableau de bord" />
            <NavLink href="/admin"            label="Vue globale"    icon={icons.home} />
            <NavLink href="/admin/classement" label="Classement"     icon={icons.trophy} />

            <SectionLabel label="Appels" />
            <NavLink href="/admin/appels"        label="Tous les appels" icon={icons.phone} />
            <NavLink href="/admin/appels/import" label="Import fichier"  icon={icons.upload} />

            <SectionLabel label="Gestion" />
            <NavLink href="/admin/utilisateurs" label="Utilisateurs"  icon={icons.users} />
            <NavLink href="/admin/conseillers"  label="Conseillers"   icon={icons.team} />
            <NavLink href="/admin/coachs"       label="Coachs"        icon={icons.team} />
            <NavLink href="/admin/activite"     label="Activité"      icon={icons.activity} />

            <SectionLabel label="Configuration" />
            <NavLink href="/admin/resultats" label="Résultats d'appel" icon={icons.results} />
            <NavLink href="/admin/keyyo"     label="Intégration Keyyo" icon={icons.keyyo} />

            <SectionLabel label="Mon compte" />
            <NavLink href="/profil" label="Mon profil" icon={icons.profile} />
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-default mb-1">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleGradient[role]} flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm`}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
            <span className={`badge text-[10px] ${roleBadge[role]}`}>{roleLabel[role]}</span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
