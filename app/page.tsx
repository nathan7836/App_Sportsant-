import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, TrendingUp, Plus, ArrowUpRight, Zap, Target, Activity, Euro } from "lucide-react"
import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getGlobalSettings } from "@/actions/settings-actions"
import { GoalDialog } from "@/components/settings/goal-dialog"
import { redirect } from "next/navigation"
import { ReminderAlerts } from "@/components/reminders/ReminderAlerts"

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth()
  if (!session) {
    redirect("/login")
  }

  // Fetch Settings (Goal)
  const settings = await getGlobalSettings()
  const monthlyGoal = settings.monthlyGoal

  // Calculate Date Range (Current Month)
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  endOfMonth.setHours(23, 59, 59, 999)

  // Get upcoming sessions for next 7 days
  const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  // Fetch Data
  const [sessions, clientCount, upcomingSessions, pendingValidation] = await Promise.all([
    prisma.session.findMany({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      include: { service: true, client: true }
    }),
    prisma.client.count(),
    prisma.session.findMany({
      where: {
        date: { gte: now, lte: next7Days },
        coachId: session.user?.role === 'COACH' ? session.user.id : undefined
      },
      include: { service: true, client: true },
      orderBy: { date: 'asc' }
    }),
    prisma.session.count({
      where: {
        date: { lte: now },
        status: 'PLANNED',
        coachId: session.user?.role === 'COACH' ? session.user.id : undefined
      }
    })
  ])

  // Calculate KPI
  const revenue = sessions.reduce((acc, s) => acc + s.service.price, 0)
  const sessionsCount = sessions.length

  // Progress
  const percentage = Math.min(Math.round((revenue / monthlyGoal) * 100), 100)

  // Determine Trend (Mock logic for trend since we don't fetch last month yet, keep simple)
  // Or just remove specific trend stats for now or say "vs Obj."

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 md:pb-0">

      {/* Reminder Alerts */}
      <ReminderAlerts
        upcomingSessions={upcomingSessions}
        pendingValidationCount={pendingValidation}
        userRole={session.user?.role || 'COACH'}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-purple-600 to-indigo-600 p-6 sm:p-8 text-primary-foreground shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Bonjour, {session.user?.name || "Coach"} 👋</h2>
            <p className="text-primary-foreground/80 text-base sm:text-lg max-w-md">
              Vous avez {sessionsCount} séance(s) ce mois-ci. Objectif à {percentage}%.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Button className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md shadow-lg transition-transform hover:scale-105" asChild>
              <Link href="/planning">
                <Zap className="mr-2 h-4 w-4 text-amber-400 fill-amber-400" /> Action Rapide
              </Link>
            </Button>
            <Button className="flex-1 md:flex-none bg-white text-primary hover:bg-white/90 shadow-xl transition-transform hover:scale-105 font-bold" asChild>
              <Link href="/planning">
                <Plus className="mr-2 h-4 w-4" /> Nouvelle Séance
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid - 2 cols on mobile for compactness */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Chiffre d'Affaires</CardTitle>
            <div className="p-1.5 sm:p-2 rounded-full bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <Euro className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">€ {revenue.toLocaleString()}</div>
            <p className="text-[10px] sm:text-xs font-medium flex items-center mt-1 text-emerald-500">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              {percentage}%
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Clients Total</CardTitle>
            <div className="p-1.5 sm:p-2 rounded-full bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{clientCount}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Base active</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Séances (Mois)</CardTitle>
            <div className="p-1.5 sm:p-2 rounded-full bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
              <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{sessionsCount}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Ce mois-ci</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Reste à faire</CardTitle>
            <div className="p-1.5 sm:p-2 rounded-full bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
              <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">€ {(Math.max(0, monthlyGoal - revenue)).toLocaleString()}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Pour obj.</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-7">

        <Card className="col-span-full lg:col-span-4 shadow-lg border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><CalendarDays className="h-5 w-5 text-primary" /> Dernières Séances</CardTitle>
            <CardDescription>Aperçu de l'activité récente.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.slice(0, 5).map((s) => (
                <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-2xl bg-muted/30 hover:bg-muted/60 border border-transparent hover:border-primary/10 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg sm:text-xl group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                      {s.client?.name?.substring(0, 2).toUpperCase() || "??"}
                    </div>
                    <div>
                      <p className="font-bold text-base sm:text-lg group-hover:text-primary transition-colors">{s.client?.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{s.service?.name}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right mt-2 sm:mt-0 flex flex-row sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto">
                    <p className="font-bold text-base sm:text-xl">{new Date(s.date).toLocaleDateString()}</p>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-secondary text-secondary-foreground">{s.status}</span>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && <p className="text-center text-muted-foreground py-4">Aucune séance ce mois-ci.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Goals Card */}
        <Card className="col-span-full lg:col-span-3 shadow-lg border-border/50 bg-gradient-to-br from-card to-muted/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg"><Target className="h-5 w-5 text-primary" /> Objectif Mensuel</CardTitle>
                <CardDescription>Chiffre d'Affaires</CardDescription>
              </div>
              {/* Edit Button */}
              {session?.user?.role === "ADMIN" && <GoalDialog currentGoal={monthlyGoal} />}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-8">
            <div className="relative h-48 w-48 flex items-center justify-center">
              {/* Background Circle */}
              <div className="absolute inset-0 rounded-full border-[12px] border-muted"></div>
              {/* Progress Circle (Simplified CSS rotation for MVP) */}
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-muted"
                  strokeWidth="12"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-primary transition-all duration-1000 ease-out"
                  strokeWidth="12"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (percentage / 100) * 251.2}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>

              <div className="text-center z-10">
                <span className="text-5xl font-extrabold text-primary tracking-tighter">{percentage}%</span>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">Atteint</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-8 w-full mt-10">
              <div className="text-center p-3 sm:p-4 rounded-2xl bg-background shadow-sm">
                <p className="text-muted-foreground text-[10px] sm:text-xs uppercase font-bold tracking-wider">Réalisé</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">€ {revenue.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-2xl bg-background shadow-sm">
                <p className="text-muted-foreground text-[10px] sm:text-xs uppercase font-bold tracking-wider">Objectif</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xl sm:text-2xl font-bold text-muted-foreground">€ {monthlyGoal.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
