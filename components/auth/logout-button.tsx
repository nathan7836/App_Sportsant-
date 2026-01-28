'use client'

import { useState } from 'react'
import { logout } from '@/actions/auth-actions'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface LogoutButtonProps {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    className?: string
    showIcon?: boolean
    showText?: boolean
    confirmDialog?: boolean
}

export function LogoutButton({
    variant = 'destructive',
    size = 'default',
    className,
    showIcon = true,
    showText = true,
    confirmDialog = true,
}: LogoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleLogout = async () => {
        setIsLoading(true)
        try {
            await logout()
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error)
            setIsLoading(false)
        }
    }

    const buttonContent = (
        <>
            {isLoading ? (
                <Loader2 className={cn("h-4 w-4 animate-spin", showText && "mr-2")} />
            ) : showIcon ? (
                <LogOut className={cn("h-4 w-4", showText && "mr-2")} />
            ) : null}
            {showText && (isLoading ? 'Déconnexion...' : 'Se déconnecter')}
        </>
    )

    if (confirmDialog) {
        return (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                        variant={variant}
                        size={size}
                        className={cn("touch-target", className)}
                        disabled={isLoading}
                    >
                        {buttonContent}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="mx-4 rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Se déconnecter ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir vous déconnecter de votre compte ?
                            Vous devrez vous reconnecter pour accéder à l'application.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="mt-0">Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogout}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Déconnexion...
                                </>
                            ) : (
                                <>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Se déconnecter
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )
    }

    return (
        <Button
            variant={variant}
            size={size}
            className={cn("touch-target", className)}
            onClick={handleLogout}
            disabled={isLoading}
        >
            {buttonContent}
        </Button>
    )
}
