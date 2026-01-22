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

## Utiliser les périodes
- Par défaut, l'application affiche un **récap 2 semaines** (filtre global en haut des pages).
- Pour changer la période, utilisez le sélecteur (2 semaines, 1 mois, 3 mois) ou “Personnalisé” puis **Appliquer**.

## Ajouter un revenu ou une dépense récurrent(e)
1. Ouvrez l’onglet **Récurrents**.
2. Renseignez le type (revenu/dépense), la fréquence, les dates et le montant.
3. Pour une **dépense**, la catégorie est obligatoire.
4. Validez avec **Ajouter** : les occurrences seront prises en compte dans la projection.

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
