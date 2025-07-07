/**
 * Hello World Plugin for xBesh CMS
 * 
 * This is a simple example plugin that demonstrates the plugin API.
 * It adds a widget to the dashboard and modifies the post editor.
 */

(function(xBeshCMS) {
  // Plugin information
  const pluginInfo = {
    name: 'Hello World',
    version: '1.0.0',
    description: 'A simple example plugin for xBesh CMS'
  };
  
  // Initialize the plugin
  function init() {
    console.log('Hello World Plugin initialized!');
    
    // Register hooks
    xBeshCMS.addAction('dashboard_init', addDashboardWidget);
    xBeshCMS.addFilter('post_content', modifyPostContent);
    
    // Register components
    xBeshCMS.registerComponent('HelloWorldWidget', HelloWorldWidget);
  }
  
  // Add a widget to the dashboard
  function addDashboardWidget() {
    const widgetContainer = document.getElementById('plugin-dashboard-widgets');
    if (!widgetContainer) return;
    
    const widget = document.createElement('div');
    widget.className = 'bg-white dark:bg-gray-800 shadow sm:rounded-lg';
    widget.innerHTML = `
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Hello from Plugin!
        </h3>
        <div class="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
          <p>This widget was added by the Hello World plugin.</p>
        </div>
        <div class="mt-3 text-sm">
          <button id="hello-world-btn" class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
            Click me!
          </button>
        </div>
      </div>
    `;
    
    widgetContainer.appendChild(widget);
    
    // Add event listener
    document.getElementById('hello-world-btn')?.addEventListener('click', () => {
      alert('Hello from the plugin!');
    });
  }
  
  // Modify post content
  function modifyPostContent(content) {
    // This is just an example - in a real plugin, you might add
    // formatting, validation, or other transformations
    return content + '\n\n<!-- Modified by Hello World Plugin -->';
  }
  
  // A React component (if using React)
  function HelloWorldWidget() {
    return {
      render: function() {
        return xBeshCMS.React.createElement(
          'div',
          { className: 'p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md' },
          xBeshCMS.React.createElement(
            'h3',
            { className: 'font-medium text-blue-800 dark:text-blue-300' },
            'Hello from React Component!'
          ),
          xBeshCMS.React.createElement(
            'p',
            { className: 'text-sm text-blue-600 dark:text-blue-400' },
            'This component was registered by the Hello World plugin.'
          )
        );
      }
    };
  }
  
  // Initialize the plugin
  init();
})(xBeshCMS);
