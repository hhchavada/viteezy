export function scrollToTop() {
  // Get ScrollSmoother instance
  // @ts-ignore
  const smoother = window.ScrollSmoother?.get?.();
  
  const performScroll = () => {
    if (smoother) {
      // ScrollSmoother's scrollTo method: scrollTo(target, smooth, suppressEvents)
      // target can be a number (scroll position) or selector
      // smooth: false for instant scroll
      try {
        smoother.scrollTo(0, false);
      } catch (e) {
        // If scrollTo fails, try alternative methods
        console.warn('ScrollSmoother scrollTo failed, using fallback', e);
      }
      
      // Directly scroll the wrapper element (ScrollSmoother's actual scrollable element)
      const wrapper = document.getElementById('smooth-wrapper');
      if (wrapper) {
        wrapper.scrollTop = 0;
        // Also try scrolling the content element
        const contentWrapper = document.getElementById('smooth-content');
        if (contentWrapper) {
          contentWrapper.scrollTop = 0;
        }
      }
    } else {
      // Fallback to standard scroll if ScrollSmoother is not available
      window.scrollTo({ top: 0, behavior: "instant" });
      
      // Also try scrolling the wrapper elements directly
      const wrapper = document.getElementById('smooth-wrapper');
      if (wrapper) {
        wrapper.scrollTop = 0;
      }
      const contentWrapper = document.getElementById('smooth-content');
      if (contentWrapper) {
        contentWrapper.scrollTop = 0;
      }
    }
  };
  
  // Use requestAnimationFrame for better timing with DOM updates
  requestAnimationFrame(() => {
    performScroll();
    
    // Also perform scroll after a short delay to handle Next.js navigation timing
    // This ensures scroll happens after the page transition completes
    setTimeout(() => {
      requestAnimationFrame(() => {
        performScroll();
      });
    }, 100);
    
    // Additional delayed scroll for slower page loads/transitions
    setTimeout(() => {
      requestAnimationFrame(() => {
        performScroll();
      });
    }, 300);
  });
}
  