import { type DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

export type ExtendedUser = DefaultSession["user"] & {
    role: string
}

declare module "next-auth" {
    interface Session {
        user: ExtendedUser
    }

    interface User {
        role: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: string
    }
}
