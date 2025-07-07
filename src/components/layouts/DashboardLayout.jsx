import { Fragment, useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Dialog, Menu, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  DocumentTextIcon,
  HomeIcon,
  NewspaperIcon,
  PhotoIcon,
  Cog6ToothIcon,
  XMarkIcon,
  PaintBrushIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useTheme } from '../../contexts/ThemeContext'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { theme } = useTheme()
  const [siteSettings, setSiteSettings] = useState(null)

  useEffect(() => {
    fetchSiteSettings()
  }, [])

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching site settings:', error)
      }
      
      if (data) {
        setSiteSettings(data)
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Posts', href: '/dashboard/posts', icon: NewspaperIcon },
    { name: 'Pages', href: '/dashboard/pages', icon: DocumentTextIcon },
    { name: 'Media', href: '/dashboard/media', icon: PhotoIcon },
    { name: 'Plugins', href: '/dashboard/plugins', icon: PuzzlePieceIcon },
    { name: 'Themes', href: '/dashboard/themes', icon: PaintBrushIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
  ]

  // Logo URL based on theme
  const logoUrl = theme === 'dark' 
    ? "https://xbesh.dev/logo-dark-styled.png" 
    : "https://xbesh.dev/logo-dark-styled.png"
 const logoClass = theme === 'dark' 
    ? "" 
    : "invert"
	
  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className="h-full dark:bg-gray-900">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-5 w-5 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center invert dark:invert-0">
                      <img
                        className={`h-8 w-auto ${logoClass}`}
                        src={logoUrl}
                        alt="xBesh CMS"
                      />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <NavLink
                                  to={item.href}
                                  className={({ isActive }) => classNames(
                                    isActive
                                      ? 'bg-gray-50 text-primary-600 dark:bg-gray-800 dark:text-primary-400'
                                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800',
                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium'
                                  )}
                                >
                                  {({ isActive }) => (
                                    <>
                                      <item.icon
                                        className={classNames(
                                          isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 group-hover:text-primary-600 dark:text-gray-500 dark:group-hover:text-primary-400',
                                          'h-5 w-5 shrink-0'
                                        )}
                                        aria-hidden="true"
                                      />
                                      {item.name}
                                    </>
                                  )}
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <img
                className={`h-8 w-auto ${theme === 'light' ? 'invert brightness-0' : ''}`}
                src={logoUrl}
                alt="xBesh CMS"
              />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          className={({ isActive }) => classNames(
                            isActive
                              ? 'bg-gray-50 text-primary-600 dark:bg-gray-800 dark:text-primary-400'
                              : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium'
                          )}
                        >
                          {({ isActive }) => (
                            <>
                              <item.icon
                                className={classNames(
                                  isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 group-hover:text-primary-600 dark:text-gray-500 dark:group-hover:text-primary-400',
                                  'h-5 w-5 shrink-0'
                                )}
                                aria-hidden="true"
                              />
                              {item.name}
                            </>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="mt-auto">
                  <div className="text-xs font-semibold leading-6 text-gray-400 dark:text-gray-500">
                    {siteSettings?.site_title || 'xBesh CMS'}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-600">
                    v1.0.0
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button type="button" className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 lg:hidden" aria-hidden="true" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex items-center">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {location.pathname === '/dashboard' && 'Dashboard'}
                  {location.pathname === '/dashboard/posts' && 'Posts'}
                  {location.pathname.includes('/dashboard/posts/new') && 'New Post'}
                  {location.pathname.includes('/dashboard/posts/') && !location.pathname.includes('/new') && 'Edit Post'}
                  {location.pathname === '/dashboard/pages' && 'Pages'}
                  {location.pathname.includes('/dashboard/pages/new') && 'New Page'}
                  {location.pathname.includes('/dashboard/pages/') && !location.pathname.includes('/new') && 'Edit Page'}
                  {location.pathname === '/dashboard/media' && 'Media Library'}
                  {location.pathname === '/dashboard/plugins' && 'Plugins'}
                  {location.pathname === '/dashboard/themes' && 'Themes'}
                  {location.pathname === '/dashboard/settings' && 'Settings'}
                </h1>
              </div>
              <div className="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
                {/* Profile dropdown */}
                <Menu as="div" className="relative">
                  <Menu.Button className="-m-1.5 flex items-center p-1.5">
                    <span className="sr-only">Open user menu</span>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="hidden lg:flex lg:items-center">
                        <span className="ml-4 text-sm font-semibold leading-6 text-gray-900 dark:text-white" aria-hidden="true">
                          {user?.email || 'User'}
                        </span>
                        <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-400" aria-hidden="true" />
                      </span>
                    </div>
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700/50 focus:outline-none">
                      <div className="px-4 py-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Logged in as</p>
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p>
                      </div>
                      <div className="border-t border-gray-100 dark:border-gray-700"></div>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(
                              active ? 'bg-gray-50 dark:bg-gray-700' : '',
                              'flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                            )}
                          >
                            <UserIcon className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                            Your profile
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={classNames(
                              active ? 'bg-gray-50 dark:bg-gray-700' : '',
                              'flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300'
                            )}
                          >
                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
