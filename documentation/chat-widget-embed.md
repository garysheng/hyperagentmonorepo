# Chat Widget Embed Process

## Overview
The chat widget uses a two-stage loading process to ensure minimal impact on the host website's performance while providing a rich chat experience.

## 1. Embed Script (v1.js)
This is the initial script that websites include. It's small (~2KB) and handles the setup process.

```javascript
// v1.js (minified version of this will be served)
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
```

## 2. Widget Bundle (bundle.js)
The main widget application, built with React/Preact for smaller bundle size.

```typescript
// src/widget/index.tsx
import { h, render } from 'preact';
import { ChatWidget } from './components/ChatWidget';

interface WidgetConfig {
  container: ShadowRoot;
  celebrityId: string;
  theme: {
    primaryColor?: string;
    position?: 'bottom-right' | 'bottom-left';
  };
}

class HyperAgentWidget {
  private config: WidgetConfig;
  private root: HTMLElement;

  init(config: WidgetConfig) {
    this.config = config;
    this.root = document.createElement('div');
    this.config.container.appendChild(this.root);

    render(
      <ChatWidget 
        celebrityId={this.config.celebrityId}
        theme={this.config.theme}
      />,
      this.root
    );
  }

  destroy() {
    if (this.root) {
      render(null, this.root);
    }
  }
}

// Expose to global scope
window.HyperAgentWidget = new HyperAgentWidget();
```

## 3. Build Process

```bash
# Widget build pipeline
pnpm build:widget

# 1. Build v1.js
esbuild src/embed/v1.js --minify --outfile=public/widget/v1.js

# 2. Build main bundle
vite build src/widget --outdir=public/widget
```

## 4. File Structure
```
public/widget/
├── v1.js          # Embed script
├── bundle.js      # Main widget bundle
└── styles.css     # Widget styles

pages/api/widget/
├── v1.js          # Serves embed script with proper headers
├── bundle.js      # Serves main bundle
└── styles.css     # Serves styles
```

## 5. Usage Example
```html
<!-- Basic usage -->
<script 
  src="https://hyperagent.so/api/widget/v1.js" 
  data-celebrity-id="123"
  async
></script>

<!-- With customization -->
<script 
  src="https://hyperagent.so/api/widget/v1.js" 
  data-celebrity-id="123"
  data-primary-color="#FF0000"
  data-position="bottom-left"
  async
></script>
```

## 6. Security Considerations

### Content Security Policy
```html
<!-- Host page CSP needs -->
<meta http-equiv="Content-Security-Policy" content="
  script-src 'self' https://hyperagent.so;
  frame-src 'self' https://hyperagent.so;
  connect-src 'self' https://hyperagent.so;
">
```

### Cross-Origin Communication
- PostMessage for widget-parent communication
- Validate message origins
- Whitelist allowed domains

## 7. Performance Optimization

### Loading Strategy
1. Load embed script (async)
2. Create container
3. Load styles (non-blocking)
4. Load main bundle (async)
5. Initialize widget

### Bundle Size Targets
- Embed script: < 2KB
- Main bundle: < 50KB (gzipped)
- Styles: < 10KB

### Monitoring
- Load time metrics
- Time to interactive
- Error tracking
- Performance marks 

## 8. Initial Testing Strategy

We'll first implement and test the widget on our own contact page at `hyperagent.so/contact`. This allows us to:

1. Test in a real environment with actual user interactions
2. Debug any cross-origin or embedding issues
3. Validate the full user flow
4. Test the admin dashboard experience

For testing, we'll create a test celebrity profile:
```typescript
const TEST_CELEBRITY = {
  id: 'hyperagentman',
  name: 'HyperAgent Man',
  bio: 'Your friendly neighborhood AI assistant',
  interests: ['AI/ML', 'Automation', 'Developer Tools'],
  avatar_url: '/images/hyperagentman.png'
}
```

The contact page will embed the widget using:
```html
<script 
  src="/api/widget/v1.js" 
  data-celebrity-id="hyperagentman"
  data-primary-color="#0F172A"
  async
></script>
```

Note: During local development, the widget will be served from localhost, making it easier to debug and modify without deploying. 