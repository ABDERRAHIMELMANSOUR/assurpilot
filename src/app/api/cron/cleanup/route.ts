// src/app/api/cron/cleanup/route.ts
// Vercel Cron Job — runs daily at 18:10 (configured in vercel.json)
// Soft-archives calls older than the role-based thresholds.
// IMPORTANT: Admin always retains full access — we never hard-delete.
// Conseillers see 5 days, Coachs see 20 days (filtered at API level).
// This cron soft-archives calls older than 20 days so DB stays lean,
// while Admin queries skip the archivedAt filter entirely.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify cron secret — Vercel sets the Authorization header automatically
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();

  // Soft-archive calls older than 20 days that aren't already archived
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 20);

  const result = await prisma.call.updateMany({
    where: {
      startedAt: { lt: cutoff },
      archivedAt: null,
    },
    data: {
      archivedAt: now,
    },
  });

  // Also clean up login logs older than 90 days
  const logCutoff = new Date(now);
  logCutoff.setDate(logCutoff.getDate() - 90);
  const logResult = await prisma.loginLog.deleteMany({
    where: { createdAt: { lt: logCutoff } },
  });

  console.log(`[CRON] ${now.toISOString()} — archived ${result.count} calls, deleted ${logResult.count} login logs`);

  return NextResponse.json({
    ok: true,
    archivedCalls: result.count,
    deletedLogs: logResult.count,
    runAt: now.toISOString(),
  });
}
