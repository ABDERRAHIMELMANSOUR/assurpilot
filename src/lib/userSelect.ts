// src/lib/userSelect.ts
// Shared Prisma select object for user queries.
// Kept outside route files to avoid Next.js "invalid Route export" build errors.

export const USER_SELECT = {
  id: true, nom: true, prenom: true, email: true, phoneNumber: true,
  role: true, isActive: true, teamId: true,
  superviseurId: true, createdAt: true, lastLoginAt: true,
  team:        { select: { id: true, nom: true } },
  superviseur: { select: { id: true, nom: true, prenom: true, phoneNumber: true } },
} as const;
