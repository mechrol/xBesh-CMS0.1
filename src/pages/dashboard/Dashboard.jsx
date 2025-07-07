import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { usePlugins } from '../../contexts/PluginContext'
import { 
  DocumentTextIcon, 
  NewspaperIcon, 
  PhotoIcon, 
  PencilSquareIcon,
  EyeIcon,
  ClockIcon,
  PaintBrushIcon,
  Cog6ToothIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const [stats, setStats] = useState({
    posts: 0,
    pages: 0,
    media: 0,
    plugins: 0,
    recentPosts: [],
    recentPages: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activityFeed, setActivityFeed] = useState([])
  const { plugins, runAction } = usePlugins()

  useEffect(() => {
    fetchDashboardData()
    
    // Run dashboard init action for plugins
    runAction('dashboard_init')
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch post count
      const { count: postsCount, error: postsError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
      
      if (postsError) throw postsError
      
      // Fetch page count
      const { count: pagesCount, error: pagesError } = await supabase
        .from('pages')
        .select('*', { count: 'exact', head: true })
      
      if (pagesError) throw pagesError
      
      // Fetch media count
      const { count: mediaCount, error: mediaError } = await supabase
        .from('media')
        .select('*', { count: 'exact', head: true })
      
      if (mediaError && mediaError.code !== 'PGRST116') {
        console.error('Media table might not exist:', mediaError)
      }
      
      // Fetch plugin count
      const { count: pluginsCount, error: pluginsError } = await supabase
        .from('plugins')
        .select('*', { count: 'exact', head: true })
      
      if (pluginsError && pluginsError.code !== 'PGRST116') {
        console.error('Plugins table might not exist:', pluginsError)
      }
      
      // Fetch recent posts
      const { data: recentPosts, error: recentPostsError } = await supabase
        .from('posts')
        .select('id, title, status, created_at, slug')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (recentPostsError) throw recentPostsError
      
      // Fetch recent pages
      const { data: recentPages, error: recentPagesError } = await supabase
        .from('pages')
        .select('id, title, status, created_at, slug')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (recentPagesError) throw recentPagesError
      
      // Create activity feed from recent content
      const combinedActivity = [
        ...(recentPosts || []).map(post => ({
          ...post,
          type: 'post',
          time: new Date(post.created_at).getTime()
        })),
        ...(recentPages || []).map(page => ({
          ...page,
          type: 'page',
          time: new Date(page.created_at).getTime()
        }))
      ].sort((a, b) => b.time - a.time).slice(0, 10)
      
      setActivityFeed(combinedActivity)
      
      setStats({
        posts: postsCount || 0,
        pages: pagesCount || 0,
        media: mediaCount || 0,
        plugins: pluginsCount || 0,
        recentPosts: recentPosts || [],
        recentPages: recentPages || []
      })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to xBesh CMS</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here's an overview of your website content and recent activity
        </p>
      </div>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <NewspaperIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Posts</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{stats.posts}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 px-5 py-3">
            <div className="text-sm">
              <Link to="/dashboard/posts" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                View all posts
              </Link>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Pages</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{stats.pages}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 px-5 py-3">
            <div className="text-sm">
              <Link to="/dashboard/pages" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                View all pages
              </Link>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PhotoIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Media Files</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{stats.media}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 px-5 py-3">
            <div className="text-sm">
              <Link to="/dashboard/media" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                View media library
              </Link>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PuzzlePieceIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Plugins</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">{stats.plugins}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 px-5 py-3">
            <div className="text-sm">
              <Link to="/dashboard/plugins" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                Manage plugins
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Content */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Recent Content</h3>
          </div>
          <div className="card-body p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {activityFeed.length > 0 ? (
                activityFeed.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {item.type === 'post' ? (
                          <NewspaperIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        ) : (
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        )}
                        <p className="ml-2 text-sm font-medium text-primary-600 dark:text-primary-400 truncate">
                          <Link to={`/dashboard/${item.type}s/${item.id}`}>
                            {item.title}
                          </Link>
                        </p>
                      </div>
                      <div className="ml-2 flex flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          {item.type === 'post' ? 'Post' : 'Page'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                        <ClockIcon className="mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                        <p>
                          Created on <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-5 text-center text-sm text-gray-500 dark:text-gray-400">
                  No recent content found.
                </div>
              )}
            </div>
          </div>
          <div className="card-footer">
            <div className="flex justify-between">
              <Link to="/dashboard/posts/new" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 flex items-center">
                <PencilSquareIcon className="mr-1.5 h-4 w-4" />
                New Post
              </Link>
              <Link to="/dashboard/pages/new" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 flex items-center">
                <PencilSquareIcon className="mr-1.5 h-4 w-4" />
                New Page
              </Link>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Content</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Link to="/dashboard/posts/new" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900">
                    <PencilSquareIcon className="mr-2 -ml-1 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    Write New Post
                  </Link>
                  <Link to="/dashboard/pages/new" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900">
                    <PencilSquareIcon className="mr-2 -ml-1 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    Create New Page
                  </Link>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Media</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Link to="/dashboard/media" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900">
                    <PhotoIcon className="mr-2 -ml-1 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    Upload Media
                  </Link>
                  <Link to="/dashboard/media" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900">
                    <EyeIcon className="mr-2 -ml-1 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    Browse Media
                  </Link>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Extend</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Link to="/dashboard/plugins" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900">
                    <PuzzlePieceIcon className="mr-2 -ml-1 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    Manage Plugins
                  </Link>
                  <Link to="/dashboard/themes" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900">
                    <PaintBrushIcon className="mr-2 -ml-1 h-5 w-5 text-gray-400 dark:text-gray-500" />
                    Customize Theme
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Plugin Dashboard Widgets Area - This will be populated by plugins */}
      <div id="plugin-dashboard-widgets" className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Plugins will inject content here */}
      </div>
    </div>
  )
}
