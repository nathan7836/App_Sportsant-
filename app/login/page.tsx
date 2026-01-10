
"use client"

import { useActionState } from "react"
import { authenticate } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dumbbell } from "lucide-react"

export default function LoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(
        authenticate,
        undefined
    )

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20">
            <Card className="w-full max-w-sm shadow-xl">
                <CardHeader className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                            <Dumbbell className="text-primary-foreground h-7 w-7" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">SportSanté</CardTitle>
                    <CardDescription>
                        Connectez-vous à votre espace coach
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" name="email" placeholder="admin@sportsante.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input id="password" type="password" name="password" required />
                        </div>
                        <div aria-live="polite" aria-atomic="true">
                            {errorMessage && (
                                <p className="text-sm text-destructive font-medium">{errorMessage}</p>
                            )}
                        </div>
                        <Button className="w-full" aria-disabled={isPending}>
                            {isPending ? "Connexion..." : "Se connecter"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-xs text-muted-foreground text-center">
                        Accès réservé au personnel autorisé.
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
