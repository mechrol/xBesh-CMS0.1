import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function PreviewModal({ isOpen, onClose, title, content, type, featuredImage, template }) {
  const getTemplateClass = () => {
    if (type === 'page' && template) {
      switch (template) {
        case 'full-width':
          return 'max-w-none px-4';
        case 'sidebar':
          return 'grid grid-cols-1 lg:grid-cols-3 gap-8 px-4';
        case 'landing':
          return 'max-w-none px-0';
        default:
          return 'max-w-3xl px-4';
      }
    }
    return 'max-w-3xl px-4';
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="bg-white min-h-[80vh] max-h-[80vh] overflow-y-auto">
                  {/* Preview Header */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold leading-6 text-gray-900">
                        {type === 'post' ? 'Post Preview' : 'Page Preview'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        This is how your {type} will look on the frontend
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        Preview Mode
                      </span>
                    </div>
                  </div>
                  
                  {/* Preview Content */}
                  <div className="preview-container">
                    {/* Featured Image */}
                    {featuredImage && (
                      <div className="w-full h-64 md:h-80 overflow-hidden">
                        <img 
                          src={featuredImage} 
                          alt={title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/1200x600?text=Featured+Image';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className={`mx-auto py-8 ${getTemplateClass()}`}>
                      {template === 'sidebar' ? (
                        <>
                          <div className="col-span-2">
                            <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
                            <div 
                              className="prose prose-lg max-w-none"
                              dangerouslySetInnerHTML={{ __html: content }}
                            />
                          </div>
                          <div className="col-span-1">
                            <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Sidebar</h3>
                              <div className="space-y-4">
                                <div className="bg-white p-4 rounded shadow-sm">
                                  <h4 className="font-medium text-gray-800 mb-2">Recent Posts</h4>
                                  <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="text-primary-600 hover:underline">Sample Post 1</a></li>
                                    <li><a href="#" className="text-primary-600 hover:underline">Sample Post 2</a></li>
                                    <li><a href="#" className="text-primary-600 hover:underline">Sample Post 3</a></li>
                                  </ul>
                                </div>
                                <div className="bg-white p-4 rounded shadow-sm">
                                  <h4 className="font-medium text-gray-800 mb-2">Categories</h4>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Category 1</span>
                                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Category 2</span>
                                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Category 3</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : template === 'landing' ? (
                        <div className="space-y-12">
                          <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20 px-4 text-center">
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">{title}</h1>
                            <p className="text-xl max-w-2xl mx-auto">This is a landing page template with a hero section.</p>
                            <div className="mt-8">
                              <button className="bg-white text-primary-600 px-6 py-3 rounded-md font-medium shadow-md hover:bg-gray-100 transition">
                                Call to Action
                              </button>
                            </div>
                          </div>
                          <div className="max-w-5xl mx-auto">
                            <div 
                              className="prose prose-lg max-w-none"
                              dangerouslySetInnerHTML={{ __html: content }}
                            />
                          </div>
                          <div className="bg-gray-50 py-16 px-4">
                            <div className="max-w-5xl mx-auto text-center">
                              <h2 className="text-3xl font-bold mb-8">Featured Section</h2>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[1, 2, 3].map((i) => (
                                  <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                      <span className="font-bold">{i}</span>
                                    </div>
                                    <h3 className="text-xl font-medium mb-2">Feature {i}</h3>
                                    <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
                          <div 
                            className="prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: content }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                  >
                    Close Preview
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
