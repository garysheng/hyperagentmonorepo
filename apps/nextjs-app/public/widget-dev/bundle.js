(() => {
  class HyperAgentWidget {
    constructor() {
      this.isOpen = false;
      console.log('[Dev Widget] Widget class instantiated');
    }

    init(config) {
      console.log('[Dev Widget] Initializing with config:', config);
      const { container, celebrityId, theme } = config;
      
      // Create widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'hyperagent-widget';
      
      // Create chat bubble
      const bubble = document.createElement('div');
      bubble.className = 'hyperagent-bubble';
      bubble.style.cssText = `
        position: fixed;
        bottom: 20px;
        ${theme.position === 'bottom-left' ? 'left' : 'right'}: 20px;
        background: ${theme.primaryColor};
        color: white;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: transform 0.2s ease;
      `;
      
      // Create chat icon
      bubble.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
      `;

      // Create chat window
      const chatWindow = document.createElement('div');
      chatWindow.className = 'hyperagent-chat-window';
      chatWindow.style.cssText = `
        position: fixed;
        bottom: 100px;
        ${theme.position === 'bottom-left' ? 'left' : 'right'}: 20px;
        width: 380px;
        height: 600px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: none;
        flex-direction: column;
        overflow: hidden;
      `;

      // Create chat header
      chatWindow.innerHTML = `
        <div style="
          padding: 20px;
          background: ${theme.primaryColor};
          color: white;
        ">
          <h3 style="margin: 0; font-size: 18px;">Contact Us</h3>
          <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.8;">We'll get back to you as soon as possible.</p>
        </div>
        <div style="
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #f9fafb;
        ">
          <div style="
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          ">
            <p style="margin: 0; color: #374151;">👋 Hi there! How can we help you today?</p>
          </div>
        </div>
        <div style="
          padding: 20px;
          border-top: 1px solid #e5e7eb;
          background: white;
        ">
          <textarea placeholder="Type your message here..." style="
            width: 100%;
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            resize: none;
            font-family: inherit;
            font-size: 14px;
            line-height: 1.5;
            height: 100px;
          "></textarea>
          <button style="
            margin-top: 10px;
            padding: 8px 16px;
            background: ${theme.primaryColor};
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            float: right;
          ">Send Message</button>
        </div>
      `;

      // Add click handler for bubble
      bubble.addEventListener('click', () => {
        this.isOpen = !this.isOpen;
        chatWindow.style.display = this.isOpen ? 'flex' : 'none';
        bubble.style.transform = this.isOpen ? 'scale(0.9)' : 'scale(1)';
        console.log('[Dev Widget] Chat window toggled:', this.isOpen);
      });

      // Add click handler for send button
      const sendButton = chatWindow.querySelector('button');
      const textarea = chatWindow.querySelector('textarea');
      sendButton.addEventListener('click', () => {
        const message = textarea.value.trim();
        if (message) {
          console.log('[Dev Widget] Message sent:', { message, celebrityId });
          // Add your message sending logic here
          textarea.value = '';
          
          // Show confirmation message
          const messagesContainer = chatWindow.querySelector('div[style*="overflow-y: auto"]');
          const messageElement = document.createElement('div');
          messageElement.style.cssText = `
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            margin-top: 10px;
          `;
          messageElement.innerHTML = `
            <p style="margin: 0 0 10px; color: #374151;">${message}</p>
            <p style="margin: 0; color: #6B7280; font-size: 12px;">Message sent ✓</p>
          `;
          messagesContainer.appendChild(messageElement);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      });

      // Add everything to the container
      container.appendChild(bubble);
      container.appendChild(chatWindow);
      console.log('[Dev Widget] Widget mounted to DOM');
    }

    destroy() {
      console.log('[Dev Widget] Widget destroyed');
    }
  }

  // Expose to global scope
  window.HyperAgentWidget = new HyperAgentWidget();
})(); 