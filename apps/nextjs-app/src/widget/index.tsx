/** @jsx h */
import { h, render } from 'preact'
import { ChatWidget } from './components/ChatWidget'

interface WidgetConfig {
  container: ShadowRoot
  celebrityId: string
  theme: {
    primaryColor?: string
    position?: 'bottom-right' | 'bottom-left'
  }
}

class HyperAgentWidget {
  private config!: WidgetConfig
  private root!: HTMLElement

  init(config: WidgetConfig) {
    this.config = config
    this.root = document.createElement('div')
    this.config.container.appendChild(this.root)

    console.log('Widget config:', config)

    render(
      <ChatWidget 
        celebrityId={this.config.celebrityId}
        theme={this.config.theme}
      />,
      this.root
    )
  }

  destroy() {
    if (this.root) {
      render(null, this.root)
    }
  }
}

declare global {
  interface Window {
    HyperAgentWidget: HyperAgentWidget;
  }
}

// Expose to global scope
(window as Window).HyperAgentWidget = new HyperAgentWidget(); 