import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Declare dataLayer for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
  }
}

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    // Push page view to Google Tag Manager dataLayer for SPA tracking
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'page_view',
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title
      });
    }
  }, [pathname]);

  return null;
}
