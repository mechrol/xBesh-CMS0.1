import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Media() {
  const [mediaItems, setMediaItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    fetchMedia()
  }, [currentPage, searchTerm])

  const fetchMedia = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('media')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`)
      }
      
      const { data, count, error } = await query
      
      if (error) throw error
      
      setMediaItems(data || [])
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (error) {
      console.error('Error fetching media:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event) => {
    try {
      const files = event.target.files
      if (!files || files.length === 0) return
      
      setUploading(true)
      setError(null)
      
      for (const file of files) {
        // Upload to storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `media/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file)
        
        if (uploadError) throw uploadError
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(filePath)
        
        // Save to media table
        const { error: dbError } = await supabase
          .from('media')
          .insert([
            {
              name: file.name,
              file_path: filePath,
              url: urlData.publicUrl,
              size: file.size,
              type: file.type,
              created_at: new Date(),
            },
          ])
        
        if (dbError) throw dbError
      }
      
      // Refresh media list
      fetchMedia()
    } catch (error) {
      console.error('Error uploading file:', error)
      setError(error.message)
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = null
    }
  }

  const handleDelete = async (id, filePath) => {
    if (!confirm('Are you sure you want to delete this media item?')) return
    
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([filePath])
      
      if (storageError) throw storageError
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('media')
        .delete()
        .eq('id', id)
      
      if (dbError) throw dbError
      
      // Update state
      setMediaItems(mediaItems.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting media:', error)
      setError(error.message)
    }
  }

  // Sample data for demonstration
  const sampleMedia = [
    { id: 1, name: 'hero-image.jpg', url: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg', type: 'image/jpeg', size: 1024000, created_at: new Date().toISOString() },
    { id: 2, name: 'about-banner.jpg', url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg', type: 'image/jpeg', size: 2048000, created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, name: 'product-1.jpg', url: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg', type: 'image/jpeg', size: 512000, created_at: new Date(Date.now() - 172800000).toISOString() },
    { id: 4, name: 'team-photo.jpg', url: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg', type: 'image/jpeg', size: 1536000, created_at: new Date(Date.now() - 259200000).toISOString() },
    { id: 5, name: 'logo.png', url: 'https://images.pexels.com/photos/1181290/pexels-photo-1181290.jpeg', type: 'image/png', size: 256000, created_at: new Date(Date.now() - 345600000).toISOString() },
    { id: 6, name: 'background.jpg', url: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg', type: 'image/jpeg', size: 3072000, created_at: new Date(Date.now() - 432000000).toISOString() },
  ]

  const displayMedia = mediaItems.length > 0 ? mediaItems : sampleMedia

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your images and other media files
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            {uploading ? 'Uploading...' : 'Upload Files'}
          </label>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
          />
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
      
      {/* Search */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="max-w-lg">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
            <div className="mt-1">
              <input
                type="text"
                name="search"
                id="search"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Media Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayMedia.map((item) => (
            <div key={item.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                {item.type?.startsWith('image/') ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-500 flex flex-col items-center justify-center">
                    <svg className="h-12 w-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="mt-2 text-sm">{item.type}</span>
                  </div>
                )}
              </div>
              <div className="px-4 py-4">
                <div className="text-sm font-medium text-gray-900 truncate" title={item.name}>
                  {item.name}
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>{formatFileSize(item.size)}</span>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 flex justify-between">
                <button
                  type="button"
                  className="text-sm text-primary-600 hover:text-primary-900"
                  onClick={() => navigator.clipboard.writeText(item.url)}
                >
                  Copy URL
                </button>
                <button
                  type="button"
                  className="text-sm text-red-600 hover:text-red-900"
                  onClick={() => handleDelete(item.id, item.file_path)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, (totalPages * itemsPerPage))}
                </span>{' '}
                of <span className="font-medium">{totalPages * itemsPerPage}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
  )
}
