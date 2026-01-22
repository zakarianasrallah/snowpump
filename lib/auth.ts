import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare, hash } from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt'
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const email = credentials.email.toLowerCase();
        const existing = await prisma.user.findUnique({
          where: { email }
        });

        if (!existing) {
          const household = await prisma.household.create({
            data: {
              name: 'Foyer'
            }
          });

          await prisma.category.createMany({
            data: [
              'Loyer',
              'Épicerie',
              'Bébé',
              'Abonnements',
              'Transport',
              'Assurance',
              'Crédit / Prêt',
              'Énergie',
              'Transfert international',
              'Santé',
              'Maison',
              'Autre'
            ].map((name) => ({
              name,
              householdId: household.id
            }))
          });

          const passwordHash = await hash(credentials.password, 10);
          const user = await prisma.user.create({
            data: {
              email,
              passwordHash,
              householdId: household.id
            }
          });

          return { id: user.id, email: user.email };
        }

        const isValid = await compare(credentials.password, existing.passwordHash);
        if (!isValid) {
          return null;
        }

        return { id: existing.id, email: existing.email };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  }
};
