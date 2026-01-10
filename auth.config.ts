
import type { NextAuthConfig } from "next-auth"

export default {
    providers: [],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // User is typed correctly now due to module augmentation
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (token.role && session.user) {
                session.user.role = token.role as "ADMIN" | "COACH"
            }
            return session
        }
    }
} satisfies NextAuthConfig
