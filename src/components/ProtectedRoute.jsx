import { LoaderCircle } from 'lucide-react'
import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { getStoredLightBackgroundColor } from '../utils/lightBackground'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const isDarkMode = window.localStorage.getItem('proman-theme') === 'dark'

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center dark:bg-slate-950"
        style={
          isDarkMode ? undefined : { backgroundColor: getStoredLightBackgroundColor() }
        }
      >
        <LoaderCircle className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-300" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
