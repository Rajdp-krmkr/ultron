import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

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

        // Return authenticated email user session payload
        return {
          id: 'user-' + Math.random().toString(36).substring(7),
          name: credentials.email.split('@')[0].toUpperCase(),
          email: credentials.email,
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'ultron-next-auth-email-secret-key-32bytes',
};
