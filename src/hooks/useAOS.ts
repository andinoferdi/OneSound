"use client";

import { useEffect } from "react";
import AOS from "aos";

export const useAOS = () => {
  useEffect(() => {
    AOS.init({
      once: true,
      duration: window.innerWidth < 768 ? 400 : 800,
      offset: 10,
      easing: "ease",
      delay: 0,
      disable: false,
      startEvent: 'DOMContentLoaded',
      initClassName: 'aos-init',
      animatedClassName: 'aos-animate',
      useClassNames: false,
      disableMutationObserver: false,
      debounceDelay: 50,
      throttleDelay: 99,
    });

    const handleLoad = () => {
      AOS.refresh();
    };

    window.addEventListener('load', handleLoad);
    
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []);
};
