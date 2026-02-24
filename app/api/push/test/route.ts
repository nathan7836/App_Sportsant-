import { auth } from '@/auth'
import { sendPushToUser } from '@/lib/push'
import { NextResponse } from 'next/server'

export async function POST() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    console.log(`[Push Test] Sending test push to user ${session.user.id}`)

    try {
        await sendPushToUser(
            session.user.id,
            'Test Push',
            'Si tu vois ceci, les push notifications fonctionnent !',
            { link: '/diag' }
        )
        return NextResponse.json({ success: true, message: 'Push sent (if tokens exist)' })
    } catch (error: any) {
        console.error('[Push Test] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
