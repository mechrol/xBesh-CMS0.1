import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import slugify from 'slugify'
import PreviewModal from '../../components/PreviewModal'

export default function CreatePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [slug, setSlug] = useState('')
  const [autoSlug, setAutoSlug] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      title: '',
      status: 'draft',
      featured_image: '',
      meta_title: '',
      meta_description: '',
      template: 'default',
    }
  })
  
  const title = watch('title')
  
  useEffect(() => {
    if (autoSlug && title) {
      const generatedSlug = slugify(title, { lower: true, strict: true })
      setSlug(generatedSlug)
    }
  }, [title, autoSlug])
  
  const handleSlugChange = (e) => {
    setAutoSlug(false)
    setSlug(e.target.value)
  }
  
  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError(null)
      
      const pageData = {
        ...data,
        content,
        slug: slug || slugify(data.title, { lower: true, strict: true }),
        author_id: user.id,
        created_at: new Date(),
        updated_at: new Date(),
      }
      
      const { data: page, error } = await supabase
        .from('pages')
        .insert([pageData])
        .select()
      
      if (error) throw error
      
      navigate('/dashboard/pages')
    } catch (err) {
      console.error('Error creating page:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  }
  
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Create New Page</h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => setShowPreview(true)}
            disabled={!title}
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Preview
          </button>
          <button
            type="button"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Page'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <form className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('title', { required: 'Title is required' })}
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="permalink" className="block text-sm font-medium text-gray-700">
                  Permalink
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    {window.location.origin}/
                  </span>
                  <input
                    type="text"
                    name="slug"
                    id="slug"
                    value={slug}
                    onChange={handleSlugChange}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300"
                  />
                </div>
                <div className="mt-1 flex items-center">
                  <input
                    id="auto-slug"
                    name="auto-slug"
                    type="checkbox"
                    checked={autoSlug}
                    onChange={() => setAutoSlug(!autoSlug)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="auto-slug" className="ml-2 block text-sm text-gray-500">
                    Auto-generate from title
                  </label>
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <div className="mt-1">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    className="h-64 sm:h-96"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700">
                  Featured Image URL
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="featured_image"
                    id="featured_image"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://example.com/image.jpg"
                    {...register('featured_image')}
                  />
                </div>
                {watch('featured_image') && (
                  <div className="mt-2">
                    <img 
                      src={watch('featured_image')} 
                      alt="Featured preview" 
                      className="h-32 w-auto object-cover rounded-md"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/640x360?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="template" className="block text-sm font-medium text-gray-700">
                  Template
                </label>
                <div className="mt-1">
                  <select
                    id="template"
                    name="template"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('template')}
                  >
                    <option value="default">Default</option>
                    <option value="full-width">Full Width</option>
                    <option value="sidebar">With Sidebar</option>
                    <option value="landing">Landing Page</option>
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <select
                    id="status"
                    name="status"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('status')}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">SEO Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Optimize your page for search engines.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700">
                  Meta Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="meta_title"
                    id="meta_title"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('meta_title')}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Leave blank to use the page title.
                </p>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">
                  Meta Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="meta_description"
                    name="meta_description"
                    rows={3}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    {...register('meta_description')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => navigate('/dashboard/pages')}
            >
              Cancel
            </button>
            <button
              type="button"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Page'}
            </button>
          </div>
        </div>
      </form>
      
      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={watch('title') || 'Untitled Page'}
        content={content}
        type="page"
        featuredImage={watch('featured_image')}
        template={watch('template')}
      />
    </div>
  )
}
