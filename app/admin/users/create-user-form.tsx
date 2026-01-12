"use client"

import { useActionState } from "react"
import { createUser } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
                    className="text-[16px]" // Empêche le zoom sur iPhone
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
                    className="text-[16px]" // Empêche le zoom sur iPhone
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
                    className="text-[16px]" // Empêche le zoom sur iPhone
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select name="role" defaultValue="COACH">
                    <SelectTrigger className="text-[16px]">
                        <SelectValue placeholder="Selectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="COACH" className="text-[16px]">Coach</SelectItem>
                        <SelectItem value="ADMIN" className="text-[16px]">Administrateur</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {state?.message && (
                <Alert variant={state.success ? "default" : "destructive"} className={state.success ? "bg-emerald-50 text-emerald-800 border-emerald-200" : ""}>
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Création..." : "Créer l'utilisateur"}
            </Button>
        </form>
    )
}