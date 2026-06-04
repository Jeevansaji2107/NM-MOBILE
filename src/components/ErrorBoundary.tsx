import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info.componentStack)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <Logo size="lg" showText={false} />
            <div className="mt-8 mb-4 flex justify-center">
              <div className="p-4 rounded-full bg-red-500/10 border border-red-500/30">
                <AlertTriangle size={32} className="text-red-400" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-text mb-2">Something went wrong</h1>
            <p className="text-sm text-text-secondary mb-6">
              An unexpected error occurred. You can try again or return to the dashboard.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-xs text-red-400/80 bg-red-500/5 border border-red-500/20 rounded-lg p-3 mb-6 overflow-x-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleRetry}>
                <RefreshCw size={18} />
                Try again
              </Button>
              <Link to="/dashboard">
                <Button variant="secondary">
                  <Home size={18} />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
