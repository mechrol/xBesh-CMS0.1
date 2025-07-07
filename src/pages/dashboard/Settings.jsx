import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../../lib/supabase'

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [settingsId, setSettingsId] = useState(null)
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm()
  
  useEffect(() => {
    fetchSettings()
  }, [])
  
  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        throw error
      }
      
      if (data) {
        reset(data)
        setSettingsId(data.id)
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError('Failed to load settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const onSubmit = async (data) => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)
      
      let result
      
      if (settingsId) {
        // Update existing settings
        result = await supabase
          .from('settings')
          .update(data)
          .eq('id', settingsId)
      } else {
        // Create new settings
        result = await supabase
          .from('settings')
          .insert([data])
          .select()
        
        if (result.data && result.data[0]) {
          setSettingsId(result.data[0].id)
        }
      }
      
      if (result.error) throw result.error
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading settings...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure your website settings
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
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
      
      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Settings saved successfully!</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <form className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">General Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Basic information about your website.
              </p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="site_title" className="block text-sm font-medium text-gray-700">
                  Site Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="site_title"
                    id="site_title"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('site_title', { required: 'Site title is required' })}
                  />
                  {errors.site_title && (
                    <p className="mt-2 text-sm text-red-600">{errors.site_title.message}</p>
                  )}
                </div>
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="site_description" className="block text-sm font-medium text-gray-700">
                  Site Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="site_description"
                    name="site_description"
                    rows={3}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    {...register('site_description')}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  A short description of your website. This will be used in search results and social media shares.
                </p>
              </div>
              
              <div className="sm:col-span-4">
                <label htmlFor="site_logo" className="block text-sm font-medium text-gray-700">
                  Site Logo URL
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="site_logo"
                    id="site_logo"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://example.com/logo.png"
                    {...register('site_logo')}
                  />
                </div>
              </div>
              
              <div className="sm:col-span-4">
                <label htmlFor="site_favicon" className="block text-sm font-medium text-gray-700">
                  Site Favicon URL
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="site_favicon"
                    id="site_favicon"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="https://example.com/favicon.ico"
                    {...register('site_favicon')}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">URL Structure</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure how your content URLs are structured.
              </p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="permalink_structure" className="block text-sm font-medium text-gray-700">
                  Post URL Prefix
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    {window.location.origin}
                  </span>
                  <input
                    type="text"
                    name="permalink_structure"
                    id="permalink_structure"
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm border-gray-300"
                    placeholder="/blog"
                    {...register('permalink_structure')}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  The URL prefix for your blog posts. For example, "/blog" will make your posts appear as "{window.location.origin}/blog/post-slug".
                </p>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="posts_per_page" className="block text-sm font-medium text-gray-700">
                  Posts Per Page
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="posts_per_page"
                    id="posts_per_page"
                    min="1"
                    max="50"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('posts_per_page', { 
                      valueAsNumber: true,
                      min: { value: 1, message: 'Must be at least 1' },
                      max: { value: 50, message: 'Cannot exceed 50' }
                    })}
                  />
                  {errors.posts_per_page && (
                    <p className="mt-2 text-sm text-red-600">{errors.posts_per_page.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Footer Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure your website footer.
              </p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="footer_text" className="block text-sm font-medium text-gray-700">
                  Footer Text
                </label>
                <div className="mt-1">
                  <textarea
                    id="footer_text"
                    name="footer_text"
                    rows={3}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="© 2023 My Website. All rights reserved."
                    {...register('footer_text')}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Integrations</h3>
              <p className="mt-1 text-sm text-gray-500">
                Connect your website with third-party services.
              </p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="google_analytics_id" className="block text-sm font-medium text-gray-700">
                  Google Analytics ID
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="google_analytics_id"
                    id="google_analytics_id"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
                    {...register('google_analytics_id')}
                  />
                </div>
              </div>
              
              <div className="sm:col-span-4">
                <label htmlFor="disqus_shortname" className="block text-sm font-medium text-gray-700">
                  Disqus Shortname
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="disqus_shortname"
                    id="disqus_shortname"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('disqus_shortname')}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  If you want to enable comments on your posts, enter your Disqus shortname.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => reset()}
            >
              Reset
            </button>
            <button
              type="button"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={handleSubmit(onSubmit)}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
