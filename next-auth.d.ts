
import { type DefaultSession } from "next-auth"
import { type Role } from "@prisma/client"
import { JWT } from "next-auth/jwt"

export type ExtendedUser = DefaultSession["user"] & {
    role: Role
}

declare module "next-auth" {
    interface Session {
        user: ExtendedUser
    }

    interface User {
        role: Role
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: Role
    }
}
