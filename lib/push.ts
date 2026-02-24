import admin from 'firebase-admin'
import { prisma } from '@/lib/prisma'
import * as http2 from 'http2'
import * as crypto from 'crypto'

// ============================================================
// Firebase (Android)
// ============================================================
function getFirebaseApp(): admin.app.App | null {
    if (admin.apps.length > 0) {
        return admin.apps[0]!
    }

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    if (!serviceAccountJson) {
        return null
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountJson)
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        })
    } catch (e) {
        console.error('[Push] Failed to initialize Firebase Admin:', e)
        return null
    }
}

// ============================================================
// APNs (iOS) - Direct HTTP/2 with JWT
// ============================================================
const APNS_KEY_ID = process.env.APNS_KEY_ID || 'H4USRJXU66'
const APNS_TEAM_ID = process.env.APNS_TEAM_ID || '2W444UUXJN'
const APNS_BUNDLE_ID = 'com.sportsante.app'
const APNS_HOST = process.env.APNS_PRODUCTION === 'true'
    ? 'api.push.apple.com'
    : 'api.sandbox.push.apple.com'

let apnsJwt: { token: string; issuedAt: number } | null = null

function getApnsKey(): string | null {
    const raw = process.env.APNS_KEY || null
    if (!raw) return null
    return raw.replace(/\\n/g, '\n')
}

function getApnsJwt(): string | null {
    const key = getApnsKey()
    if (!key) return null

    const now = Math.floor(Date.now() / 1000)

    // Reuse JWT for up to 50 min (Apple allows 1 hour)
    if (apnsJwt && (now - apnsJwt.issuedAt) < 3000) {
        return apnsJwt.token
    }

    try {
        const header = Buffer.from(JSON.stringify({
            alg: 'ES256',
            kid: APNS_KEY_ID,
        })).toString('base64url')

        const payload = Buffer.from(JSON.stringify({
            iss: APNS_TEAM_ID,
            iat: now,
        })).toString('base64url')

        const sign = crypto.createSign('SHA256')
        sign.update(`${header}.${payload}`)
        const signature = sign.sign(key, 'base64url')

        const jwt = `${header}.${payload}.${signature}`
        apnsJwt = { token: jwt, issuedAt: now }
        return jwt
    } catch (e) {
        console.error('[Push] Failed to create APNs JWT:', e)
        return null
    }
}

function sendApns(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, string>
): Promise<boolean> {
    return new Promise((resolve) => {
        const jwt = getApnsJwt()
        if (!jwt) {
            console.error('[Push] APNs key not configured')
            resolve(false)
            return
        }

        const client = http2.connect(`https://${APNS_HOST}`)

        client.on('error', (err) => {
            console.error('[Push] APNs connection error:', err)
            resolve(false)
        })

        const payload = JSON.stringify({
            aps: {
                alert: { title, body },
                sound: 'default',
                badge: 1,
            },
            ...(data || {}),
        })

        const headers = {
            ':method': 'POST',
            ':path': `/3/device/${deviceToken}`,
            'authorization': `bearer ${jwt}`,
            'apns-topic': APNS_BUNDLE_ID,
            'apns-push-type': 'alert',
            'apns-priority': '10',
            'content-type': 'application/json',
        }

        const req = client.request(headers)

        let responseData = ''
        req.on('response', (headers) => {
            const status = headers[':status']
            if (status === 200) {
                resolve(true)
            } else {
                req.on('data', (chunk) => { responseData += chunk })
                req.on('end', () => {
                    console.error(`[Push] APNs error (${status}):`, responseData)
                    resolve(status === 410 ? false : true) // 410 = token expired
                })
            }
        })

        req.on('error', (err) => {
            console.error('[Push] APNs request error:', err)
            resolve(false)
        })

        req.end(payload)

        // Close connection after response
        req.on('close', () => {
            client.close()
        })
    })
}

// ============================================================
// Unified send function
// ============================================================
export async function sendPushToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>
): Promise<void> {
    console.log(`[Push] sendPushToUser called for user ${userId}, title: "${title}"`)

    const deviceTokens = await prisma.deviceToken.findMany({
        where: { userId },
    })

    console.log(`[Push] Found ${deviceTokens.length} device tokens for user ${userId}`)
    if (deviceTokens.length === 0) return

    const tokensToDelete: string[] = []

    for (const dt of deviceTokens) {
        if (dt.platform === 'ios') {
            // iOS: send via APNs directly
            const success = await sendApns(dt.token, title, body, data)
            if (!success) {
                tokensToDelete.push(dt.id)
            }
        } else {
            // Android: send via FCM
            const app = getFirebaseApp()
            if (!app) continue

            try {
                const messaging = admin.messaging(app)
                await messaging.send({
                    token: dt.token,
                    notification: { title, body },
                    data: data ?? {},
                    android: {
                        priority: 'high' as const,
                        notification: {
                            sound: 'default',
                            channelId: 'default',
                        },
                    },
                })
            } catch (error: any) {
                const code = error?.code || error?.errorInfo?.code || ''
                if (
                    code === 'messaging/registration-token-not-registered' ||
                    code === 'messaging/invalid-registration-token'
                ) {
                    tokensToDelete.push(dt.id)
                } else {
                    console.error(`[Push] Failed to send to token ${dt.id}:`, error)
                }
            }
        }
    }

    if (tokensToDelete.length > 0) {
        await prisma.deviceToken.deleteMany({
            where: { id: { in: tokensToDelete } },
        })
    }
}
