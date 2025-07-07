import { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase } from '../../lib/supabase'
import { SunIcon, MoonIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function Themes() {
  const { theme, setTheme } = useTheme()
  const [activeTheme, setActiveTheme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [customThemes, setCustomThemes] = useState([])

  useEffect(() => {
    fetchThemes()
  }, [])

  const fetchThemes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch active theme from settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('active_theme')
        .limit(1)
        .single()
      
      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError
      }
      
      if (settingsData?.active_theme) {
        setActiveTheme(settingsData.active_theme)
      }
      
      // Fetch custom themes (in a real app, this would come from the database)
      // For now, we'll use mock data
      setCustomThemes([
        {
          id: 'modern',
          name: 'Modern',
          description: 'A clean, modern theme with a focus on readability',
          thumbnail: 'https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
          colors: {
            primary: '#0ea5e9',
            secondary: '#6366f1',
            accent: '#8b5cf6'
          }
        },
        {
          id: 'minimal',
          name: 'Minimal',
          description: 'A minimalist theme with a focus on content',
          thumbnail: 'https://images.pexels.com/photos/1420709/pexels-photo-1420709.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
          colors: {
            primary: '#10b981',
            secondary: '#14b8a6',
            accent: '#06b6d4'
          }
        },
        {
          id: 'bold',
          name: 'Bold',
          description: 'A bold theme with strong colors and typography',
          thumbnail: 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
          colors: {
            primary: '#ef4444',
            secondary: '#f97316',
            accent: '#f59e0b'
          }
        },
        {
          id: 'elegant',
          name: 'Elegant',
          description: 'An elegant theme with a focus on typography and spacing',
          thumbnail: 'https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
          colors: {
            primary: '#6d28d9',
            secondary: '#8b5cf6',
            accent: '#a78bfa'
          }
        }
      ])
    } catch (err) {
      console.error('Error fetching themes:', err)
      setError('Failed to load themes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const activateTheme = async (themeId) => {
    try {
      setLoading(true)
      
      // Update active theme in settings
      const { error } = await supabase
        .from('settings')
        .update({ active_theme: themeId })
        .eq('id', 1) // Assuming settings has an ID of 1
      
      if (error) throw error
      
      setActiveTheme(themeId)
      
      // In a real app, this would apply the theme's styles
      // For now, we'll just show a success message
    } catch (err) {
      console.error('Error activating theme:', err)
      setError('Failed to activate theme. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading && customThemes.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading themes...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Themes</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Customize the look and feel of your website
          </p>
        </div>
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
      
      <div className="space-y-8">
        {/* Color Mode Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Color Mode</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Choose between light and dark mode for the admin dashboard
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div 
                className={`relative rounded-lg border ${theme === 'light' ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-300 dark:border-gray-700'} p-4 cursor-pointer`}
                onClick={() => setTheme('light')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SunIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">Light Mode</span>
                  </div>
                  {theme === 'light' && (
                    <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                  )}
                </div>
                <div className="mt-4 bg-gray-100 rounded-md p-3 text-xs text-gray-800">
                  Preview of light mode
                </div>
              </div>
              
              <div 
                className={`relative rounded-lg border ${theme === 'dark' ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-300 dark:border-gray-700'} p-4 cursor-pointer`}
                onClick={() => setTheme('dark')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MoonIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">Dark Mode</span>
                  </div>
                  {theme === 'dark' && (
                    <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                  )}
                </div>
                <div className="mt-4 bg-gray-800 rounded-md p-3 text-xs text-gray-200">
                  Preview of dark mode
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Frontend Themes Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Frontend Themes</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Choose a theme for your public website
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {customThemes.map((customTheme) => (
                <div 
                  key={customTheme.id}
                  className={`relative rounded-lg border ${activeTheme === customTheme.id ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-300 dark:border-gray-700'} overflow-hidden cursor-pointer transition-all hover:shadow-md`}
                  onClick={() => activateTheme(customTheme.id)}
                >
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={customTheme.thumbnail} 
                      alt={customTheme.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x200?text=Theme+Preview';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{customTheme.name}</h4>
                      {activeTheme === customTheme.id && (
                        <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-400">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{customTheme.description}</p>
                    <div className="mt-3 flex space-x-2">
                      {Object.entries(customTheme.colors).map(([key, color]) => (
                        <div 
                          key={key}
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: color }}
                          title={`${key}: ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Custom CSS Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Custom CSS</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Add custom CSS to further customize your website
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-4">
              <label htmlFor="custom_css" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Custom CSS
              </label>
              <div className="mt-1">
                <textarea
                  id="custom_css"
                  name="custom_css"
                  rows={8}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-md font-mono"
                  placeholder="/* Add your custom CSS here */
.site-header {
  background-color: #f8f9fa;
}

.site-footer {
  padding: 2rem 0;
}"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                This CSS will be applied to your public website. Be careful with your changes.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Save Custom CSS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
