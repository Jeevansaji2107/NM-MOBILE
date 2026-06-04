import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'

interface ErrorPageProps {
  code: string
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

function ErrorPage({ code, title, description, actionLabel = 'Back to Dashboard', actionHref = '/dashboard' }: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="relative text-center max-w-md">
        <Logo size="lg" showText={false} />
        <p className="text-6xl font-bold text-primary mt-8 mb-2">{code}</p>
        <h1 className="text-2xl font-bold text-text mb-3">{title}</h1>
        <p className="text-text-secondary mb-8">{description}</p>
        <Link to={actionHref}>
          <Button><Home size={18} />{actionLabel}</Button>
        </Link>
      </div>
    </div>
  )
}

export function NotFound() {
  return <ErrorPage code="404" title="Page Not Found" description="The page you're looking for doesn't exist or has been moved." />
}

export function ServerError() {
  return <ErrorPage code="500" title="Server Error" description="Something went wrong on our end. Please try again later." actionLabel="Retry" actionHref="/dashboard" />
}

export function NetworkError() {
  return (
    <ErrorPage
      code="Offline"
      title="Network Error"
      description="Unable to connect. Check your internet connection and try again."
      actionLabel="Retry"
      actionHref="/dashboard"
    />
  )
}
