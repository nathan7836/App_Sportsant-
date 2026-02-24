import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { token } = await request.json()
    if (!token) {
        return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    await prisma.deviceToken.deleteMany({
        where: { token, userId: session.user.id },
    })

    return NextResponse.json({ success: true })
}
