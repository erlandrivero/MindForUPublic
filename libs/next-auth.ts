import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import config from "@/config";
import connectMongo from "./mongo";

interface NextAuthOptionsExtended extends NextAuthOptions {
  adapter?: any;
}

export const authOptions: NextAuthOptionsExtended = {
  // Set any random key in .env.local
  secret: process.env.NEXTAUTH_SECRET || "",
  providers: [
    GoogleProvider({
      // Follow the "Login with Google" tutorial to get your credentials
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.given_name ? profile.given_name : profile.name,
          email: profile.email,
          image: profile.picture,
          createdAt: new Date(),
        };
      },
    }),
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: config.resend.fromNoReply,
      // Customize the magic link email
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const { host } = new URL(url);
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/send-magic-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            url,
            host,
          }),
        });
        if (!res.ok) {
          throw new Error('Failed to send magic link email');
        }
      },
    }),

  ],
  // New users will be saved in Database (MongoDB Atlas). Each user (model) has some fields like name, email, image, etc..
  // Requires a MongoDB database. Set MONOGODB_URI env variable.
  // Learn more about the model type: https://next-auth.js.org/v3/adapters/models
  ...(connectMongo && { adapter: MongoDBAdapter(connectMongo) }),

  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub || "";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  theme: {
    brandColor: config.colors.main,
    // Add you own logo below. Recommended size is rectangle (i.e. 200x50px) and show your logo + name.
    // It will be used in the login flow to display your logo. If you don't add it, it will look faded.
    logo: `/icon.png`, // Using the icon from the app root
  },
  pages: {
    signIn: '/signin',
  },
};

export default NextAuth(authOptions);
