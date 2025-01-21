(function() {
  // Configuration
  const WIDGET_URL = '/api/widget/bundle.js';
  const STYLES_URL = '/api/widget/styles.css';
  
  // Get configuration from script tag
  const currentScript = document.currentScript;
  const celebrityId = currentScript.getAttribute('data-celebrity-id');
  
  // Create isolated container
  const container = document.createElement('div');
  container.id = 'hyperagent-chat-widget';
  document.body.appendChild(container);
  
  // Create shadow DOM for style isolation
  const shadow = container.attachShadow({ mode: 'closed' });
  
  // Add loading state
  const loadingDiv = document.createElement('div');
  loadingDiv.innerHTML = 'Loading chat...';
  shadow.appendChild(loadingDiv);
  
  // Load styles
  const styles = document.createElement('link');
  styles.rel = 'stylesheet';
  styles.href = STYLES_URL;
  shadow.appendChild(styles);
  
  // Load main bundle
  const script = document.createElement('script');
  script.src = WIDGET_URL;
  script.onload = () => {
    // Initialize widget with config
    window.HyperAgentWidget.init({
      container: shadow,
      celebrityId,
      theme: {
        primaryColor: currentScript.getAttribute('data-primary-color'),
        position: currentScript.getAttribute('data-position') || 'bottom-right'
      }
    });
  };
  shadow.appendChild(script);
})(); 