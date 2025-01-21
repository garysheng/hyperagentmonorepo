(() => {
  // Configuration
  const WIDGET_URL = '/api/widget/bundle.js';
  const STYLES_URL = '/api/widget/styles.css';
  
  // Get configuration from script tag
  const currentScript = document.currentScript as HTMLScriptElement;
  const celebrityId = currentScript.getAttribute('data-celebrity-id');
  const primaryColor = currentScript.getAttribute('data-primary-color');
  
  // Create isolated container
  const container = document.createElement('div');
  container.id = 'hyperagent-chat-widget';
  container.style.cssText = 'position: fixed; z-index: 9999; bottom: 20px; right: 0;';
  document.body.appendChild(container);
  
  // Create shadow DOM for style isolation
  const shadow = container.attachShadow({ mode: 'closed' });
  
  // Add loading state
  const loadingDiv = document.createElement('div');
  loadingDiv.innerHTML = 'Loading chat...';
  loadingDiv.className = 'loading';
  shadow.appendChild(loadingDiv);
  
  // Load styles
  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = STYLES_URL;
  shadow.appendChild(styleLink);
  
  // Set CSS variables and base styles
  const style = document.createElement('style');
  style.textContent = `
    :host {
      --primary-color: ${primaryColor || '#0F172A'};
      display: block;
      width: auto;
      height: auto;
      margin: 0;
      padding: 0;
    }
  `;
  shadow.appendChild(style);
  
  // Load main bundle in the main document
  const script = document.createElement('script');
  script.src = WIDGET_URL;
  script.onload = () => {
    // Initialize widget with config
    (window).HyperAgentWidget.init({
      container: shadow,
      celebrityId: celebrityId || '',
      theme: {
        primaryColor: primaryColor || '#0F172A'
      } 
    });
  };
  document.body.appendChild(script);
})(); 
