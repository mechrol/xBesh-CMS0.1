/**
 * xBesh CMS Plugin System
 * 
 * This module provides a WordPress-like plugin architecture for xBesh CMS,
 * allowing for extensibility through hooks, filters, and plugin installation.
 */

import { supabase } from './supabase'

// Store for registered hooks and filters
const hooks = {}
const filters = {}
const registeredPlugins = {}
const pluginComponents = {}

/**
 * Initialize the plugin system
 */
export async function initializePluginSystem() {
  try {
    // Load all active plugins from the database
    const { data: plugins, error } = await supabase
      .from('plugins')
      .select('*')
      .eq('status', 'active')
    
    if (error) throw error
    
    // Load and initialize each plugin
    for (const plugin of plugins || []) {
      await loadPlugin(plugin)
    }
    
    console.log(`Initialized ${plugins?.length || 0} plugins`)
    return plugins || []
  } catch (err) {
    console.error('Failed to initialize plugin system:', err)
    return []
  }
}

/**
 * Load and initialize a single plugin
 */
async function loadPlugin(plugin) {
  try {
    // In a real implementation, this would dynamically import the plugin code
    // For security, we're using a controlled approach with registered callbacks
    
    // Register the plugin in our system
    registeredPlugins[plugin.slug] = {
      ...plugin,
      instance: null
    }
    
    // Load plugin hooks from database
    const { data: pluginHooks, error } = await supabase
      .from('plugin_hooks')
      .select('*')
      .eq('plugin_id', plugin.id)
    
    if (error) throw error
    
    // Register hooks for this plugin
    for (const hookData of pluginHooks || []) {
      if (hookData.hook_name.startsWith('filter:')) {
        // This is a filter
        const filterName = hookData.hook_name.replace('filter:', '')
        addFilter(filterName, plugin.slug, hookData.callback_name, hookData.priority)
      } else {
        // This is an action hook
        addAction(hookData.hook_name, plugin.slug, hookData.callback_name, hookData.priority)
      }
    }
    
    console.log(`Loaded plugin: ${plugin.name}`)
    return true
  } catch (err) {
    console.error(`Failed to load plugin ${plugin.name}:`, err)
    
    // Update plugin status to error
    await supabase
      .from('plugins')
      .update({ status: 'error' })
      .eq('id', plugin.id)
    
    return false
  }
}

/**
 * Register a component from a plugin
 */
export function registerPluginComponent(pluginSlug, componentName, component) {
  if (!pluginComponents[pluginSlug]) {
    pluginComponents[pluginSlug] = {}
  }
  pluginComponents[pluginSlug][componentName] = component
}

/**
 * Get a registered plugin component
 */
export function getPluginComponent(pluginSlug, componentName) {
  return pluginComponents[pluginSlug]?.[componentName] || null
}

/**
 * Add an action hook
 */
export function addAction(hookName, pluginSlug, callback, priority = 10) {
  if (!hooks[hookName]) {
    hooks[hookName] = []
  }
  
  hooks[hookName].push({
    pluginSlug,
    callback,
    priority
  })
  
  // Sort by priority
  hooks[hookName].sort((a, b) => a.priority - b.priority)
}

/**
 * Run all registered callbacks for a given action hook
 */
export async function doAction(hookName, ...args) {
  if (!hooks[hookName]) return
  
  for (const hook of hooks[hookName]) {
    try {
      // Get the actual callback function from the plugin
      const callbackFn = getPluginCallback(hook.pluginSlug, hook.callback)
      if (callbackFn) {
        await callbackFn(...args)
      }
    } catch (err) {
      console.error(`Error in plugin ${hook.pluginSlug} for hook ${hookName}:`, err)
    }
  }
}

/**
 * Add a filter
 */
export function addFilter(filterName, pluginSlug, callback, priority = 10) {
  if (!filters[filterName]) {
    filters[filterName] = []
  }
  
  filters[filterName].push({
    pluginSlug,
    callback,
    priority
  })
  
  // Sort by priority
  filters[filterName].sort((a, b) => a.priority - b.priority)
}

/**
 * Apply all registered filters to a value
 */
export async function applyFilters(filterName, value, ...args) {
  if (!filters[filterName]) return value
  
  let result = value
  
  for (const filter of filters[filterName]) {
    try {
      // Get the actual callback function from the plugin
      const callbackFn = getPluginCallback(filter.pluginSlug, filter.callback)
      if (callbackFn) {
        result = await callbackFn(result, ...args)
      }
    } catch (err) {
      console.error(`Error in plugin ${filter.pluginSlug} for filter ${filterName}:`, err)
    }
  }
  
  return result
}

/**
 * Get a callback function from a plugin
 */
