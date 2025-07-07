import { useState, useEffect } from 'react'
import { usePlugins } from '../../contexts/PluginContext'
import { 
  PlusIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  TrashIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

export default function Plugins() {
  const { 
    plugins, 
    loading, 
    install, 
    activate, 
    deactivate, 
    remove 
  } = usePlugins()
  
  const [uploadOpen, setUploadOpen] = useState(false)
  const [pluginFiles, setPluginFiles] = useState([])
  const [pluginMetadata, setPluginMetadata] = useState({
    name: '',
    slug: '',
    description: '',
    version: '',
    author: '',
    mainFile: ''
  })
  const [installing, setInstalling] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const handleFileChange = (e) => {
    setPluginFiles(Array.from(e.target.files))
  }

  const handleMetadataChange = (e) => {
    const { name, value } = e.target
    setPluginMetadata({
      ...pluginMetadata,
      [name]: value
    })
  }

  const handleInstall = async (e) => {
    e.preventDefault()
    setInstalling(true)
    setError(null)
    
    try {
      // Find the main JavaScript file
      const mainFile = pluginFiles.find(file => file.name === pluginMetadata.mainFile)
      if (!mainFile) {
        throw new Error(`Main file ${pluginMetadata.mainFile} not found`)
      }
      
      // Read the main file
      const code = await readFileAsText(mainFile)
      
      // Create the plugin package
      const pluginPackage = {
        name: pluginMetadata.name,
        slug: pluginMetadata.slug,
        description: pluginMetadata.description,
        version: pluginMetadata.version,
        author: pluginMetadata.author,
        authorUrl: pluginMetadata.authorUrl || '',
        homepageUrl: pluginMetadata.homepageUrl || '',
        mainFile: pluginMetadata.mainFile,
        code,
        hooks: [] // In a real implementation, this would be extracted from the plugin code
      }
      
      // Install the plugin
      const result = await install(pluginPackage)
      
      if (result.success) {
        setSuccessMessage(`Plugin "${pluginMetadata.name}" installed successfully`)
        setUploadOpen(false)
        setPluginFiles([])
        setPluginMetadata({
          name: '',
          slug: '',
          description: '',
          version: '',
          author: '',
          mainFile: ''
        })
      } else {
        setError(result.error || 'Failed to install plugin')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setInstalling(false)
    }
  }

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  const handleActivate = async (pluginId) => {
    const result = await activate(pluginId)
    if (result.success) {
      setSuccessMessage('Plugin activated successfully')
    } else {
      setError(result.error || 'Failed to activate plugin')
    }
  }

  const handleDeactivate = async (pluginId) => {
    const result = await deactivate(pluginId)
    if (result.success) {
      setSuccessMessage('Plugin deactivated successfully')
    } else {
      setError(result.error || 'Failed to deactivate plugin')
    }
  }

  const handleDelete = async (pluginId) => {
    if (window.confirm('Are you sure you want to delete this plugin? This action cannot be undone.')) {
      const result = await remove(pluginId)
      if (result.success) {
        setSuccessMessage('Plugin deleted successfully')
      } else {
        setError(result.error || 'Failed to delete plugin')
      }
    }
  }

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Plugins
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and install plugins to extend your CMS functionality
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => setUploadOpen(!uploadOpen)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add New Plugin
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {uploadOpen && (
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Upload Plugin
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
              <p>
                Upload a plugin package to extend your CMS functionality.
              </p>
            </div>
            <form className="mt-5 sm:flex sm:flex-col sm:gap-4" onSubmit={handleInstall}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Plugin Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={pluginMetadata.name}
                      onChange={handleMetadataChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Plugin Slug
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="slug"
                      id="slug"
                      value={pluginMetadata.slug}
                      onChange={handleMetadataChange}
                      pattern="[a-z0-9-]+"
                      title="Lowercase letters, numbers, and hyphens only"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Lowercase letters, numbers, and hyphens only
                  </p>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={pluginMetadata.description}
                      onChange={handleMetadataChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="version" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Version
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="version"
                      id="version"
                      value={pluginMetadata.version}
                      onChange={handleMetadataChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Author
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="author"
                      id="author"
                      value={pluginMetadata.author}
                      onChange={handleMetadataChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="mainFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Main File
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="mainFile"
                      id="mainFile"
                      value={pluginMetadata.mainFile}
                      onChange={handleMetadataChange}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    e.g., index.js
                  </p>
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Plugin Files
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                        >
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        JavaScript files and assets for your plugin
                      </p>
                    </div>
                  </div>
                  {pluginFiles.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {pluginFiles.map((file, index) => (
                        <li key={index} className="text-primary-600 dark:text-primary-400">
                          {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={installing}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {installing ? (
                    <>
                      <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                      Installing...
                    </>
                  ) : (
                    'Install Plugin'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setUploadOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-700 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            <li className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-center">
                <ArrowPathIcon className="animate-spin h-5 w-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading plugins...</span>
              </div>
            </li>
          ) : plugins.length === 0 ? (
            <li className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">No plugins installed</span>
              </div>
            </li>
          ) : (
            plugins.map((plugin) => (
              <li key={plugin.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {plugin.icon ? (
                        <img className="h-12 w-12 rounded" src={plugin.icon} alt={plugin.name} />
                      ) : (
                        <div className="h-12 w-12 rounded bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
                          <span className="text-lg font-medium">{plugin.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                          {plugin.name}
                        </h3>
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          v{plugin.version}
                        </span>
                        {plugin.status === 'active' && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                            Active
                          </span>
                        )}
                        {plugin.status === 'inactive' && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                            Inactive
                          </span>
                        )}
                        {plugin.status === 'error' && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                            Error
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {plugin.description || 'No description available'}
                      </p>
                      {plugin.author && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                          By {plugin.author_url ? (
                            <a 
                              href={plugin.author_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-600 dark:text-primary-400 hover:underline"
                            >
                              {plugin.author}
                            </a>
                          ) : plugin.author}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {plugin.status === 'inactive' && (
                      <button
                        type="button"
                        onClick={() => handleActivate(plugin.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Activate
                      </button>
                    )}
                    {plugin.status === 'active' && (
                      <button
                        type="button"
                        onClick={() => handleDeactivate(plugin.id)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Deactivate
                      </button>
                    )}
                    <button
                      type="button"
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      <Cog6ToothIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(plugin.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Plugin Development
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
            <p>
              Learn how to develop plugins for xBesh CMS. Plugins can extend the functionality of your CMS with custom features.
            </p>
          </div>
          <div className="mt-5">
            <a
              href="#"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              View Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
