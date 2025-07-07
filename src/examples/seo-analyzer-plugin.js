/**
 * SEO Analyzer Plugin for xBesh CMS
 * 
 * This plugin analyzes content for SEO best practices and provides
 * recommendations to improve search engine visibility.
 */

(function(xBeshCMS) {
  // Plugin information
  const pluginInfo = {
    name: 'SEO Analyzer',
    version: '1.0.0',
    description: 'Analyzes content for SEO best practices'
  };
  
  // Plugin settings with defaults
  let settings = {
    minContentLength: 300,
    keywordDensityTarget: 2.0, // percentage
    maxTitleLength: 60,
    maxMetaDescLength: 160
  };
  
  // Initialize the plugin
  function init() {
    console.log('SEO Analyzer Plugin initialized!');
    
    // Register hooks
    xBeshCMS.addAction('post_editor_init', addSeoPanel);
    xBeshCMS.addAction('page_editor_init', addSeoPanel);
    xBeshCMS.addFilter('post_save', analyzeSeo);
    xBeshCMS.addFilter('page_save', analyzeSeo);
    
    // Load settings
    loadSettings();
  }
  
  // Load plugin settings
  async function loadSettings() {
    try {
      const savedSettings = await xBeshCMS.getPluginSettings();
      if (savedSettings) {
        settings = { ...settings, ...savedSettings };
      }
    } catch (err) {
      console.error('Failed to load SEO Analyzer settings:', err);
    }
  }
  
  // Add SEO analysis panel to editor
  function addSeoPanel(editor) {
    // Create SEO panel container
    const seoPanel = document.createElement('div');
    seoPanel.id = 'seo-analyzer-panel';
    seoPanel.className = 'mt-6 bg-white dark:bg-gray-800 shadow sm:rounded-lg';
    seoPanel.innerHTML = `
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          SEO Analysis
        </h3>
        <div class="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
          <p>Enter a focus keyword to analyze your content for SEO.</p>
        </div>
        <div class="mt-3">
          <div class="flex rounded-md shadow-sm">
            <input type="text" id="seo-keyword" class="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white" placeholder="Focus keyword">
            <button type="button" id="seo-analyze-btn" class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Analyze
            </button>
          </div>
        </div>
        <div id="seo-results" class="mt-4 hidden">
          <div class="rounded-md bg-gray-50 dark:bg-gray-900 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg id="seo-score-icon" class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 id="seo-score-title" class="text-sm font-medium text-yellow-800 dark:text-yellow-300">SEO Score: Analyzing...</h3>
                <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                  <ul id="seo-recommendations" role="list" class="list-disc pl-5 space-y-1"></ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add the panel to the editor
    const editorContainer = document.querySelector('.tox-tinymce');
    if (editorContainer) {
      editorContainer.parentNode.insertBefore(seoPanel, editorContainer.nextSibling);
      
      // Add event listener for analyze button
      document.getElementById('seo-analyze-btn')?.addEventListener('click', () => {
        const keyword = document.getElementById('seo-keyword').value;
        const content = editor.getContent();
        const title = document.getElementById('title')?.value || '';
        const metaDescription = document.getElementById('meta_description')?.value || '';
        
        const analysis = analyzeContent(content, keyword, title, metaDescription);
        displayResults(analysis);
      });
    }
  }
  
  // Analyze content for SEO
  function analyzeContent(content, keyword, title, metaDescription) {
    // Strip HTML tags for text analysis
    const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(/\s+/).length;
    
    // Calculate keyword density
    const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const keywordMatches = textContent.match(keywordRegex) || [];
    const keywordDensity = (keywordMatches.length / wordCount) * 100;
    
    // Check for keyword in title
    const keywordInTitle = title.toLowerCase().includes(keyword.toLowerCase());
    
    // Check for keyword in meta description
    const keywordInMetaDesc = metaDescription.toLowerCase().includes(keyword.toLowerCase());
    
    // Check for keyword in first paragraph
    const firstParagraph = content.split('</p>')[0].replace(/<[^>]*>/g, '');
    const keywordInFirstPara = firstParagraph.toLowerCase().includes(keyword.toLowerCase());
    
    // Check heading structure
    const hasH1 = content.includes('<h1');
    const hasH2 = content.includes('<h2');
    
    // Calculate overall score (0-100)
    let score = 0;
    
    // Content length (0-20 points)
    if (wordCount >= settings.minContentLength) {
      score += 20;
    } else {
      score += Math.floor((wordCount / settings.minContentLength) * 20);
    }
    
    // Keyword density (0-20 points)
    if (keywordDensity >= 1 && keywordDensity <= 3) {
      score += 20;
    } else if (keywordDensity > 0 && keywordDensity < 1) {
      score += 10;
    } else if (keywordDensity > 3 && keywordDensity < 5) {
      score += 10;
    }
    
    // Keyword in title (0-15 points)
    if (keywordInTitle) score += 15;
    
    // Keyword in meta description (0-15 points)
    if (keywordInMetaDesc) score += 15;
    
    // Keyword in first paragraph (0-10 points)
    if (keywordInFirstPara) score += 10;
    
    // Heading structure (0-20 points)
    if (hasH1) score += 10;
    if (hasH2) score += 10;
    
    // Generate recommendations
    const recommendations = [];
    
    if (wordCount < settings.minContentLength) {
      recommendations.push(`Content is too short. Add more content (currently ${wordCount} words, recommended at least ${settings.minContentLength}).`);
    }
    
    if (keywordDensity < 1) {
      recommendations.push('Keyword density is too low. Use your focus keyword more often.');
    } else if (keywordDensity > 3) {
      recommendations.push('Keyword density is too high. This might be seen as keyword stuffing.');
    }
    
    if (!keywordInTitle) {
      recommendations.push('Add your focus keyword to the title.');
    }
    
    if (!keywordInMetaDesc) {
      recommendations.push('Add your focus keyword to the meta description.');
    }
    
    if (!keywordInFirstPara) {
      recommendations.push('Add your focus keyword to the first paragraph.');
    }
    
    if (!hasH1) {
      recommendations.push('Add an H1 heading to your content.');
    }
    
    if (!hasH2) {
      recommendations.push('Add H2 headings to structure your content.');
    }
    
    if (title.length > settings.maxTitleLength) {
      recommendations.push(`Title is too long (${title.length} characters). Keep it under ${settings.maxTitleLength} characters.`);
    }
    
    if (metaDescription.length > settings.maxMetaDescLength) {
      recommendations.push(`Meta description is too long (${metaDescription.length} characters). Keep it under ${settings.maxMetaDescLength} characters.`);
    }
    
    return {
      score,
      wordCount,
      keywordDensity,
      keywordInTitle,
      keywordInMetaDesc,
      keywordInFirstPara,
      hasH1,
      hasH2,
      recommendations
    };
  }
  
  // Display analysis results
  function displayResults(analysis) {
    const resultsContainer = document.getElementById('seo-results');
    const scoreTitle = document.getElementById('seo-score-title');
    const recommendationsList = document.getElementById('seo-recommendations');
    const scoreIcon = document.getElementById('seo-score-icon');
    
    if (!resultsContainer || !scoreTitle || !recommendationsList || !scoreIcon) return;
    
    // Show results container
    resultsContainer.classList.remove('hidden');
    
    // Update score
    let scoreText = '';
    let scoreColor = '';
    
    if (analysis.score >= 80) {
      scoreText = 'Good';
      scoreColor = 'green';
    } else if (analysis.score >= 50) {
      scoreText = 'Needs Improvement';
      scoreColor = 'yellow';
    } else {
      scoreText = 'Poor';
      scoreColor = 'red';
    }
    
    scoreTitle.textContent = `SEO Score: ${analysis.score}/100 (${scoreText})`;
    
    // Update icon color
    scoreIcon.classList.remove('text-yellow-400', 'text-green-400', 'text-red-400');
    scoreIcon.classList.add(`text-${scoreColor}-400`);
    
    // Update recommendations
    recommendationsList.innerHTML = '';
    if (analysis.recommendations.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Great job! No recommendations at this time.';
      recommendationsList.appendChild(li);
    } else {
      analysis.recommendations.forEach(recommendation => {
        const li = document.createElement('li');
        li.textContent = recommendation;
        recommendationsList.appendChild(li);
      });
    }
  }
  
  // Analyze SEO before saving
  function analyzeSeo(data) {
    // This is just a pass-through filter that could be used to
    // validate or modify content before saving
    return data;
  }
  
  // Initialize the plugin
  init();
})(xBeshCMS);
