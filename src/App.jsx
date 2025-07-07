import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import Posts from './pages/dashboard/Posts'
import CreatePost from './pages/dashboard/CreatePost'
import EditPost from './pages/dashboard/EditPost'
import Pages from './pages/dashboard/Pages'
import CreatePage from './pages/dashboard/CreatePage'
import EditPage from './pages/dashboard/EditPage'
import Settings from './pages/dashboard/Settings'
import Media from './pages/dashboard/Media'
import Themes from './pages/dashboard/Themes'
import Plugins from './pages/dashboard/Plugins'
import NotFound from './pages/NotFound'
import DashboardLayout from './components/layouts/DashboardLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicPage from './pages/public/PublicPage'
import PublicPost from './pages/public/PublicPost'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="posts" element={<Posts />} />
        <Route path="posts/new" element={<CreatePost />} />
        <Route path="posts/:id" element={<EditPost />} />
        <Route path="pages" element={<Pages />} />
        <Route path="pages/new" element={<CreatePage />} />
        <Route path="pages/:id" element={<EditPage />} />
        <Route path="media" element={<Media />} />
        <Route path="plugins" element={<Plugins />} />
        <Route path="themes" element={<Themes />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Public Content Routes */}
      <Route path="/:slug" element={<PublicPage />} />
      <Route path="/post/:slug" element={<PublicPost />} />
      
      {/* Redirect root to dashboard if logged in, otherwise to login */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
