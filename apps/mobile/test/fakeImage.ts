import { afterEach, beforeEach } from 'vitest';

/**
 * jsdom never loads images, so react-native-web's Image would fire neither onLoad nor onError.
 * This replaces `window.Image` with a fake that settles asynchronously based on the URL:
 *
 * - a URL containing `error` fails to load
 * - a URL ending with `#<width>x<height>` loads with that intrinsic size (default 100x100)
 */
class FakeImage {
  onload: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  naturalWidth = 0;
  naturalHeight = 0;
  width = 0;
  height = 0;
  private _src = '';

  get src() {
    return this._src;
  }

  set src(value: string) {
    this._src = value;
    setTimeout(() => {
      if (value.includes('error')) {
        this.onerror?.({ type: 'error' });
        return;
      }
      const match = /#(\d+)x(\d+)$/.exec(value);
      this.naturalWidth = this.width = match ? Number(match[1]) : 100;
      this.naturalHeight = this.height = match ? Number(match[2]) : 100;
      this.onload?.({ type: 'load' });
    }, 0);
  }
}

/** Installs the fake `window.Image` for the tests in the calling file. */
export function useFakeImage() {
  const original = window.Image;

  beforeEach(() => {
    window.Image = FakeImage as unknown as typeof window.Image;
  });

  afterEach(() => {
    window.Image = original;
  });
}
