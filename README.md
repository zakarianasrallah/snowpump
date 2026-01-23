# Finance Foyer (MVP)

Application Next.js 14 (App Router) pour gérer les revenus/dépenses d'un foyer, avec conversion MAD→CAD et rapports mensuels.

## Stack
- Next.js 14 + TypeScript
- Tailwind + composants inspirés shadcn/ui
- PostgreSQL + Prisma
- NextAuth (Credentials)
- Vitest + Playwright

## Prérequis
- Node.js 18+
- Docker + docker-compose

## Installation

```bash
npm install
```

## Variables d'environnement

Créez un fichier `.env` :

```
DATABASE_URL=postgresql://finance:finance@localhost:5432/finance_foyer?schema=public
NEXTAUTH_SECRET=change-me
NEXTAUTH_URL=http://localhost:3000
```

## Lancer la base de données

```bash
docker-compose up -d
```

## Migrations & seed

```bash
npm run prisma:migrate
npm run seed
```

## Lancer le serveur

```bash
npm run dev
```

## Tests

```bash
npm run test
npm run test:e2e
```

## Ajouter des revenus
- Dans le Dashboard, utilisez **Ajouter une transaction ponctuelle** et choisissez le type **Revenu**.
- Pour un revenu régulier, utilisez **Ajouter un revenu récurrent** et sélectionnez la fréquence (hebdo, bimensuel, mensuel 4 semaines, mensuel calendrier).

## Scripts
- `npm run dev` : serveur Next.js
- `npm run build` : build production
- `npm run prisma:studio` : Prisma Studio
- `npm run seed` : seed catégories par défaut

## Notes
- Devise de base: CAD
- Saisie possible en CAD ou MAD
- Conversion MAD→CAD via API officielle CBSA
- Timezone: America/Montreal
