// Temporary minimal bundle for testing
window.HyperAgentWidget = {
  init: function(config) {
    const { container, celebrityId, theme } = config;
    
    // Set theme color as CSS variable
    if (theme.primaryColor) {
      container.style.setProperty('--primary-color', theme.primaryColor);
    }
    
    // Add position class if needed
    if (theme.position === 'bottom-left') {
      document.body.classList.add('position-bottom-left');
    }
    
    // Remove loading state
    container.innerHTML = '';
    
    // Create chat button
    const button = document.createElement('button');
    button.className = 'chat-button';
    button.innerHTML = '💬';
    button.onclick = () => this.toggleChat();
    container.appendChild(button);
    
    // Create chat window (hidden initially)
    const chatWindow = document.createElement('div');
    chatWindow.className = 'chat-window';
    chatWindow.style.display = 'none';
    chatWindow.innerHTML = `
      <div style="padding: 20px;">
        <h3 style="margin: 0 0 10px;">Chat with HyperAgent</h3>
        <p style="margin: 0; opacity: 0.7;">Celebrity ID: ${celebrityId}</p>
      </div>
    `;
    container.appendChild(chatWindow);
  },
  
  toggleChat: function() {
    const chatWindow = document.querySelector('.chat-window');
    const isHidden = chatWindow.style.display === 'none';
    chatWindow.style.display = isHidden ? 'block' : 'none';
  }
}; 