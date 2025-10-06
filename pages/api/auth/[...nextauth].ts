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
          const email = (profile as { email?: string })?.email;
          const name = (profile as { name?: string })?.name;
          const picture = (profile as { picture?: string })?.picture; // biasanya URL

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
        token.id = (user as unknown as { id: string }).id;
        token.username = (user as unknown as { username: string }).username;
        token.role = (user as unknown as { role: string }).role;
        token.emailOrPhone = (user as unknown as { emailOrPhone: string }).emailOrPhone ?? "";
        token.avatar = (user as unknown as { avatar?: string }).avatar ?? "";
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

export default NextAuth(authOptions);
