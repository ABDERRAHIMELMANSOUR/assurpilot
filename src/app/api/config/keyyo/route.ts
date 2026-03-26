// src/app/api/config/keyyo/route.ts
// Keyyo handles call routing — this SaaS only imports and analyzes call logs.
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function adminOnly(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "ADMINISTRATEUR") return NextResponse.json({ error: "Accès réservé à l'administrateur" }, { status: 403 });
  return null;
}

async function getOrCreate() {
  let c = await prisma.keyyoConfig.findFirst();
  if (!c) c = await prisma.keyyoConfig.create({ data: {} });
  return c;
}

export async function GET(req: NextRequest) {
  const err = await adminOnly(req);
  if (err) return err;
  const config = await getOrCreate();
  return NextResponse.json({
    ...config,
    apiKey: "",
    apiKeyMasked: config.apiKey ? "••••••••" + config.apiKey.slice(-4) : "",
  });
}

export async function PUT(req: NextRequest) {
  const err = await adminOnly(req);
  if (err) return err;
  const body = await req.json();
  const config = await getOrCreate();
  const data: any = {};
  if (body.webhookUrl !== undefined) data.webhookUrl = body.webhookUrl;
  if (body.isActive   !== undefined) data.isActive   = body.isActive;
  if (body.apiKey && body.apiKey.trim()) data.apiKey = body.apiKey.trim();
  const updated = await prisma.keyyoConfig.update({ where: { id: config.id }, data });
  return NextResponse.json({ ...updated, apiKey: "", apiKeyMasked: updated.apiKey ? "••••••••" + updated.apiKey.slice(-4) : "" });
}

export async function POST(req: NextRequest) {
  // "Test" — just validates that webhook URL and optionally API key are set
  const err = await adminOnly(req);
  if (err) return err;
  const config = await getOrCreate();
  const hasWebhook = config.webhookUrl.trim().length > 0;
  const success = hasWebhook;
  const message = hasWebhook
    ? "Configuration valide. L'URL de webhook est prête à recevoir les événements Keyyo."
    : "URL de webhook manquante. Renseignez l'URL puis copiez-la dans votre configuration Keyyo.";
  await prisma.keyyoConfig.update({
    where: { id: config.id },
    data: { lastTestedAt: new Date(), lastTestSuccess: success, lastTestMessage: message },
  });
  return NextResponse.json({ success, message });
}
