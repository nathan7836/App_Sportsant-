
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { User, LogOut, Moon, Sun, Monitor, Bell } from "lucide-react"

export default async function SettingsPage() {
    const session = await auth()
    if (!session) redirect("/login")
    const user = session.user

    return (
        <div className="space-y-6 container max-w-4xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
                <p className="text-muted-foreground">Gérez votre profil et les préférences de l'application.</p>
            </div>

            <Separator />

            <div className="grid gap-6">
                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            <CardTitle>Profil Utilisateur</CardTitle>
                        </div>
                        <CardDescription>Vos informations personnelles visibles dans l'application.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom complet</Label>
                                <Input id="name" defaultValue={user?.name || ""} disabled className="bg-muted/50" />
                                <p className="text-[0.8rem] text-muted-foreground">Contactez un administrateur pour changer votre nom.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" defaultValue={user?.email || ""} disabled className="bg-muted/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Rôle</Label>
                                <Input id="role" defaultValue={user?.role || "UTILISATEUR"} disabled className="bg-muted/50" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance - Mock functionality for now */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Monitor className="h-5 w-5 text-primary" />
                            <CardTitle>Apparence</CardTitle>
                        </div>
                        <CardDescription>Personnalisez l'interface de l'application.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-full bg-background border">
                                    <Sun className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-medium">Thème Clair</p>
                                    <p className="text-sm text-muted-foreground">Apparence par défaut.</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" disabled>Actif</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-full bg-background border">
                                    <Moon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-medium">Thème Sombre</p>
                                    <p className="text-sm text-muted-foreground">Bientôt disponible.</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" disabled>Bientôt</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* App Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Information Application</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm flex justify-between py-2 border-b border-border/50">
                            <span className="text-muted-foreground">Version</span>
                            <span className="font-medium">v1.2.0-beta</span>
                        </div>
                        <div className="text-sm flex justify-between py-2">
                            <span className="text-muted-foreground">Environnement</span>
                            <span className="font-medium">Production (SQLite)</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end pt-6">
                <Button variant="destructive" asChild>
                    <a href="/api/auth/signout">
                        <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                    </a>
                </Button>
            </div>
        </div>
    )
}
