(() => {
  // Get the script's source URL to determine the base URL for assets
  const currentScript = document.currentScript as HTMLScriptElement;
  const scriptSrc = currentScript?.src || '';
  const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
  const assetsBaseUrl = baseUrl.replace('/widget', '');

  // Configuration with absolute URLs
  const WIDGET_URL = `${assetsBaseUrl}/widget/bundle.js`;
  const STYLES_URL = `${assetsBaseUrl}/widget/styles.css`;
  
  // Get configuration from script tag
  const celebrityId = currentScript.getAttribute('data-celebrity-id');
  const primaryColor = currentScript.getAttribute('data-primary-color');
  const position = currentScript.getAttribute('data-position') as 'bottom-right' | 'bottom-left';
  
  console.log('HyperAgent Widget initialization:', {
    celebrityId,
    primaryColor,
    position,
    urls: {
      widget: WIDGET_URL,
      styles: STYLES_URL
    }
  });

  if (!celebrityId) {
    console.error('HyperAgent Widget Error: Missing required data-celebrity-id attribute');
    return;
  }
  
  // Create isolated container with position based on config
  const container = document.createElement('div');
  container.id = 'hyperagent-chat-widget';
  container.style.cssText = `
    position: fixed;
    z-index: 9999;
    bottom: 20px;
    ${position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
  `;
  document.body.appendChild(container);
  
  // Create shadow DOM for style isolation
  const shadow = container.attachShadow({ mode: 'closed' });
  
  // Load styles
  const styles = document.createElement('link');
  styles.rel = 'stylesheet';
  styles.href = STYLES_URL;
  shadow.appendChild(styles);
  
  // Error handling function
  const handleError = (error: Error) => {
    console.error('HyperAgent Widget Error:', error);
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'color: red; padding: 10px; border: 1px solid red; border-radius: 4px;';
    errorDiv.textContent = 'Failed to load HyperAgent chat widget. Please check the console for details.';
    shadow.appendChild(errorDiv);
  };
  
  // Load main bundle
  const script = document.createElement('script');
  script.src = WIDGET_URL;
  script.onload = () => {
    try {
      // Initialize widget with config
      window.HyperAgentWidget.init({
        container: shadow,
        celebrityId,
        theme: {
          primaryColor: primaryColor || '#0F172A',
          position: position || 'bottom-right'
        }
      });
    } catch (error) {
      handleError(error as Error);
    }
  };
  script.onerror = () => handleError(new Error('Failed to load widget script'));
  shadow.appendChild(script);
})(); 
