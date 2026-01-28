'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Bell,
    BellRing,
    Check,
    CheckCheck,
    X,
    Calendar,
    CalendarX,
    CalendarCheck,
    ExternalLink
} from "lucide-react"
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/actions/session-request-actions"
import Link from "next/link"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    link?: string | null
    read: boolean
    createdAt: Date | string
}

interface NotificationBellProps {
    notifications: Notification[]
    unreadCount: number
}

export function NotificationBell({ notifications, unreadCount }: NotificationBellProps) {
    const [open, setOpen] = useState(false)
    const [localNotifications, setLocalNotifications] = useState(notifications)
    const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount)

    useEffect(() => {
        setLocalNotifications(notifications)
        setLocalUnreadCount(unreadCount)
    }, [notifications, unreadCount])

    const handleMarkAsRead = async (id: string) => {
        await markNotificationAsRead(id)
        setLocalNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
        setLocalUnreadCount(prev => Math.max(0, prev - 1))
    }

    const handleMarkAllAsRead = async () => {
        await markAllNotificationsAsRead()
        setLocalNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        )
        setLocalUnreadCount(0)
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'REQUEST_NEW':
                return <Calendar className="h-5 w-5 text-blue-500" />
            case 'REQUEST_APPROVED':
                return <CalendarCheck className="h-5 w-5 text-emerald-500" />
            case 'REQUEST_REJECTED':
                return <CalendarX className="h-5 w-5 text-rose-500" />
            default:
                return <Bell className="h-5 w-5 text-muted-foreground" />
        }
    }

    const formatTimeAgo = (date: Date | string) => {
        const now = new Date()
        const diff = now.getTime() - new Date(date).getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return "À l'instant"
        if (minutes < 60) return `Il y a ${minutes}min`
        if (hours < 24) return `Il y a ${hours}h`
        if (days < 7) return `Il y a ${days}j`
        return new Date(date).toLocaleDateString('fr-FR')
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    {localUnreadCount > 0 ? (
                        <BellRing className="h-5 w-5 animate-pulse" />
                    ) : (
                        <Bell className="h-5 w-5" />
                    )}
                    {localUnreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs"
                        >
                            {localUnreadCount > 9 ? '9+' : localUnreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    {localUnreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs gap-1"
                            onClick={handleMarkAllAsRead}
                        >
                            <CheckCheck className="h-4 w-4" />
                            Tout marquer lu
                        </Button>
                    )}
                </div>

                <ScrollArea className="max-h-[400px]">
                    {localNotifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Aucune notification</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {localNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-primary/5' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="shrink-0 mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 shrink-0"
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </span>
                                                {notification.link && (
                                                    <Link
                                                        href={notification.link}
                                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                                        onClick={() => setOpen(false)}
                                                    >
                                                        Voir <ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
