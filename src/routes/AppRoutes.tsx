import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { PageSkeleton } from '@/components/ui/Skeleton'

const Analytics = lazy(() => import('@/pages/Analytics'))
const Categories = lazy(() => import('@/pages/Categories'))
const Coupons = lazy(() => import('@/pages/Coupons'))
const Customers = lazy(() => import('@/pages/Customers'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Devices = lazy(() => import('@/pages/Devices'))
const Login = lazy(() => import('@/pages/Login'))
const Orders = lazy(() => import('@/pages/Orders'))
const Products = lazy(() => import('@/pages/Products'))
const Settings = lazy(() => import('@/pages/Settings'))
const Staff = lazy(() => import('@/pages/Staff'))
const NotFound = lazy(() =>
  import('@/pages/errors/ErrorPages').then((m) => ({ default: m.NotFound })),
)
const ServerError = lazy(() =>
  import('@/pages/errors/ErrorPages').then((m) => ({ default: m.ServerError })),
)
const NetworkError = lazy(() =>
  import('@/pages/errors/ErrorPages').then((m) => ({ default: m.NetworkError })),
)

function PageLoader() {
  return (
    <div className="p-6">
      <PageSkeleton />
    </div>
  )
}

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LazyPage>
            <Login />
          </LazyPage>
        }
      />
      <Route path="/500" element={<LazyPage><ServerError /></LazyPage>} />
      <Route path="/network-error" element={<LazyPage><NetworkError /></LazyPage>} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<LazyPage><Dashboard /></LazyPage>} />
          <Route path="/products" element={<LazyPage><Products /></LazyPage>} />
          <Route path="/categories" element={<LazyPage><Categories /></LazyPage>} />
          <Route path="/devices" element={<LazyPage><Devices /></LazyPage>} />
          <Route path="/orders" element={<LazyPage><Orders /></LazyPage>} />
          <Route path="/customers" element={<LazyPage><Customers /></LazyPage>} />
          <Route path="/coupons" element={<LazyPage><Coupons /></LazyPage>} />
          <Route path="/staff" element={<LazyPage><Staff /></LazyPage>} />
          <Route path="/analytics" element={<LazyPage><Analytics /></LazyPage>} />
          <Route path="/settings" element={<LazyPage><Settings /></LazyPage>} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<LazyPage><NotFound /></LazyPage>} />
    </Routes>
  )
}
