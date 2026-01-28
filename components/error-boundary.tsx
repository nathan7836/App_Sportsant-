'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, WifiOff, Home } from "lucide-react"
import Link from "next/link"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  isOffline: boolean
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, isOffline: false }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Vérifier si c'est une erreur réseau
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.setState({ isOffline: true })
    }
  }

  componentDidMount() {
    // Écouter les changements de statut réseau
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    }
  }

  handleOnline = () => {
    if (this.state.isOffline) {
      this.setState({ isOffline: false })
      // Tenter de récupérer automatiquement
      this.handleRetry()
    }
  }

  handleOffline = () => {
    this.setState({ isOffline: true })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                {this.state.isOffline ? (
                  <WifiOff className="h-8 w-8 text-destructive" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                )}
              </div>
              <CardTitle className="text-xl">
                {this.state.isOffline ? "Vous êtes hors ligne" : "Une erreur s'est produite"}
              </CardTitle>
              <CardDescription>
                {this.state.isOffline
                  ? "Vérifiez votre connexion internet et réessayez."
                  : "Nous avons rencontré un problème inattendu."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Réessayer
              </Button>
              <Button
                asChild
                className="w-full"
                variant="outline"
              >
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </Link>
              </Button>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-muted rounded-lg text-xs">
                  <summary className="cursor-pointer text-muted-foreground">
                    Détails de l'erreur (dev)
                  </summary>
                  <pre className="mt-2 overflow-auto whitespace-pre-wrap text-destructive">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Composant fonctionnel wrapper pour faciliter l'utilisation
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
