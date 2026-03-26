// src/app/api/calls/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Role-based maximum lookback (days). Admin = unlimited (0).
const ROLE_CUTOFF_DAYS: Record<string, number> = {
  CONSEILLER:     5,
  SUPERVISEUR:    20,
  ADMINISTRATEUR: 0,
};

function getRoleCutoffDate(role: string): Date | null {
  const days = ROLE_CUTOFF_DAYS[role] ?? 5;
  if (days === 0) return null; // Admin: no cutoff
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const user = session.user as any;
  const { searchParams } = new URL(req.url);

  // User-requested date filter
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

  // Role cutoff — enforced server-side, cannot be bypassed by the client
  const roleCutoff = getRoleCutoffDate(user.role);

  // Effective start = max(userStart, roleCutoff)
  let effectiveStart: Date | undefined;
  if (roleCutoff && userStart) {
    effectiveStart = userStart > roleCutoff ? userStart : roleCutoff;
  } else if (roleCutoff) {
    effectiveStart = roleCutoff;
  } else {
    effectiveStart = userStart; // Admin: use whatever the user requested (or nothing)
  }

  // Build where clause
  const where: any = {};

  // Scope by role
  if (user.role === "CONSEILLER") {
    where.assignedUserId = user.userId;
  } else if (user.role === "SUPERVISEUR") {
    where.assignedUser = { teamId: user.teamId };
  }
  // ADMINISTRATEUR: no scope filter

  // Date range
  where.startedAt = {};
  if (effectiveStart) where.startedAt.gte = effectiveStart;
  if (userEnd)        where.startedAt.lte = userEnd;
  if (!effectiveStart && !userEnd) delete where.startedAt;

  // Admins see archived calls too; others do not
  if (user.role !== "ADMINISTRATEUR") {
    where.archivedAt = null;
  }

  const calls = await prisma.call.findMany({
    where,
    include: {
      phoneLine:    true,
      assignedUser: { select: { id: true, nom: true, prenom: true, phoneNumber: true } },
      result:       true,
    },
    orderBy: { startedAt: "desc" },
    take: 500,
  });

  return NextResponse.json(calls);
}
