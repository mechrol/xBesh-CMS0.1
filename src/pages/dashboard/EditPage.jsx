import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Editor } from '@tinymce/tinymce-react'
import { ExclamationCircleIcon, EyeIcon, LinkIcon } from '@heroicons/react/24/outline'

export default function EditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState({
    title: '',
    slug: '',
    content: '',
    meta_description: '',
    status: 'draft'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const editorRef = useRef(null)
  const [siteUrl, setSiteUrl] = useState('')
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    fetchPage()
    // Get the base URL for preview links
    const url = window.location.origin
    setSiteUrl(url)
    
    // Detect theme
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
  }, [id])

  const fetchPage = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setPage(data || {
        title: '',
        slug: '',
        content: '',
        meta_description: '',
        status: 'draft'
      })
    } catch (err) {
      console.error('Error fetching page:', err)
      setError('Failed to load page')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setPage({ ...page, [name]: value })

    // Auto-generate slug from title if slug is empty
    if (name === 'title' && (!page.slug || page.slug === '')) {
      setPage({
        ...page,
        title: value,
        slug: value.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')
      })
    }
  }

  const handleEditorChange = () => {
    if (editorRef.current) {
      setPage({ ...page, content: editorRef.current.getContent() })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError(null)

      // Make sure we have the latest content from the editor
      if (editorRef.current) {
        page.content = editorRef.current.getContent()
      }

      const { error } = await supabase
        .from('pages')
        .update({
          title: page.title,
          slug: page.slug,
          content: page.content,
          meta_description: page.meta_description,
          status: page.status,
          updated_at: new Date()
        })
        .eq('id', id)

      if (error) throw error

      navigate('/dashboard/pages')
    } catch (err) {
      console.error('Error updating page:', err)
      setError('Failed to save page')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    // Save current content to preview
    if (editorRef.current) {
      const content = editorRef.current.getContent()
      setPage({ ...page, content })
      
      // Create a preview URL
      setPreviewUrl(`/preview/page/${id}`)
      setShowPreview(true)
      
      // Open preview in new tab
      window.open(`/preview/page/${id}`, '_blank')
    }
  }

  const handleViewPublished = () => {
    if (page.status === 'published' && page.slug) {
      window.open(`/${page.slug}`, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Edit Page
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
          {page.status === 'published' && page.slug && (
            <button
              type="button"
              onClick={handleViewPublished}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <LinkIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
              View Published
            </button>
          )}
          <button
            type="button"
            onClick={handlePreview}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <EyeIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
            Preview
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Page Details</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Basic information about the page.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={page.title}
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                    required
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Slug
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 sm:text-sm">
                      {siteUrl}/
                    </span>
                    <input
                      type="text"
                      name="slug"
                      id="slug"
                      value={page.slug}
                      onChange={handleChange}
                      className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-6">
                  <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Meta Description
                  </label>
                  <textarea
                    id="meta_description"
                    name="meta_description"
                    rows={3}
                    value={page.meta_description || ''}
                    onChange={handleChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Brief description for search engines. Recommended length is 150-160 characters.
                  </p>
                </div>

                <div className="col-span-6">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={page.status}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Content</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                The main content of your page.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <Editor
                onInit={(evt, editor) => editorRef.current = editor}
                initialValue={page.content}
                onEditorChange={handleEditorChange}
                init={{
                  height: 500,
                  menubar: true,
                  plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount'
                  ],
                  toolbar: 'undo redo | formatselect | ' +
                    'bold italic backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  skin: theme === 'dark' ? 'oxide-dark' : 'oxide',
                  content_css: theme === 'dark' ? 'dark' : 'default'
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/dashboard/pages')}
            className="bg-white dark:bg-gray-800 py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
