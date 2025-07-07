# xBesh CMS Plugin Development Guide

This guide explains how to develop plugins for xBesh CMS. Plugins allow you to extend the functionality of the CMS with custom features.

## Plugin Structure

A basic plugin consists of:

1. A main JavaScript file
2. Optional additional files (CSS, images, etc.)
3. A plugin manifest (metadata)

## Creating a Plugin

### 1. Plugin Manifest

Your plugin needs to provide metadata when installed:

```json
{
  "name": "My Plugin",
  "slug": "my-plugin",
  "description": "A description of what my plugin does",
  "version": "1.0.0",
  "author": "Your Name",
  "authorUrl": "https://example.com",
  "mainFile": "index.js"
}
```

### 2. Main JavaScript File

The main file is where your plugin code lives. It should be wrapped in an IIFE (Immediately Invoked Function Expression) that receives the xBesh CMS API:

```javascript
(function(xBeshCMS) {
  // Plugin code here
  
  // Initialize the plugin
  function init() {
    console.log('My plugin initialized!');
    
    // Register hooks
    xBeshCMS.addAction('dashboard_init', myDashboardFunction);
    xBeshCMS.addFilter('post_content', myContentFilter);
  }
  
  // Your plugin functions
  function myDashboardFunction() {
    // Add something to the dashboard
  }
  
  function myContentFilter(content) {
    // Modify content
    return content;
  }
  
  // Initialize the plugin
  init();
})(xBeshCMS);
```

## Plugin API

### Hooks

Hooks allow your plugin to execute code at specific points in the CMS:

```javascript
// Add an action hook
xBeshCMS.addAction('hook_name', callbackFunction, priority);

// Add a filter
xBeshCMS.addFilter('filter_name', filterFunction, priority);
```

### Available Hooks

#### Actions

- `dashboard_init`: Fired when the dashboard is initialized
- `post_editor_init`: Fired when the post editor is initialized
- `page_editor_init`: Fired when the page editor is initialized
- `media_library_init`: Fired when the media library is initialized
- `plugin_activated`: Fired when a plugin is activated
- `plugin_deactivated`: Fired when a plugin is deactivated

#### Filters

- `post_content`: Filter post content before saving
- `page_content`: Filter page content before saving
- `post_title`: Filter post title
- `page_title`: Filter page title
- `media_url`: Filter media URLs

### Components

You can register React components to be used in the CMS:

```javascript
// Register a component
xBeshCMS.registerComponent('MyComponent', MyComponent);

// Create a React component
function MyComponent() {
  return {
    render: function() {
      return xBeshCMS.React.createElement(
        'div',
        { className: 'my-component' },
        'Hello from my component!'
      );
    }
  };
}
```

## Settings

Plugins can have settings that users can configure:

```javascript
// Get plugin settings
const settings = await xBeshCMS.getPluginSettings();

// Update plugin settings
await xBeshCMS.updatePluginSettings({
  mySetting: 'value'
});
```

## Security Considerations

- Plugins run in the browser context and have access to the user's session
- Avoid storing sensitive information in plugin settings
- Be careful when making API calls to external services
- Validate and sanitize all user input

## Example Plugins

Check out the example plugins in the `src/examples` directory:

- `hello-world-plugin.js`: A simple plugin that adds a widget to the dashboard
- `seo-analyzer-plugin.js`: A more complex plugin that analyzes content for SEO

## Packaging Your Plugin

To package your plugin for distribution:

1. Create a ZIP file containing all your plugin files
2. Include a `manifest.json` file with your plugin metadata
3. Make sure your main file is at the root of the ZIP

## Installing Plugins

Users can install your plugin by:

1. Going to the Plugins page in the CMS
2. Clicking "Add New Plugin"
3. Uploading the plugin ZIP file
4. Activating the plugin

## Best Practices

- Keep your plugin focused on a specific functionality
- Follow JavaScript best practices
- Document your code
- Test your plugin thoroughly
- Provide clear installation and usage instructions
- Version your plugin properly (semver)
- Handle errors gracefully
