(() => {
  // Configuration
  const WIDGET_URL = '/widget/bundle.js';
  const STYLES_URL = '/widget/styles.css';
  
  // Get configuration from script tag
  const currentScript = document.currentScript as HTMLScriptElement;
  const celebrityId = currentScript.getAttribute('data-celebrity-id');
  const primaryColor = currentScript.getAttribute('data-primary-color');
  
  console.log('Widget initialization:', {
    celebrityId,
    primaryColor,
    scriptAttributes: {
      'data-celebrity-id': currentScript.getAttribute('data-celebrity-id'),
      'data-primary-color': currentScript.getAttribute('data-primary-color')
    }
  });

  if (!celebrityId) {
    console.error('Widget Error: Missing data-celebrity-id attribute');
    return;
  }
  
  // Create isolated container
  const container = document.createElement('div');
  container.id = 'hyperagent-chat-widget';
  container.style.cssText = 'position: fixed; z-index: 9999; bottom: 20px; right: 20px;';
  document.body.appendChild(container);
  
  // Create shadow DOM for style isolation
  const shadow = container.attachShadow({ mode: 'closed' });
  
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
        primaryColor: primaryColor || '#0F172A'
      }
    });
  };
  shadow.appendChild(script);
})(); 
