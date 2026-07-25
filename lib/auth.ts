import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { upsertUserOnLogin } from './users';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'email-auth',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'operator@ultron.io' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error('Email address is required.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
          throw new Error('Please enter a valid email address.');
        }

        if (!credentials?.password || credentials.password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }

        const email = credentials.email.trim().toLowerCase();
        const displayName = email.split('@')[0].toUpperCase();

        // Save / update user in MongoDB database
        const userDoc = await upsertUserOnLogin(email, displayName);

        return {
          id: userDoc._id ? String(userDoc._id) : 'user-' + Math.random().toString(36).substring(7),
          name: userDoc.name || displayName,
          email: userDoc.email,
          role: userDoc.role || 'SEC_OFFICER',
          image: null
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role || 'SEC_OFFICER';
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).role = token.role as string;
        (session.user as any).id = token.id as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'ultron-next-auth-email-secret-key-32bytes',
};
