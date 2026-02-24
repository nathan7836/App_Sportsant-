
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { PushDiagClient } from './push-diag-client'

export default async function DiagPage() {
    let session = null
    let tokenCount = 0
    let tokens: any[] = []

    try {
        session = await auth()
        if (session?.user?.id) {
            tokens = await prisma.deviceToken.findMany({
                where: { userId: session.user.id },
            })
            tokenCount = await prisma.deviceToken.count()
        }
    } catch (e) {
        // ignore
    }

    return (
        <div style={{ padding: 20, fontFamily: 'monospace', fontSize: 12 }}>
            <h1>Push Diagnostics</h1>
            <p>Time: {new Date().toISOString()}</p>
            <p>Auth: {session?.user?.id ? `OK (${session.user.id})` : 'NOT AUTHENTICATED'}</p>
            <p>User: {session?.user?.name || session?.user?.email || 'N/A'}</p>
            <p>Role: {session?.user?.role || 'N/A'}</p>
            <h2>Device Tokens (total: {tokenCount})</h2>
            {tokens.length === 0 ? (
                <p style={{ color: 'red' }}>No tokens registered for this user!</p>
            ) : (
                <ul>
                    {tokens.map((t: any) => (
                        <li key={t.id}>
                            {t.platform} | {t.token.substring(0, 30)}... | {t.createdAt?.toString()}
                        </li>
                    ))}
                </ul>
            )}
            <hr />
            <PushDiagClient userId={session?.user?.id || ''} />
        </div>
    )
}
