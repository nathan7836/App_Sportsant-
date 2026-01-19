import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileFab } from "@/components/mobile-fab"
import { AndroidNotificationManager } from "@/components/android/notification-manager"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SportSanté - Gestion",
  description: "Application de gestion de coaching sportif",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // REQUIRED for safe-area-inset to work on iOS
}

export const dynamic = 'force-dynamic';


import { auth } from "@/auth"
import { getMyNotifications, getUnreadNotificationsCount } from "@/actions/session-request-actions"
import { NotificationBell } from "@/components/notifications/NotificationBell"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session
  let userRole
  let notifications: any[] = []
  let unreadCount = 0
  try {
    session = await auth()
    userRole = session?.user?.role
    if (session?.user) {
      notifications = await getMyNotifications()
      unreadCount = await getUnreadNotificationsCount()
    }
  } catch (e) {
    console.error("Auth failed during build:", e)
  }

  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <AppSidebar userRole={userRole} />
          {session?.user?.id && <AndroidNotificationManager userId={session.user.id} />}
          <MobileFab />
          <main className="flex-1 flex flex-col min-h-[100dvh] bg-background">
            <header
              className="flex shrink-0 items-center gap-2 border-b px-4 justify-between bg-card/80 backdrop-blur-md sticky top-0 z-40 transition-all duration-300"
              style={{
                paddingTop: "calc(0.875rem + env(safe-area-inset-top, 0px))",
                paddingBottom: "0.875rem",
                paddingLeft: "calc(1rem + env(safe-area-inset-left, 0px))",
                paddingRight: "calc(1rem + env(safe-area-inset-right, 0px))",
              }}
            >
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 hidden md:flex" />
                <div className="h-4 w-[1px] bg-border mx-2 hidden md:block" />
                <span className="font-semibold text-sm">Tableau de Bord</span>
              </div>
              <div className="flex items-center gap-2">
                {session?.user && (
                  <NotificationBell notifications={notifications} unreadCount={unreadCount} />
                )}
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {session?.user?.name?.substring(0, 1).toUpperCase() || "U"}
                </div>
              </div>
            </header>
            <div
              className="flex-1 overflow-y-auto overscroll-contain space-y-6"
              style={{
                padding: "1rem",
                paddingBottom: "calc(6rem + env(safe-area-inset-bottom, 0px))",
                paddingLeft: "calc(1rem + env(safe-area-inset-left, 0px))",
                paddingRight: "calc(1rem + env(safe-area-inset-right, 0px))",
              }}
            >
              {children}
            </div>
          </main>
          <Toaster position="top-center" toastOptions={{ className: "!mb-0" }} />
        </SidebarProvider>
      </body>
    </html>
  );
}
