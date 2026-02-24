import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    console.log('[Push API] /api/push/register called')

    const session = await auth()
    if (!session?.user?.id) {
        console.log('[Push API] No auth session, returning 401')
        return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    console.log('[Push API] Authenticated user:', session.user.id)

    const { token, platform } = await request.json()
    if (!token || !platform) {
        console.log('[Push API] Missing token or platform')
        return NextResponse.json({ error: 'Token and platform required' }, { status: 400 })
    }

    console.log(`[Push API] Registering token for user ${session.user.id}, platform: ${platform}, token: ${token.substring(0, 20)}...`)

    try {
        await prisma.deviceToken.upsert({
            where: { token },
            update: { userId: session.user.id, platform, updatedAt: new Date() },
            create: { userId: session.user.id, token, platform },
        })
        console.log('[Push API] Token registered successfully')
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Push API] DB error:', error)
        return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }
}
