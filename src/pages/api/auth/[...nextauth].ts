import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/user";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      emailOrPhone: string;
      avatar?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    emailOrPhone: string;
    avatar?: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) return null;

          await connectDB();
          const user = await User.findOne({ username: credentials.username });
          if (!user) return null;

          const valid = await bcrypt.compare(credentials.password, user.password);
          if (!valid) return null;

          return {
            id: user._id.toString(),
            username: user.username,
            role: user.role,
            emailOrPhone: user.emailOrPhone,
            avatar: user.avatar || "",
          };
        } catch {
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/api/auth/handle-google-error",
  },

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        await connectDB();

        const email = profile?.email || "";
        const name = profile?.name || "";
        const avatar = profile?.picture || "";
        const googleId = account?.providerAccountId;

        const dbUser = await User.findOne({ googleId });

        if (!dbUser) {
          return `/register/google?email=${email}&name=${name}&avatar=${avatar}&googleId=${googleId}`;
        }

        return true;
      }

      return true;
    },

    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google") {
        await connectDB();

        const googleId = account.providerAccountId;
        const dbUser = await User.findOne({ googleId });

        if (!dbUser) return token;

        token.id = dbUser._id.toString();
        token.username = dbUser.username;
        token.role = dbUser.role;
        token.emailOrPhone = dbUser.emailOrPhone;
        token.avatar = dbUser.avatar ?? profile?.picture;

        return token;
      }

      if (user) {
        token.id = user.id as string;
        token.username = user.username as string;
        token.role = user.role as string;
        token.emailOrPhone = user.emailOrPhone as string;
        token.avatar = user.avatar as string;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.emailOrPhone = token.emailOrPhone as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
