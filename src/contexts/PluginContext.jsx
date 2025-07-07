import { createContext, useContext, useState, useEffect } from 'react'
import { 
  initializePluginSystem, 
  getInstalledPlugins, 
  installPlugin, 
  activatePlugin, 
  deactivatePlugin, 
  deletePlugin,
  doAction,
  applyFilters
} from '../lib/pluginSystem'

const PluginContext = createContext()

export function usePlugins() {
  return useContext(PluginContext)
}

export function PluginProvider({ children }) {
  const [plugins, setPlugins] = useState([])
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    async function initialize() {
      try {
        setLoading(true)
        
        // Initialize the plugin system
        await initializePluginSystem()
        setInitialized(true)
        
        // Load installed plugins
        const installedPlugins = await getInstalledPlugins()
        setPlugins(installedPlugins)
      } catch (err) {
        console.error('Failed to initialize plugin system:', err)
      } finally {
        setLoading(false)
      }
    }
    
    initialize()
  }, [])

  // Install a new plugin
  const install = async (pluginPackage) => {
    setLoading(true)
    try {
      const result = await installPlugin(pluginPackage)
      if (result.success) {
        // Refresh the plugin list
        const installedPlugins = await getInstalledPlugins()
        setPlugins(installedPlugins)
        return { success: true }
      }
      return result
    } catch (err) {
      console.error('Failed to install plugin:', err)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Activate a plugin
  const activate = async (pluginId) => {
    setLoading(true)
    try {
      const result = await activatePlugin(pluginId)
      if (result.success) {
        // Refresh the plugin list
        const installedPlugins = await getInstalledPlugins()
        setPlugins(installedPlugins)
        return { success: true }
      }
      return result
    } catch (err) {
      console.error('Failed to activate plugin:', err)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Deactivate a plugin
  const deactivate = async (pluginId) => {
    setLoading(true)
    try {
      const result = await deactivatePlugin(pluginId)
      if (result.success) {
        // Refresh the plugin list
        const installedPlugins = await getInstalledPlugins()
        setPlugins(installedPlugins)
        return { success: true }
      }
      return result
    } catch (err) {
      console.error('Failed to deactivate plugin:', err)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Delete a plugin
  const remove = async (pluginId) => {
    setLoading(true)
    try {
      const result = await deletePlugin(pluginId)
      if (result.success) {
        // Refresh the plugin list
        const installedPlugins = await getInstalledPlugins()
        setPlugins(installedPlugins)
        return { success: true }
      }
      return result
    } catch (err) {
      console.error('Failed to delete plugin:', err)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Run an action hook
  const runAction = async (hookName, ...args) => {
    if (!initialized) return
    return doAction(hookName, ...args)
  }

  // Apply filters
  const runFilter = async (filterName, value, ...args) => {
    if (!initialized) return value
    return applyFilters(filterName, value, ...args)
  }

  const value = {
    plugins,
    loading,
    initialized,
    install,
    activate,
    deactivate,
    remove,
    runAction,
    runFilter
  }

  return (
    <PluginContext.Provider value={value}>
      {children}
    </PluginContext.Provider>
  )
}
