// jsdom doesn't implement these browser APIs, which Unistyles, react-native-web and
// Reanimated use. Loaded before vitest.setup.ts so they exist when those modules load.

// Reanimated switches to a Jest-specific mode when NODE_ENV is "test" (which Vitest sets).
// That mode expects Jest's setup and fails to update styles on react-native-web, so let it
// run as it does on the web instead.
process.env.NODE_ENV = 'development';

if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList => ({
    // Report "reduce motion" so Reanimated skips animations: jsdom never fires the CSS
    // animation events its web layout animations wait for (elements would stay
    // `visibility: hidden`), and `withTiming` then settles immediately.
    matches: query.includes('prefers-reduced-motion: reduce'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

// Unistyles writes its generated CSS with `styleTag.innerText = ...`. jsdom doesn't
// implement `innerText`, so the rules never reach the document; map it to textContent.
if (!Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'innerText')) {
  Object.defineProperty(HTMLElement.prototype, 'innerText', {
    configurable: true,
    get(this: HTMLElement) {
      return this.textContent ?? '';
    },
    set(this: HTMLElement, value: string) {
      this.textContent = value;
    },
  });
}

// Without AnimationEvent, React listens for the prefixed `webkitAnimationEnd` instead of
// `animationend`, so `fireEvent.animationEnd` would never reach components (e.g. the
// react-native-web Modal, which unmounts when its fade-out animation ends).
if (!('AnimationEvent' in window)) {
  class AnimationEvent extends Event {
    readonly animationName: string;
    readonly elapsedTime: number;
    readonly pseudoElement: string;

    constructor(type: string, init: AnimationEventInit = {}) {
      super(type, init);
      this.animationName = init.animationName ?? '';
      this.elapsedTime = init.elapsedTime ?? 0;
      this.pseudoElement = init.pseudoElement ?? '';
    }
  }
  Object.defineProperty(window, 'AnimationEvent', {
    configurable: true,
    writable: true,
    value: AnimationEvent,
  });
}
