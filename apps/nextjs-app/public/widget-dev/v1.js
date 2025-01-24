class HyperAgentWidget {
  constructor() {
    this.isOpen = false;
    this.userEmail = null;
    this.celebrityId = null;
    this.goals = [];
    this.baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000' 
      : 'https://hyperagent.so';
    this.init();
  }

  init() {
    // Get celebrity ID from script tag
    const script = document.currentScript;
    this.celebrityId = script?.getAttribute('data-celebrity-id');

    if (!this.celebrityId) {
      console.error('Missing required data-celebrity-id attribute');
      return;
    }

    // Create and append styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/widget-dev/styles.css';
    document.head.appendChild(link);

    // Create chat bubble
    this.createChatBubble();
    
    // Create chat window (initially hidden)
    this.createChatWindow();
  }

  createChatBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'hyperagent-bubble';
    bubble.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const icon = document.createElement('div');
    icon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>`;
    
    bubble.appendChild(icon);
    bubble.addEventListener('click', () => this.toggleChat());
    document.body.appendChild(bubble);
    this.bubble = bubble;
  }

  createChatWindow() {
    const window = document.createElement('div');
    window.className = 'hyperagent-chat-window';
    window.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: 350px;
      height: 450px;
      background: #1e293b;
      border-radius: 12px;
      display: none;
      flex-direction: column;
      color: white;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    `;

    // Chat header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      font-weight: 600;
    `;
    header.textContent = 'Chat with HyperAgent';
    window.appendChild(header);

    // Messages area
    const messages = document.createElement('div');
    messages.style.cssText = `
      flex: 1;
      padding: 16px;
      overflow-y: auto;
    `;
    window.appendChild(messages);

    // Input area
    const inputArea = document.createElement('div');
    inputArea.style.cssText = `
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    `;

    // Start with email collection
    this.showEmailForm(inputArea, messages);

    window.appendChild(inputArea);
    document.body.appendChild(window);
    this.window = window;
    this.messagesEl = messages;
    this.inputArea = inputArea;
  }

  showEmailForm(inputArea, messages) {
    // Clear existing content
    inputArea.innerHTML = '';
    messages.innerHTML = `
      <div style="
        background: rgba(255, 255, 255, 0.05);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 12px;
      ">
        <p style="margin: 0; color: white;">👋 Hi there! Please enter your email to start the conversation.</p>
      </div>
    `;

    const form = document.createElement('form');
    form.style.cssText = `
      display: flex;
      gap: 8px;
    `;

    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'Enter your email';
    emailInput.required = true;
    emailInput.style.cssText = `
      flex: 1;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.05);
      color: white;
      font-family: inherit;
    `;

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Continue';
    submitButton.style.cssText = `
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      background: #3b82f6;
      color: white;
      font-weight: 500;
      cursor: pointer;
    `;

    form.appendChild(emailInput);
    form.appendChild(submitButton);
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (this.isValidEmail(email)) {
        this.userEmail = email;
        await this.showGoals();
      }
    });

    inputArea.appendChild(form);
  }

  async showGoals() {
    // Add loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.style.cssText = `
      background: rgba(255, 255, 255, 0.05);
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 12px;
    `;
    loadingMessage.textContent = 'Loading goals...';
    this.messagesEl.appendChild(loadingMessage);

    try {
      // Fetch goals from API
      const response = await fetch(`${this.baseUrl}/api/widget/goals?celebrityId=${this.celebrityId}`);
      if (!response.ok) throw new Error('Failed to fetch goals');
      
      const { goals } = await response.json();

      // Remove loading message
      loadingMessage.remove();

      // Add goals message
      const goalsMessage = document.createElement('div');
      goalsMessage.style.cssText = `
        background: rgba(255, 255, 255, 0.05);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 12px;
      `;

      if (!goals || goals.length === 0) {
        goalsMessage.innerHTML = `
          <p style="margin: 0; color: white;">We're currently working on defining our goals. In the meantime, please tell us how you think you can help!</p>
        `;
      } else {
        goalsMessage.innerHTML = `
          <p style="margin: 0 0 10px; color: white;">Here are our current goals:</p>
          <ul style="margin: 0; padding-left: 20px; color: white;">
            ${goals.map(goal => `
              <li style="margin-bottom: 10px;">
                <strong>${goal.title}</strong>
                ${goal.description ? `<br><span style="opacity: 0.8;">${goal.description}</span>` : ''}
              </li>
            `).join('')}
          </ul>
          <p style="margin: 10px 0 0; color: white;">If you can help us achieve these goals, please describe how in the chat below.</p>
        `;
      }

      this.messagesEl.appendChild(goalsMessage);

      // Show chat input
      this.showChatInput();
    } catch (error) {
      console.error('Error loading goals:', error);
      loadingMessage.textContent = 'Error loading goals. Please try again.';
    }
  }

  showChatInput() {
    this.inputArea.innerHTML = '';
    
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Describe how you can help...';
    textarea.style.cssText = `
      width: 100%;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.05);
      color: white;
      resize: none;
      height: 80px;
      font-family: inherit;
      margin-bottom: 8px;
    `;

    const sendButton = document.createElement('button');
    sendButton.textContent = 'Send Message';
    sendButton.style.cssText = `
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      background: #3b82f6;
      color: white;
      font-weight: 500;
      cursor: pointer;
      float: right;
    `;

    sendButton.addEventListener('click', () => this.sendMessage(textarea.value));
    
    this.inputArea.appendChild(textarea);
    this.inputArea.appendChild(sendButton);
  }

  async sendMessage(text) {
    if (!text.trim()) return;

    // Add user message to chat
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
      background: rgba(255, 255, 255, 0.05);
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 12px;
    `;
    messageEl.textContent = text;
    this.messagesEl.appendChild(messageEl);

    // Clear input
    const textarea = this.inputArea.querySelector('textarea');
    textarea.value = '';

    try {
      // Send message to API
      const response = await fetch(`${this.baseUrl}/api/widget/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.userEmail,
          message: text,
          celebrityId: this.celebrityId
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      // Add confirmation message
      const confirmationEl = document.createElement('div');
      confirmationEl.style.cssText = `
        background: rgba(59, 130, 246, 0.1);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 12px;
      `;
      confirmationEl.textContent = 'Thanks for your message! We\'ll review it and get back to you soon.';
      this.messagesEl.appendChild(confirmationEl);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorEl = document.createElement('div');
      errorEl.style.cssText = `
        background: rgba(239, 68, 68, 0.1);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 12px;
      `;
      errorEl.textContent = 'Failed to send message. Please try again.';
      this.messagesEl.appendChild(errorEl);
    }

    // Scroll to bottom
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.window.style.display = this.isOpen ? 'flex' : 'none';
  }

  async fetchGoals() {
    try {
      const response = await fetch(`${this.baseUrl}/api/widget/goals?celebrityId=${this.celebrityId}`);
      if (!response.ok) throw new Error('Failed to fetch goals');
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to load goals');
      this.goals = data.goals;
      return true;
    } catch (error) {
      console.error('Error fetching goals:', error);
      return false;
    }
  }

  async sendMessage(message) {
    try {
      const response = await fetch(`${this.baseUrl}/api/widget/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.userEmail,
          message: message,
          celebrityId: this.celebrityId
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to send message');
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }
}

// Initialize widget
window.hyperagentWidget = new HyperAgentWidget(); 