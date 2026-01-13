"use client"

import { useActionState } from "react"
import { createUser } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

const initialState = {
    message: "",
    success: false
}

export function CreateUserForm() {
    const [state, formAction, isPending] = useActionState(createUser, initialState)

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Jean Dupont"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jean@sportsante.com"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select name="role" defaultValue="COACH">
                    <SelectTrigger className="text-base md:text-sm">
                        <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="COACH">Coach</SelectItem>
                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {state?.message && (
                <Alert variant={state.success ? "default" : "destructive"} className={state.success ? "bg-emerald-50 text-emerald-800 border-emerald-200" : ""}>
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Création..." : "Créer l'utilisateur"}
            </Button>
        </form>
    )
}