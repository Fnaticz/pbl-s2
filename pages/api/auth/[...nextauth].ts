// pages/api/auth/[...nextauth].ts
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/user";
import bcrypt from "bcryptjs";

/**
 * Type augmentation (tetap ada)
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
    // Credentials provider (tetap ada)
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

          // return object yang akan masuk ke jwt callback sebagai `user`
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

    // Google OAuth2
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login?error=credentials",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    /**
     * jwt: dipanggil saat sign in (user/account/profile tersedia) dan on subsequent requests
     * - saat account.provider === 'google' => upsert user di DB berdasarkan email
     * - saat user (credentials) => token diisi dari authorize()
     * - otherwise => jika perlu, refresh token info dari DB
     */
    async jwt({ token, user, account, profile }) {
      // 1) Initial sign-in for Google:
      if (account?.provider === "google") {
        try {
          await connectDB();
          const email = (profile as any)?.email;
          const name = (profile as any)?.name;
          const picture = (profile as any)?.picture; // biasanya URL

          // upsert user by email
          let dbUser = await User.findOne({ emailOrPhone: email });

          if (!dbUser) {
            dbUser = await User.create({
              username: name ?? (email ? email.split("@")[0] : "google-user"),
              emailOrPhone: email,
              role: "member", // default role for Google signups
              avatar: picture || "",
            });
          } else {
            // update data minimal jika kosong
            let updated = false;
            if ((!dbUser.avatar || dbUser.avatar === "") && picture) {
              dbUser.avatar = picture;
              updated = true;
            }
            if ((!dbUser.username || dbUser.username === "") && name) {
              dbUser.username = name;
              updated = true;
            }
            if (updated) await dbUser.save();
          }

          token.id = dbUser._id.toString();
          token.username = dbUser.username;
          token.role = dbUser.role;
          token.emailOrPhone = dbUser.emailOrPhone;
          token.avatar = dbUser.avatar ?? "";
        } catch (err) {
          console.error("JWT google upsert error:", err);
        }
      }
      // 2) Credentials sign-in path (authorize returned user)
      else if (user) {
        token.id = (user as any).id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.emailOrPhone = (user as any).emailOrPhone ?? "";
        token.avatar = (user as any).avatar ?? "";
      }
      // 3) Subsequent requests: ensure token has fresh avatar (optional)
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

    // map token -> session (dikirim ke client)
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
 * Custom handler agar base URL NextAuth otomatis menyesuaikan domain saat ini
 * bila NEXTAUTH_URL di environment belum di-set dengan benar.
 *
 * Ini membantu ketika domain Netlify berubah (mis. dari pbl-s2 ke spartanbwx)
 * sehingga callback login/logout tidak lagi mengarah ke domain lama.
 */
const nextAuthHandler = NextAuth(authOptions);

export default function auth(req: any, res: any) {
  // Jika NEXTAUTH_URL belum di-set dengan benar, fallback ke host yang datang dari request
  if (!process.env.NEXTAUTH_URL && req?.headers?.host) {
    const proto =
      (req.headers["x-forwarded-proto"] as string | undefined) ||
      (req.connection && (req.connection as any).encrypted ? "https" : "http");
    process.env.NEXTAUTH_URL = `${proto}://${req.headers.host}`;
  }

  return nextAuthHandler(req, res);
}
