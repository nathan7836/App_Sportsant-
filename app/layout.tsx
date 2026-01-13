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
  userScalable: false, // Often good for native-like apps
}

export const dynamic = 'force-dynamic';


import { auth } from "@/auth"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let session
  let userRole
  try {
    session = await auth()
    userRole = session?.user?.role
  } catch {
    // Auth can fail during build time, ignore
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
          <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-10 transition-all duration-300">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 hidden md:flex" />
                <div className="h-4 w-[1px] bg-border mx-2 hidden md:block" />
                <span className="font-semibold text-sm">Tableau de Bord</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Placeholder for Profile/Notifs */}
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">A</div>
              </div>
            </header>
            <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 space-y-6">
              {children}
            </div>
          </main>
          <Toaster />
        </SidebarProvider>
      </body>
    </html>
  );
}
