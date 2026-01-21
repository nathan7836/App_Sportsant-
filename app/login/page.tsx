"use client"

import { useActionState } from "react"
import { authenticate } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dumbbell, Loader2, ArrowRight, Sparkles } from "lucide-react"

export default function LoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(
        authenticate,
        undefined
    )

    return (
        <div
            className="relative flex items-center justify-center min-h-[100dvh] overflow-hidden"
            style={{
                padding: "1.5rem",
                paddingTop: "calc(1.5rem + env(safe-area-inset-top, 0px))",
                paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
                paddingLeft: "calc(1.5rem + env(safe-area-inset-left, 0px))",
                paddingRight: "calc(1.5rem + env(safe-area-inset-right, 0px))",
            }}
        >
            {/* Animated Background */}
            <div className="absolute inset-0 -z-10">
                {/* Base gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-background" />

                {/* Animated orbs */}
                <div
                    className="absolute top-1/4 -left-20 w-72 h-72 rounded-full blur-3xl animate-pulse"
                    style={{
                        background: 'oklch(0.55 0.2 285 / 0.15)',
                        animationDuration: '4s'
                    }}
                />
                <div
                    className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full blur-3xl animate-pulse"
                    style={{
                        background: 'oklch(0.6 0.18 320 / 0.12)',
                        animationDuration: '5s',
                        animationDelay: '1s'
                    }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl"
                    style={{
                        background: 'oklch(0.5 0.15 270 / 0.08)'
                    }}
                />

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(oklch(0.3 0.1 285) 1px, transparent 1px),
                                         linear-gradient(90deg, oklch(0.3 0.1 285) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />
            </div>

            <div className="w-full max-w-md space-y-8">
                {/* Logo and branding */}
                <div className="text-center space-y-4 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center">
                        <div className="relative group">
                            <div className="absolute -inset-2 hero-gradient rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity" />
                            <div className="relative h-16 w-16 rounded-2xl hero-gradient flex items-center justify-center shadow-xl">
                                <Dumbbell className="text-white h-8 w-8" strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            <span className="gradient-text">SportSanté</span>
                        </h1>
                        <p className="text-muted-foreground text-sm sm:text-base max-w-xs mx-auto">
                            Plateforme de gestion pour coachs sportifs professionnels
                        </p>
                    </div>
                </div>

                {/* Login Card */}
                <Card className="relative overflow-hidden border-border/50 shadow-2xl backdrop-blur-sm bg-card/80 animate-fade-in-up animate-delay-100">
                    {/* Card glow effect */}
                    <div className="absolute inset-0 hero-gradient opacity-[0.03]" />

                    <CardHeader className="relative space-y-1 pb-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <CardTitle className="text-xl font-semibold">Connexion</CardTitle>
                        </div>
                        <CardDescription className="text-sm">
                            Accédez à votre espace de gestion personnalisé
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="relative">
                        <form action={formAction} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Adresse email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="coach@sportsante.com"
                                    required
                                    autoComplete="email"
                                    className="h-12 bg-background/50 border-border/60 focus:border-primary/50 transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        Mot de passe
                                    </Label>
                                    <button
                                        type="button"
                                        className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                                    >
                                        Mot de passe oublié ?
                                    </button>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    className="h-12 bg-background/50 border-border/60 focus:border-primary/50 transition-colors"
                                />
                            </div>

                            {/* Error Message */}
                            <div aria-live="polite" aria-atomic="true" className="min-h-[24px]">
                                {errorMessage && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-scale-in">
                                        <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                                        <p className="text-sm text-destructive font-medium">{errorMessage}</p>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-semibold hero-gradient hover:opacity-90 transition-all shadow-lg hover:shadow-xl group"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Connexion en cours...
                                    </>
                                ) : (
                                    <>
                                        Se connecter
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="relative flex flex-col gap-4 pt-0">
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                        <p className="text-xs text-muted-foreground text-center">
                            Accès réservé au personnel autorisé •
                            <span className="text-primary font-medium ml-1">SportSanté © 2024</span>
                        </p>
                    </CardFooter>
                </Card>

                {/* Bottom info */}
                <div className="text-center animate-fade-in-up animate-delay-200">
                    <p className="text-xs text-muted-foreground/70">
                        En vous connectant, vous acceptez nos conditions d'utilisation
                    </p>
                </div>
            </div>
        </div>
    )
}
