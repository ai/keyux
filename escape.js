export function escapeKeyUX() {
  return window => {
    function isVisible(element) {
      return element.offsetWidth > 0 &&
             element.offsetHeight > 0 &&
             getComputedStyle(element).visibility !== 'hidden';
    }

    function isDirectlyVisible(element) {
      let selectors = ':not([style*="display: none"], [style*="visibility: hidden"])'
      return isVisible(element) &&
             isVisible(element.closest(selectors));
    }

    function updateFocusableElements() {
      let selectors = 'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      return Array.from(document.querySelectorAll(selectors))
        .filter(isDirectlyVisible);
    }

    let focusableElements = updateFocusableElements();
    let lastFocusedIndex = -1;

    const observer = new MutationObserver(_mutations => {
      focusableElements = updateFocusableElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    document.body.addEventListener('focus', event => {
      const index = focusableElements.indexOf(event.target);
      if (index !== -1) {
        lastFocusedIndex = index;
      }
    }, true);

    function keyDown(event) {
      if (event.key === 'Escape') {
        document.activeElement.blur();
        lastFocusedIndex = -1;
      } else if (event.key === 'Tab') {
        event.preventDefault();
        if (!event.shiftKey) {
          lastFocusedIndex = (lastFocusedIndex + 1) % focusableElements.length;
        } else {
          lastFocusedIndex = (lastFocusedIndex - 1 + focusableElements.length) % focusableElements.length;
        }
        focusableElements[lastFocusedIndex] && focusableElements[lastFocusedIndex].focus();
      }
    }

    window.addEventListener('keydown', keyDown);
    return () => {
      window.removeEventListener('keydown', keyDown);
      observer.disconnect();
    }
  }
}
