(() => {
  class HyperAgentWidget {
    init(config) {
      const { container, celebrityId, theme } = config;
      
      // Create widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'hyperagent-widget';
      widgetContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        ${theme.position === 'bottom-left' ? 'left' : 'right'}: 20px;
        background: ${theme.primaryColor};
        color: white;
        padding: 20px;
        border-radius: 8px;
        font-family: system-ui, -apple-system, sans-serif;
      `;
      
      // Add content
      widgetContainer.innerHTML = `
        <div style="text-align: center;">
          <h3 style="margin: 0 0 10px;">Contact Us</h3>
          <p style="margin: 0;">Click to start a conversation</p>
        </div>
      `;
      
      // Add click handler
      widgetContainer.addEventListener('click', () => {
        console.log('Widget clicked:', { celebrityId });
        // Add your chat functionality here
      });
      
      container.appendChild(widgetContainer);
    }

    destroy() {
      // Cleanup code here
    }
  }

  // Expose to global scope
  window.HyperAgentWidget = new HyperAgentWidget();
})(); 