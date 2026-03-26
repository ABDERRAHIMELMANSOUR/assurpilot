// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ROLE_CUTOFF_DAYS: Record<string, number> = {
  CONSEILLER:     5,
  SUPERVISEUR:    20,
  ADMINISTRATEUR: 0,
};

function getRoleCutoffDate(role: string): Date | null {
  const days = ROLE_CUTOFF_DAYS[role] ?? 5;
  if (days === 0) return null;
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildDateFilter(searchParams: URLSearchParams, role: string) {
  const dateFrom = searchParams.get("dateFrom");
  const dateTo   = searchParams.get("dateTo");
  const period   = searchParams.get("period");

  let userStart: Date | undefined;
  let userEnd:   Date | undefined;

  if (period) {
    const now = new Date();
    userEnd = new Date(now);
    if (period === "today") {
      userStart = new Date(now); userStart.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      userStart = new Date(now); userStart.setDate(userStart.getDate() - 7);
    } else if (period === "month") {
      userStart = new Date(now); userStart.setDate(1); userStart.setHours(0, 0, 0, 0);
    }
  } else {
    if (dateFrom) userStart = new Date(dateFrom);
    if (dateTo)   { userEnd = new Date(dateTo); userEnd.setHours(23, 59, 59, 999); }
  }

  const roleCutoff = getRoleCutoffDate(role);
  let effectiveStart: Date | undefined;
  if (roleCutoff && userStart) {
    effectiveStart = userStart > roleCutoff ? userStart : roleCutoff;
  } else if (roleCutoff) {
    effectiveStart = roleCutoff;
  } else {
    effectiveStart = userStart;
  }

  const filter: any = {};
  if (effectiveStart) filter.gte = effectiveStart;
  if (userEnd)        filter.lte = userEnd;
  return Object.keys(filter).length ? filter : undefined;
}

function calcStats(calls: any[]) {
  const total        = calls.length;
  const manques      = calls.filter((c) => c.isMissed).length;
  const repondus     = total - manques;
  const devis        = calls.filter((c) => c.result?.resultat === "DEVIS_REALISE").length;
  const durations    = calls.filter((c) => c.durationSeconds > 0).map((c) => c.durationSeconds);
  const dureeMoyenne = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;
  const tauxConversion = repondus > 0 ? Math.round((devis / repondus) * 100) : 0;
  return { total, manques, repondus, devis, dureeMoyenne, tauxConversion };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const { searchParams } = new URL(req.url);
  const dateFilter = buildDateFilter(searchParams, user.role);
  const startedAtWhere = dateFilter ? { startedAt: dateFilter } : {};
  const archiveFilter  = user.role !== "ADMINISTRATEUR" ? { archivedAt: null } : {};

  if (user.role === "CONSEILLER") {
    const calls = await prisma.call.findMany({
      where: { assignedUserId: user.userId, ...startedAtWhere, ...archiveFilter },
      include: { result: true },
    });
    return NextResponse.json(calcStats(calls));
  }

  if (user.role === "SUPERVISEUR") {
    const agents = await prisma.user.findMany({
      where: { superviseurId: user.userId, role: "CONSEILLER", isActive: true },
      include: {
        assignedCalls: {
          where: { ...startedAtWhere, ...archiveFilter },
          include: { result: true },
        },
      },
    });

    const agentStats = agents.map((a) => {
      const stats = calcStats(a.assignedCalls);
      return {
        id: a.id,
        nom: a.nom,
        prenom: a.prenom,
        phoneNumber: a.phoneNumber,
        ...stats,
      };
    });

    const allCalls = agents.flatMap((a) => a.assignedCalls);
    const totals   = calcStats(allCalls);
    return NextResponse.json({ ...totals, agents: agentStats });
  }

  // ADMINISTRATEUR
  const allCalls = await prisma.call.findMany({
    where: { ...startedAtWhere },
    include: { result: true, assignedUser: { select: { id: true, nom: true, prenom: true, phoneNumber: true } } },
  });

  const totals = calcStats(allCalls);

  // Leaderboard
  const byAgent: Record<string, any> = {};
  for (const call of allCalls) {
    if (!call.assignedUser) continue;
    const uid = call.assignedUser.id;
    if (!byAgent[uid]) {
      byAgent[uid] = { ...call.assignedUser, calls: [] };
    }
    byAgent[uid].calls.push(call);
  }
  const leaderboard = Object.values(byAgent)
    .map((a: any) => ({ ...a, ...calcStats(a.calls), calls: undefined }))
    .sort((a: any, b: any) => b.devis - a.devis || b.total - a.total);

  return NextResponse.json({ ...totals, leaderboard });
}
