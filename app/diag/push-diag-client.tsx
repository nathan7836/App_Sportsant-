'use client'

import { useState } from 'react'
import { Capacitor } from '@capacitor/core'

export function PushDiagClient({ userId }: { userId: string }) {
    const [logs, setLogs] = useState<string[]>([])

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} | ${msg}`])
    }

    const runDiagnostic = async () => {
        setLogs([])
        addLog('Starting push diagnostic...')
        addLog(`userId: ${userId}`)
        addLog(`Capacitor.isNativePlatform(): ${Capacitor.isNativePlatform()}`)
        addLog(`Capacitor.getPlatform(): ${Capacitor.getPlatform()}`)

        if (!Capacitor.isNativePlatform()) {
            addLog('NOT running on native platform! Push only works on iOS/Android device.')
            return
        }

        try {
            addLog('Importing @capacitor/push-notifications...')
            const { PushNotifications } = await import('@capacitor/push-notifications')
            addLog('Import OK')

            addLog('Checking permissions...')
            let permStatus = await PushNotifications.checkPermissions()
            addLog(`Permission status: ${permStatus.receive}`)

            if (permStatus.receive === 'prompt') {
                addLog('Requesting permissions...')
                permStatus = await PushNotifications.requestPermissions()
                addLog(`After request: ${permStatus.receive}`)
            }

            if (permStatus.receive !== 'granted') {
                addLog('PERMISSION DENIED - Cannot register for push')
                return
            }

            addLog('Permission granted, calling register()...')

            // Set up listener BEFORE calling register
            PushNotifications.addListener('registration', async (tokenData) => {
                addLog(`TOKEN RECEIVED: ${tokenData.value.substring(0, 40)}...`)
                addLog(`Token length: ${tokenData.value.length}`)

                addLog('Sending token to server...')
                try {
                    const response = await fetch('/api/push/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            token: tokenData.value,
                            platform: Capacitor.getPlatform(),
                        }),
                    })
                    const data = await response.json()
                    addLog(`Server response: ${response.status} ${JSON.stringify(data)}`)
                } catch (err: any) {
                    addLog(`FETCH ERROR: ${err.message}`)
                }
            })

            PushNotifications.addListener('registrationError', (error) => {
                addLog(`REGISTRATION ERROR: ${JSON.stringify(error)}`)
            })

            await PushNotifications.register()
            addLog('register() called - waiting for registration event...')

        } catch (error: any) {
            addLog(`FATAL ERROR: ${error.message}`)
            addLog(error.stack || '')
        }
    }

    const testSendPush = async () => {
        addLog('Testing push send via API...')
        try {
            const response = await fetch('/api/push/test', {
                method: 'POST',
            })
            const data = await response.json()
            addLog(`Test push response: ${response.status} ${JSON.stringify(data)}`)
        } catch (err: any) {
            addLog(`Test push error: ${err.message}`)
        }
    }

    return (
        <div>
            <h2>Client-Side Push Diagnostic</h2>
            <button
                onClick={runDiagnostic}
                style={{ padding: '10px 20px', margin: 5, background: '#007AFF', color: 'white', border: 'none', borderRadius: 8 }}
            >
                Run Push Diagnostic
            </button>
            <button
                onClick={testSendPush}
                style={{ padding: '10px 20px', margin: 5, background: '#34C759', color: 'white', border: 'none', borderRadius: 8 }}
            >
                Test Send Push to Me
            </button>
            <div style={{ marginTop: 10, background: '#111', color: '#0f0', padding: 10, borderRadius: 8, maxHeight: 400, overflow: 'auto' }}>
                {logs.length === 0 ? (
                    <p style={{ color: '#666' }}>Press "Run Push Diagnostic" to start...</p>
                ) : (
                    logs.map((log, i) => <div key={i}>{log}</div>)
                )}
            </div>
        </div>
    )
}
