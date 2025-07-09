import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/user";
import bcrypt from "bcryptjs";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("🔥 Starting authorize");

          if (!credentials?.username?.trim() || !credentials?.password?.trim()) {
            console.log("⛔ Missing username or password");
            return null;
          }

          console.log("🔗 Connecting to MongoDB...");
          await connectDB();
          console.log("✅ Connected to MongoDB");

          const user = await User.findOne({ username: credentials.username });
          console.log("👤 Fetched user:", user);

          if (!user) {
            console.log("❌ User not found");
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log("🔐 Password match:", isValid);

          if (!isValid) return null;

          console.log("✅ User authorized:", user.username);

          return {
            id: user._id.toString(),
            username: user.username,
            role: user.role,
          };
        } catch (error) {
          console.error("❌ Authorize error:", error);
          return null;
        }
      },
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
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id: string; username: string; role: string };
        token.id = u.id;
        token.username = u.username;
        token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      try {
        session.user = {
          id: token?.id ?? "",
          username: token?.username ?? "",
          role: token?.role ?? "",
        };
        return session;
      } catch (e) {
        console.error("❌ Session callback error:", e);
        return session;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
