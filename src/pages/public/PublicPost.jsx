import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import PublicLayout from '../../components/layouts/PublicLayout'
import { formatDate } from '../../utils/formatters'

export default function PublicPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPost()
  }, [slug])

  const fetchPost = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('posts')
        .select('*, author:profiles(*)')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (error) {
        console.error('Error fetching post:', error)
        setError('Post not found or not published')
        return
      }

      setPost(data)
    } catch (err) {
      console.error('Error:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </PublicLayout>
    )
  }

  if (error || !post) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-xl mx-auto text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Post not found
            </h1>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
              The post you're looking for doesn't exist or isn't published.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go back home
              </button>
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {post.title}
          </h1>
          
          <div className="mt-4 flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            {post.author && (
              <span className="flex items-center">
                <span className="font-medium text-gray-900 dark:text-white">
                  {post.author.full_name || post.author.email}
                </span>
              </span>
            )}
            <span>•</span>
            <time dateTime={post.published_at || post.created_at}>
              {formatDate(post.published_at || post.created_at)}
            </time>
          </div>
          
          {post.meta_description && (
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              {post.meta_description}
            </p>
          )}
          
          {post.featured_image && (
            <div className="mt-6 aspect-w-16 aspect-h-9 overflow-hidden rounded-lg">
              <img 
                src={post.featured_image} 
                alt={post.title} 
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </header>
        
        <div 
          className="prose prose-lg max-w-none dark:prose-invert prose-a:text-primary-600 dark:prose-a:text-primary-400"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </PublicLayout>
  )
}
