# AssurPilot — MVP v7

Plateforme SaaS de gestion des appels entrants pour centres d'assurance (marché français).

---

## 🚀 Démarrage local (SQLite)

```bash
# 1. Pour tester en local avec SQLite, modifier prisma/schema.prisma :
#    provider = "sqlite"
#    et dans .env : DATABASE_URL="file:./dev.db"

npm install
npm run db:push
npm run db:seed
npm run dev
```

Ouvrir : http://localhost:3000

## 📋 Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Administrateur | admin@assurpilot.fr | admin123 |
| Coach | coach@assurpilot.fr | coach123 |
| Conseiller | marie.laurent@assurpilot.fr | agent123 |
| Conseiller | pierre.durand@assurpilot.fr | agent123 |

---

## 🌐 Déploiement Vercel + PostgreSQL

### 1. Créer une base PostgreSQL
- [Neon.tech](https://neon.tech) (recommandé) → New Project → région `eu-west-1`
- Copier la connection string : `postgresql://user:pass@host/dbname?sslmode=require`

### 2. Préparer le projet
```bash
# Dans prisma/schema.prisma, s'assurer que :
#   provider = "postgresql"

# Dans .env (production) :
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://votre-app.vercel.app"
CRON_SECRET="$(openssl rand -base64 32)"
```

### 3. Déployer sur Vercel
```bash
npx vercel --prod
```
Ou connecter le repo GitHub dans le dashboard Vercel.

### 4. Variables d'environnement Vercel
Dans Vercel → Settings → Environment Variables :
```
DATABASE_URL         = postgresql://...
NEXTAUTH_SECRET      = votre-secret
NEXTAUTH_URL         = https://votre-app.vercel.app
CRON_SECRET          = votre-cron-secret
```

### 5. Push du schéma + seed
```bash
DATABASE_URL="postgresql://..." npx prisma db push
DATABASE_URL="postgresql://..." npm run db:seed
```

### 6. Vercel Cron Jobs
Le fichier `vercel.json` configure un cron quotidien à 18h10 :
```json
{ "crons": [{ "path": "/api/cron/cleanup", "schedule": "10 18 * * *" }] }
```
L'endpoint est sécurisé par `CRON_SECRET` (header `Authorization: Bearer ...`).

---

## 📞 Intégration Keyyo

**Keyyo gère la distribution des appels. AssurPilot importe et analyse uniquement.**

### Import fichier (recommandé)
1. Dans Keyyo → exporter l'historique des appels en CSV/Excel
2. Dans AssurPilot → Admin → Appels → Importer fichier
3. Prévisualiser les données, vérifier les correspondances conseillers
4. Importer — les doublons sont détectés automatiquement

### Mapping des colonnes Keyyo
| Colonne Keyyo | Champ AssurPilot |
|---|---|
| Numéro présenté | Numéro du client (callerNumber) |
| Numéro appelé | Identification du conseiller (phoneNumber) |
| Début d'appel | Date et heure de l'appel |
| Durée réelle (s) | Durée en secondes (0 = manqué) |

### Lignes configurées
| Ligne | Numéro |
|-------|--------|
| Ligne Auto | 0988288362 |
| Ligne Santé | 0180873462 |

---

## 🔒 Règles de visibilité des données

| Rôle | Données visibles | Archivage |
|------|-----------------|-----------|
| Conseiller | 5 derniers jours | Données archivées masquées |
| Coach | 20 derniers jours | Données archivées masquées |
| Admin | Tout, sans limite | Accès complet incluant archivé |

Le cron quotidien à 18h10 **archive** (soft) les appels > 20 jours. Il ne supprime rien.
L'admin conserve toujours un accès complet à l'historique.

---

## 📁 Stack technique

- **Frontend** : Next.js 14 App Router
- **Auth** : NextAuth.js (JWT)
- **ORM** : Prisma (PostgreSQL prod / SQLite dev)
- **UI** : Tailwind CSS + DM Sans / DM Mono
- **Cron** : Vercel Cron Jobs
