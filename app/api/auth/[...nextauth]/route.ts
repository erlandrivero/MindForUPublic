import NextAuth from "next-auth";
import { authOptions } from "@/libs/next-auth";
import EmailProvider from "next-auth/providers/email";
import config from "@/config";


const updatedAuthOptions = {
  ...authOptions,
  providers: [
    ...authOptions.providers,
    EmailProvider({
      server: {
        host: "smtp.resend.com",
        port: 465,
        auth: {
          user: "resend",
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: config.resend.fromNoReply,
    }),
  ],
};

const handler = NextAuth(updatedAuthOptions);

export { handler as GET, handler as POST };
