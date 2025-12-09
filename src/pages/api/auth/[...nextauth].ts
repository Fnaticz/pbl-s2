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
        try {
          await connectDB();
    
          const email = profile?.email;
          const name = profile?.name || "";
          const avatar = profile?.picture || "";
          const googleId = account?.providerAccountId;
    
          if (!email || !googleId) {
            return false;
          }
    
          // Check by googleId first
          let dbUser = await User.findOne({ googleId });
    
          // If not found by googleId, check by email
          if (!dbUser) {
            dbUser = await User.findOne({ emailOrPhone: email });
            
            // If user exists by email but doesn't have googleId, update it
            if (dbUser && !dbUser.googleId) {
              dbUser.googleId = googleId;
              await dbUser.save();
            }
          }
    
          // If user doesn't exist, redirect to registration
          if (!dbUser) {
            return `/register/google?status=not_registered&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&avatar=${encodeURIComponent(avatar)}&googleId=${encodeURIComponent(googleId)}`;
          }
    
          // Check if email is verified (for security)
          // Allow login even if not verified, but we can add a check here if needed
          
          return true;
        } catch (error) {
          console.error("Google signIn error:", error);
          return false;
        }
      }
    
      return true;
    },

    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await connectDB();

          const googleId = account.providerAccountId;
          let dbUser = await User.findOne({ googleId });

          // Fallback: find by email if not found by googleId
          if (!dbUser && profile?.email) {
            dbUser = await User.findOne({ emailOrPhone: profile.email });
          }

          if (!dbUser) return token;

          token.id = dbUser._id.toString();
          token.username = dbUser.username;
          token.role = dbUser.role;
          token.emailOrPhone = dbUser.emailOrPhone;
          token.avatar = dbUser.avatar || profile?.picture || "";

          return token;
        } catch (error) {
          console.error("JWT callback error:", error);
          return token;
        }
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

    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
