// pages/api/auth/[...nextauth].ts
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from '../../../lib/mongodb';
import User from '../../../models/user';
import bcrypt from "bcryptjs";

/**
 * Type augmentation
 */
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
    // Login dengan username + password
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username?.trim() || !credentials?.password?.trim()) {
            return null;
          }

          await connectDB();
          const user = await User.findOne({ username: credentials.username });
          if (!user) return null;

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          return {
            id: user._id.toString(),
            username: user.username,
            role: user.role,
            emailOrPhone: user.emailOrPhone,
            avatar: user.avatar || "",
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),

    // Login via Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/api/auth/handle-google-error",
  },
  
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Log sign in events if needed
    },
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    /**
     * Sign In Callback - Cek sebelum JWT dibuat
     */
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await connectDB();
          const email = (profile as any)?.email;
          const name = (profile as any)?.name || "";
          const picture = (profile as any)?.picture || "";
          const dbUser = await User.findOne({ emailOrPhone: email });
          
          // Jika user belum terdaftar, simpan data Google ke temporary store
          // dan return false untuk trigger error callback
          if (!dbUser) {
            console.log("Google: user belum terdaftar, simpan data untuk register =", email);
            
            // Simpan data ke temporary store
            try {
              const { saveGoogleDataForRegister } = await import('./handle-google-error');
              
              // Simpan dengan email sebagai key (fallback yang lebih reliable)
              saveGoogleDataForRegister(`email_${email}`, email, name, picture);
              
              // Simpan juga dengan state jika ada (untuk register flow)
              if (account.state) {
                saveGoogleDataForRegister(account.state, email, name, picture);
              }
            } catch (importError) {
              console.error("Error saving Google data:", importError);
            }
            
            return false; // Return false akan trigger error callback
          }
          
          return true; // User sudah terdaftar, lanjutkan login
        } catch (err) {
          console.error("Sign in callback error:", err);
          return false;
        }
      }
      return true;
    },

    /**
     * JWT Callback
     */
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await connectDB();
          const email = (profile as any)?.email;
          const picture = (profile as any)?.picture || "";
          
          const dbUser = await User.findOne({ emailOrPhone: email });
          
          // Seharusnya tidak sampai di sini jika user belum terdaftar
          if (!dbUser) {
            throw new Error("NOT_REGISTERED");
          }

          token.id = dbUser._id.toString();
          token.username = dbUser.username;
          token.role = dbUser.role;
          token.emailOrPhone = dbUser.emailOrPhone;
          token.avatar = dbUser.avatar ?? picture;
        } catch (err) {
          console.error("JWT google login error:", err);
          throw err;
        }
      }

      /**
       * Credentials Login
       */
      else if (user) {
        token.id = (user as any).id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.emailOrPhone = (user as any).emailOrPhone ?? "";
        token.avatar = (user as any).avatar ?? "";
      }

      /**
       * Refresh avatar/username penggunaan berikutnya
       */
      else {
        if (token.emailOrPhone && !token.avatar) {
          try {
            await connectDB();
            const dbUser = await User.findOne({ emailOrPhone: token.emailOrPhone }).select("avatar username role");
            if (dbUser) {
              token.avatar = dbUser.avatar ?? "";
              token.username = dbUser.username ?? token.username;
              token.role = dbUser.role ?? token.role;
            }
          } catch (err) {
            console.error("JWT refresh error:", err);
          }
        }
      }

      return token;
    },

    /**
     * Session callback — kirim token ke client
     */
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

/**
 * Handler
 */
const nextAuthHandler = NextAuth(authOptions);

export default async function auth(req: any, res: any) {
  if (!process.env.NEXTAUTH_URL && req?.headers?.host) {
    const proto =
      (req.headers["x-forwarded-proto"] as string | undefined) ||
      (req.connection && (req.connection as any).encrypted ? "https" : "http");

    process.env.NEXTAUTH_URL = `${proto}://${req.headers.host}`;
  }

  return nextAuthHandler(req, res);
}
