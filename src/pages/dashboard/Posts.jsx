import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { format } from 'date-fns'
import { LinkIcon } from '@heroicons/react/24/outline'

export default function Posts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const postsPerPage = 10

  useEffect(() => {
    fetchPosts()
  }, [currentPage, statusFilter, searchTerm])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * postsPerPage, currentPage * postsPerPage - 1)
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }
      
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`)
      }
      
      const { data, count, error } = await query
      
      if (error) throw error
      
      setPosts(data || [])
      setTotalPages(Math.ceil((count || 0) / postsPerPage))
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setPosts(posts.filter(post => post.id !== id))
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handleViewPublished = (slug) => {
    window.open(`/post/${slug}`, '_blank')
  }

  // Sample data for demonstration
  const samplePosts = [
    { id: 1, title: 'Getting Started with xBesh CMS', slug: 'getting-started', status: 'published', created_at: new Date().toISOString(), author: 'Admin' },
    { id: 2, title: 'How to Create Custom Themes', slug: 'custom-themes', status: 'published', created_at: new Date(Date.now() - 86400000).toISOString(), author: 'Admin' },
    { id: 3, title: 'Advanced Content Management', slug: 'advanced-content', status: 'draft', created_at: new Date(Date.now() - 172800000).toISOString(), author: 'Admin' },
    { id: 4, title: 'SEO Best Practices', slug: 'seo-best-practices', status: 'published', created_at: new Date(Date.now() - 259200000).toISOString(), author: 'Admin' },
    { id: 5, title: 'Customizing Your Dashboard', slug: 'customizing-dashboard', status: 'draft', created_at: new Date(Date.now() - 345600000).toISOString(), author: 'Admin' },
  ]

  const displayPosts = posts.length > 0 ? posts : samplePosts

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Posts</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your blog posts
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/dashboard/posts/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Post
          </Link>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
              <div className="mt-1">
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                id="status"
                name="status"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setCurrentPage(1)
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Posts Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Author
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Loading posts...
                  </td>
                </tr>
              ) : displayPosts.length > 0 ? (
                displayPosts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            <Link to={`/dashboard/posts/${post.id}`} className="hover:text-primary-600 dark:hover:text-primary-400">
                              {post.title}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            /post/{post.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{post.author || 'Admin'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(post.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {post.status === 'published' && (
                          <button
                            onClick={() => handleViewPublished(post.slug)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            <LinkIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        )}
                        <Link
                          to={`/dashboard/posts/${post.id}`}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No posts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{(currentPage - 1) * postsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * postsPerPage, (totalPages * postsPerPage))}
                  </span>{' '}
                  of <span className="font-medium">{totalPages * postsPerPage}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-primary-50 dark:bg-primary-900 border-primary-500 dark:border-primary-600 text-primary-600 dark:text-primary-300'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
