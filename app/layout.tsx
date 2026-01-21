import type { Metadata } from "next";
import { Sora, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { AndroidNotificationManager } from "@/components/android/notification-manager"
import { Toaster } from "@/components/ui/sonner"

// Sora - Geometric, modern, energetic for headings
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Plus Jakarta Sans - Clean, professional, highly readable for body
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// JetBrains Mono - Technical, precise for code/numbers
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

  const isAuthenticated = !!session?.user

  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {isAuthenticated ? (
          // Layout authentifié avec sidebar et header
          <SidebarProvider>
            <AppSidebar userRole={userRole} />
            {session?.user?.id && <AndroidNotificationManager userId={session.user.id} />}
            <main className="flex-1 flex flex-col min-h-[100dvh] bg-background">
              {/* Header - Glassmorphism effect */}
              <header
                className="flex shrink-0 items-center gap-3 border-b border-border/40 justify-between glass sticky top-0 z-40 transition-all duration-300"
                style={{
                  paddingTop: "calc(0.75rem + env(safe-area-inset-top, 0px))",
                  paddingBottom: "0.75rem",
                  paddingLeft: "calc(1rem + env(safe-area-inset-left, 0px))",
                  paddingRight: "calc(1rem + env(safe-area-inset-right, 0px))",
                }}
              >
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="-ml-1 hidden md:flex touch-target" />
                  <div className="h-5 w-px bg-border/60 hidden md:block" />
                  {/* Logo/Brand for mobile */}
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl hero-gradient flex items-center justify-center shadow-sm md:hidden">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <span className="font-semibold text-sm md:text-base tracking-tight">
                      <span className="hidden sm:inline">SportSanté</span>
                      <span className="sm:hidden gradient-text font-bold">SportSanté</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <NotificationBell notifications={notifications} unreadCount={unreadCount} />
                  {/* User Avatar with gradient border */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 hero-gradient rounded-full opacity-70 group-hover:opacity-100 transition-opacity blur-sm" />
                    <div className="relative h-9 w-9 rounded-full bg-card flex items-center justify-center text-sm font-bold text-primary border-2 border-background">
                      {session?.user?.name?.substring(0, 1).toUpperCase() || "U"}
                    </div>
                  </div>
                </div>
              </header>

              {/* Main Content Area */}
              <div
                className="flex-1 overflow-y-auto overscroll-contain"
                style={{
                  padding: "1rem",
                  paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))",
                  paddingLeft: "calc(1rem + env(safe-area-inset-left, 0px))",
                  paddingRight: "calc(1rem + env(safe-area-inset-right, 0px))",
                }}
              >
                {children}
              </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav userRole={userRole} />

            <Toaster position="top-center" toastOptions={{ className: "!mb-0" }} />
          </SidebarProvider>
        ) : (
          // Layout non authentifié (page de login) - sans sidebar ni header
          <>
            {children}
            <Toaster position="top-center" toastOptions={{ className: "!mb-0" }} />
          </>
        )}
      </body>
    </html>
  );
}
