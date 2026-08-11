/**
 * Minimal DOM/browser API polyfill for prerendering in Node.js.
 * Required because the prerender script runs in Node but uses client-bundled
 * code that expects browser globals. Some dependencies (and app code) check
 * `typeof window !== 'undefined'` to detect browsers — since we polyfill
 * `window`, we must also polyfill the APIs they access afterward.
 *
 * This file is plain JS (not TypeScript) to avoid strict DOM type checking
 * against full HTMLElement/Document interfaces.
 */
if (typeof document === 'undefined') {
  const el = {
    innerHTML: '',
    textContent: '',
    childNodes: [],
    setAttribute() {},
    getAttribute() { return null; },
    appendChild() { return el; },
    removeChild() { return el; },
    cloneNode() { return { ...el }; },
    addEventListener() {},
    removeEventListener() {},
    style: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
  };

  globalThis.document = {
    createElement() { return { ...el }; },
    createElementNS() { return { ...el }; },
    createTextNode() { return { ...el }; },
    createDocumentFragment() { return { ...el, childNodes: [] }; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getElementById() { return null; },
    getElementsByTagName() { return []; },
    head: { ...el, querySelector() { return null; }, appendChild() { return el; } },
    body: { ...el },
    documentElement: { ...el, setAttribute() {} },
    addEventListener() {},
    removeEventListener() {},
  };
}

if (typeof window === 'undefined') {
  globalThis.window = globalThis;
}

if (typeof navigator === 'undefined') {
  globalThis.navigator = { userAgent: 'prerender', language: 'en' };
}

// localStorage / sessionStorage stubs
if (typeof localStorage === 'undefined') {
  const createStorage = () => {
    const store = new Map();
    return {
      getItem(key) { return store.get(key) ?? null; },
      setItem(key, value) { store.set(key, String(value)); },
      removeItem(key) { store.delete(key); },
      clear() { store.clear(); },
      get length() { return store.size; },
      key(index) { return [...store.keys()][index] ?? null; },
    };
  };
  globalThis.localStorage = createStorage();
  globalThis.sessionStorage = createStorage();
}

// matchMedia stub
if (typeof matchMedia === 'undefined') {
  globalThis.matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() { return false; },
  });
}

// requestAnimationFrame / cancelAnimationFrame stubs
if (typeof requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
}

// IntersectionObserver stub (commonly used by animation libraries)
if (typeof IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// ResizeObserver stub
if (typeof ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
