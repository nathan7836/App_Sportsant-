import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, TrendingUp, Plus, ArrowUpRight, Zap, Target, Activity, Euro, Sparkles, ChevronRight } from "lucide-react"
import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getGlobalSettings } from "@/actions/settings-actions"
import { GoalDialog } from "@/components/settings/goal-dialog"
import { redirect } from "next/navigation"
import { ReminderAlerts } from "@/components/reminders/ReminderAlerts"
import { WidgetSync } from "@/components/widget-sync"

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
      include: {
        service: true,
        client: true,
        coach: {
          include: {
            coachDetails: true
          }
        }
      }
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
  let revenue = 0
  let totalCost = 0

  sessions.forEach(session => {
    revenue += session.service.price
    const durationHours = (session.service.durationMin || 60) / 60
    const hourlyRate = session.coach?.coachDetails?.hourlyRate || 0
    totalCost += durationHours * hourlyRate
  })

  const profit = revenue - totalCost
  const sessionsCount = sessions.length
  const percentage = Math.min(Math.round((revenue / monthlyGoal) * 100), 100)

  // Get greeting based on time of day
  const hour = now.getHours()
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir"

  return (
    <div className="space-y-6 md:space-y-8 pb-4">

      {/* Reminder Alerts */}
      <ReminderAlerts
        upcomingSessions={upcomingSessions}
        pendingValidationCount={pendingValidation}
        userRole={session.user?.role || 'COACH'}
      />

      <WidgetSync nextSession={upcomingSessions[0]} />

      {/* Hero Section - Premium Gradient Card */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl hero-gradient p-5 sm:p-6 md:p-8 text-white shadow-2xl animate-fade-in-up">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-48 w-48 md:h-64 md:w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-48 w-48 md:h-64 md:w-64 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 md:gap-6">
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span className="text-xs sm:text-sm font-medium text-white/80 uppercase tracking-wider">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              {greeting}, {session.user?.name?.split(' ')[0] || "Coach"}
            </h1>
            <p className="text-white/75 text-sm sm:text-base md:text-lg max-w-lg">
              Vous avez <span className="font-semibold text-white">{sessionsCount}</span> séance{sessionsCount > 1 ? 's' : ''} ce mois.
              Objectif atteint à <span className="font-semibold text-amber-300">{percentage}%</span>.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
            <Button
              className="flex-1 lg:flex-none h-11 sm:h-12 bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] touch-target"
              asChild
            >
              <Link href="/planning">
                <Zap className="mr-2 h-4 w-4 text-amber-300" />
                <span className="hidden sm:inline">Action</span> Rapide
              </Link>
            </Button>
            <Button
              className="flex-1 lg:flex-none h-11 sm:h-12 bg-white text-primary hover:bg-white/90 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] font-bold touch-target"
              asChild
            >
              <Link href="/planning">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle Séance
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid - Staggered Animation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          {
            title: "Chiffre d'Affaires",
            value: `€ ${revenue.toLocaleString()}`,
            subtitle: `${percentage}% Obj.`,
            subtitleColor: "text-emerald-500",
            icon: Euro,
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-500",
            showArrow: true
          },
          {
            title: "Bénéfices Net",
            value: `€ ${profit.toLocaleString()}`,
            subtitle: "Après salaires",
            subtitleColor: "text-muted-foreground",
            icon: TrendingUp,
            iconBg: "bg-indigo-500/10",
            iconColor: "text-indigo-500"
          },
          {
            title: "Clients Total",
            value: clientCount.toString(),
            subtitle: "Base active",
            subtitleColor: "text-muted-foreground",
            icon: Users,
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-500"
          },
          {
            title: "Séances",
            value: sessionsCount.toString(),
            subtitle: "Ce mois",
            subtitleColor: "text-muted-foreground",
            icon: CalendarDays,
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-500"
          },
          {
            title: "Reste à faire",
            value: `€ ${Math.max(0, monthlyGoal - revenue).toLocaleString()}`,
            subtitle: "Pour objectif",
            subtitleColor: "text-muted-foreground",
            icon: Activity,
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-500"
          }
        ].map((stat, index) => (
          <Card
            key={stat.title}
            className="group premium-card animate-fade-in-up"
            style={{ animationDelay: `${(index + 1) * 75}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate pr-2">
                {stat.title}
              </CardTitle>
              <div className={`p-1.5 sm:p-2 rounded-xl ${stat.iconBg} ${stat.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mono">{stat.value}</div>
              <p className={`text-[10px] sm:text-xs font-medium flex items-center mt-1 ${stat.subtitleColor}`}>
                {stat.showArrow && <ArrowUpRight className="h-3 w-3 mr-0.5" />}
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-7">

        {/* Recent Sessions Card */}
        <Card className="lg:col-span-4 premium-card animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <CalendarDays className="h-4 w-4 text-primary" />
                  </div>
                  Dernières Séances
                </CardTitle>
                <CardDescription className="mt-1">Activité récente du mois</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" asChild>
                <Link href="/planning">
                  Voir tout
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.slice(0, 5).map((s, index) => (
              <div
                key={s.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-primary/10 transition-all cursor-pointer group animate-fade-in-up"
                style={{ animationDelay: `${450 + index * 50}ms` }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm sm:text-base group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                    {s.client?.name?.substring(0, 2).toUpperCase() || "??"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors truncate">
                      {s.client?.name}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {s.service?.name}
                    </p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start mt-2 sm:mt-0 gap-2">
                  <p className="font-semibold text-sm sm:text-base mono">
                    {new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </p>
                  <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full font-medium border
                    ${s.status === 'COMPLETED' ? 'badge-success' :
                      s.status === 'CANCELLED' ? 'badge-destructive' :
                        'bg-secondary text-secondary-foreground border-secondary'}`}>
                    {s.status === 'PLANNED' ? 'Planifiée' :
                      s.status === 'COMPLETED' ? 'Terminée' :
                        s.status === 'CANCELLED' ? 'Annulée' : s.status}
                  </span>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="text-center py-8">
                <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Aucune séance ce mois-ci</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="/planning">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer une séance
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals Card */}
        <Card className="lg:col-span-3 premium-card animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <div className="p-1.5 rounded-lg bg-amber-500/10">
                    <Target className="h-4 w-4 text-amber-500" />
                  </div>
                  Objectif Mensuel
                </CardTitle>
                <CardDescription className="mt-1">Chiffre d'Affaires</CardDescription>
              </div>
              {session?.user?.role === "ADMIN" && <GoalDialog currentGoal={monthlyGoal} />}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-4 pb-6">
            {/* Progress Ring */}
            <div className="relative h-40 w-40 sm:h-48 sm:w-48 flex items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  className="text-muted/50"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                />
                {/* Progress circle */}
                <circle
                  className="text-primary transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={263.89}
                  strokeDashoffset={263.89 - (percentage / 100) * 263.89}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                  style={{
                    filter: 'drop-shadow(0 0 6px oklch(0.55 0.25 285 / 0.4))'
                  }}
                />
              </svg>

              <div className="text-center z-10">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold gradient-text tracking-tighter mono">
                  {percentage}%
                </span>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">
                  Atteint
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full mt-6">
              <div className="text-center p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/50">
                <p className="text-muted-foreground text-[10px] sm:text-xs uppercase font-bold tracking-wider mb-1">
                  Réalisé
                </p>
                <p className="text-lg sm:text-xl font-bold text-foreground mono">
                  € {revenue.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/50">
                <p className="text-muted-foreground text-[10px] sm:text-xs uppercase font-bold tracking-wider mb-1">
                  Objectif
                </p>
                <p className="text-lg sm:text-xl font-bold text-muted-foreground mono">
                  € {monthlyGoal.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full mt-4">
              <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full hero-gradient transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
