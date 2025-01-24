interface WidgetConfig {
  container: ShadowRoot;
  celebrityId: string;
  theme: {
    primaryColor?: string;
    position?: 'bottom-right' | 'bottom-left';
  };
}

declare class HyperAgentWidget {
  init(config: WidgetConfig): void;
  destroy(): void;
}

declare global {
  interface Window {
    HyperAgentWidget: HyperAgentWidget;
  }
} 