function getPluginCallback(pluginSlug, callbackName) {
  const plugin = registeredPlugins[pluginSlug]
  if (!plugin || !plugin.instance) return null
  
  return plugin.instance[callbackName]
}

/**
 * Install a plugin from a plugin package
 */
export async function installPlugin(pluginPackage) {
  try {
    // Validate plugin package
    if (!validatePluginPackage(pluginPackage)) {
      throw new Error('Invalid plugin package')
    }
    
    // Check if plugin already exists
    const { data: existingPlugin, error: checkError } = await supabase
      .from('plugins')
      .select('id, version')
      .eq('slug', pluginPackage.slug)
      .maybeSingle()
    
    if (checkError) throw checkError
    
    let pluginId
    
    if (existingPlugin) {
      // Update existing plugin
      const { error: updateError } = await supabase
        .from('plugins')
        .update({
          name: pluginPackage.name,
          description: pluginPackage.description,
          version: pluginPackage.version,
          author: pluginPackage.author,
          author_url: pluginPackage.authorUrl,
          homepage_url: pluginPackage.homepageUrl,
          main_file: pluginPackage.mainFile,
          icon: pluginPackage.icon,
          updated_at: new Date()
        })
        .eq('id', existingPlugin.id)
      
      if (updateError) throw updateError
      pluginId = existingPlugin.id
      
      // Remove existing hooks for this plugin
      await supabase
        .from('plugin_hooks')
        .delete()
        .eq('plugin_id', pluginId)
    } else {
      // Insert new plugin
      const { data: newPlugin, error: insertError } = await supabase
        .from('plugins')
        .insert({
          name: pluginPackage.name,
          slug: pluginPackage.slug,
          description: pluginPackage.description,
          version: pluginPackage.version,
          author: pluginPackage.author,
          author_url: pluginPackage.authorUrl,
          homepage_url: pluginPackage.homepageUrl,
          main_file: pluginPackage.mainFile,
          icon: pluginPackage.icon,
          status: 'inactive'
        })
        .select()
        .single()
      
      if (insertError) throw insertError
      pluginId = newPlugin.id
    }
    
    // Register plugin hooks
    if (pluginPackage.hooks && pluginPackage.hooks.length > 0) {
      const hooksToInsert = pluginPackage.hooks.map(hook => ({
        plugin_id: pluginId,
        hook_name: hook.name,
        priority: hook.priority || 10,
        callback_name: hook.callback
      }))
      
      const { error: hooksError } = await supabase
        .from('plugin_hooks')
        .insert(hooksToInsert)
      
      if (hooksError) throw hooksError
    }
    
    // Store plugin code in localStorage (in a real implementation, this would be more secure)
    localStorage.setItem(`plugin_${pluginPackage.slug}`, pluginPackage.code)
    
    return { success: true, pluginId }
  } catch (err) {
    console.error('Failed to install plugin:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Validate a plugin package
 */
function validatePluginPackage(pluginPackage) {
  // Required fields
  const requiredFields = ['name', 'slug', 'version', 'mainFile', 'code']
  for (const field of requiredFields) {
    if (!pluginPackage[field]) {
      console.error(`Missing required field: ${field}`)
      return false
    }
  }
  
  // Validate slug format (lowercase, alphanumeric, dashes)
  if (!/^[a-z0-9-]+$/.test(pluginPackage.slug)) {
    console.error('Invalid slug format')
    return false
  }
  
  // Basic code validation (this would be more robust in production)
  try {
    // Check if code is valid JavaScript
    new Function(pluginPackage.code)
    return true
  } catch (err) {
    console.error('Invalid plugin code:', err)
    return false
  }
}

/**
 * Activate a plugin
 */
export async function activatePlugin(pluginId) {
  try {
    const { data: plugin, error } = await supabase
      .from('plugins')
      .update({ status: 'active' })
      .eq('id', pluginId)
      .select()
      .single()
    
    if (error) throw error
    
    // Load the plugin
    await loadPlugin(plugin)
    
    return { success: true }
  } catch (err) {
    console.error('Failed to activate plugin:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Deactivate a plugin
 */
export async function deactivatePlugin(pluginId) {
  try {
    const { data: plugin, error } = await supabase
      .from('plugins')
      .update({ status: 'inactive' })
      .eq('id', pluginId)
      .select()
      .single()
    
    if (error) throw error
    
    // Remove plugin from registered plugins
    if (plugin && registeredPlugins[plugin.slug]) {
      delete registeredPlugins[plugin.slug]
      
      // Remove plugin hooks
      for (const hookName in hooks) {
        hooks[hookName] = hooks[hookName].filter(hook => hook.pluginSlug !== plugin.slug)
      }
      
      // Remove plugin filters
      for (const filterName in filters) {
        filters[filterName] = filters[filterName].filter(filter => filter.pluginSlug !== plugin.slug)
      }
    }
    
    return { success: true }
  } catch (err) {
    console.error('Failed to deactivate plugin:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Delete a plugin
 */
export async function deletePlugin(pluginId) {
  try {
    // Get plugin info first
    const { data: plugin, error: fetchError } = await supabase
      .from('plugins')
      .select('slug')
      .eq('id', pluginId)
      .single()
    
    if (fetchError) throw fetchError
    
    // Delete from database
    const { error } = await supabase
      .from('plugins')
      .delete()
      .eq('id', pluginId)
    
    if (error) throw error
    
    // Remove from localStorage
    if (plugin) {
      localStorage.removeItem(`plugin_${plugin.slug}`)
      
      // Remove from registered plugins if active
      if (registeredPlugins[plugin.slug]) {
        delete registeredPlugins[plugin.slug]
        
        // Remove plugin hooks
        for (const hookName in hooks) {
          hooks[hookName] = hooks[hookName].filter(hook => hook.pluginSlug !== plugin.slug)
        }
        
        // Remove plugin filters
        for (const filterName in filters) {
          filters[filterName] = filters[filterName].filter(filter => filter.pluginSlug !== plugin.slug)
        }
      }
    }
    
    return { success: true }
  } catch (err) {
    console.error('Failed to delete plugin:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Get all installed plugins
 */
export async function getInstalledPlugins() {
  try {
    const { data: plugins, error } = await supabase
      .from('plugins')
      .select('*')
      .order('name')
    
    if (error) throw error
    
    return plugins || []
  } catch (err) {
    console.error('Failed to get installed plugins:', err)
    return []
  }
}

/**
 * Get plugin settings
 */
export async function getPluginSettings(pluginId) {
  try {
    const { data: plugin, error } = await supabase
      .from('plugins')
      .select('settings')
      .eq('id', pluginId)
      .single()
    
    if (error) throw error
    
    return plugin?.settings || {}
  } catch (err) {
    console.error('Failed to get plugin settings:', err)
    return {}
  }
}

/**
 * Update plugin settings
 */
export async function updatePluginSettings(pluginId, settings) {
  try {
    const { error } = await supabase
      .from('plugins')
      .update({ settings })
      .eq('id', pluginId)
    
    if (error) throw error
    
    return { success: true }
  } catch (err) {
    console.error('Failed to update plugin settings:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Create a plugin package from uploaded files
 * This is a simplified version - in production, this would involve
 * more robust validation and security checks
 */
export function createPluginPackageFromFiles(files, metadata) {
  return new Promise((resolve, reject) => {
    try {
      // Find the main JavaScript file
      const mainFile = files.find(file => file.name === metadata.mainFile)
      if (!mainFile) {
        return reject(new Error(`Main file ${metadata.mainFile} not found`))
      }
      
      // Read the main file
      const reader = new FileReader()
      reader.onload = (e) => {
        const code = e.target.result
        
        // Create the plugin package
        const pluginPackage = {
          name: metadata.name,
          slug: metadata.slug,
          description: metadata.description || '',
          version: metadata.version,
          author: metadata.author || '',
          authorUrl: metadata.authorUrl || '',
          homepageUrl: metadata.homepageUrl || '',
          mainFile: metadata.mainFile,
          icon: metadata.icon || '',
          code,
          hooks: metadata.hooks || []
        }
        
        resolve(pluginPackage)
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read plugin file'))
      }
      
      reader.readAsText(mainFile)
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Execute plugin code in a controlled environment
 * This is a simplified version - in production, this would use a more secure approach
 */
export function executePluginCode(pluginSlug, code, context) {
  try {
    // Create a sandbox for the plugin
    const sandbox = {
      // Provide access to the plugin API
      xBeshCMS: {
        registerComponent: (componentName, component) => {
          registerPluginComponent(pluginSlug, componentName, component)
        },
        addAction: (hookName, callback, priority) => {
          addAction(hookName, pluginSlug, callback, priority)
        },
        addFilter: (filterName, callback, priority) => {
          addFilter(filterName, pluginSlug, callback, priority)
        },
        // Add other safe APIs here
        ...context
      },
      // Add React and other safe libraries
      React: window.React
    }
    
    // Create the execution context
    const contextKeys = Object.keys(sandbox)
    const contextValues = Object.values(sandbox)
    
    // Execute the plugin code with the sandbox
    const executor = new Function(...contextKeys, code)
    executor(...contextValues)
    
    return true
  } catch (err) {
    console.error(`Error executing plugin ${pluginSlug}:`, err)
    return false
  }
}
