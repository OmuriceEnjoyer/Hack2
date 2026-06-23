/**
 * View Transition API helper with a graceful fallback.
 * When the browser doesn't support `startViewTransition`, the callback still
 * runs synchronously, so navigation works exactly the same — just without the
 * animated transition.
 */
type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

export function supportsViewTransitions(): boolean {
  return typeof (document as ViewTransitionDocument).startViewTransition === 'function';
}

export function startViewTransition(callback: () => void): void {
  const doc = document as ViewTransitionDocument;
  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(callback);
  } else {
    callback();
  }
}
