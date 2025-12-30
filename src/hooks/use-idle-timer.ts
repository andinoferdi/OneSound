'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseIdleTimerOptions {
  timeout: number; // in milliseconds
  onIdle: () => void;
  onActive?: () => void;
  events?: string[];
  immediateEvents?: string[];
  element?: Element | Document;
}

interface UseIdleTimerReturn {
  isIdle: boolean;
  lastActive: Date | null;
  reset: () => void;
  activate: () => void;
  pause: () => void;
  resume: () => void;
  getRemainingTime: () => number;
}

export const useIdleTimer = ({
  timeout,
  onIdle,
  onActive,
  events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'keydown'],
  immediateEvents = ['mousedown', 'keypress', 'touchstart', 'click', 'keydown'],
  element = typeof document !== 'undefined' ? document : undefined
}: UseIdleTimerOptions): UseIdleTimerReturn => {
  const [isIdle, setIsIdle] = useState(false);
  const [lastActive, setLastActive] = useState<Date | null>(new Date());
  const [isPaused, setIsPaused] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActiveRef = useRef<Date>(new Date());
  const onIdleRef = useRef(onIdle);
  const onActiveRef = useRef(onActive);

  // Update refs when callbacks change to avoid stale closures
  onIdleRef.current = onIdle;
  onActiveRef.current = onActive;

  const clearExistingTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startTimer = useCallback(() => {
    clearExistingTimeout();

    if (!isPaused) {
      timeoutRef.current = setTimeout(() => {
        setIsIdle(true);
        onIdleRef.current();
      }, timeout);
    }
  }, [timeout, isPaused]);

  const reset = useCallback(() => {
    const now = new Date();
    lastActiveRef.current = now;
    setLastActive(now);

    // If currently idle, mark as active and call onActive
    setIsIdle((prevIsIdle) => {
      if (prevIsIdle && onActiveRef.current) {
        onActiveRef.current();
      }
      return false;
    });

    startTimer();
  }, [startTimer]);

  const activate = useCallback(() => {
    reset();
  }, [reset]);

  const pause = useCallback(() => {
    setIsPaused(true);
    clearExistingTimeout();
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
    // Don't call reset here to avoid circular dependency
  }, []);

  const getRemainingTime = useCallback(() => {
    if (isPaused) return 0;

    const now = new Date().getTime();
    const lastActiveTime = lastActiveRef.current.getTime();
    const elapsed = now - lastActiveTime;
    const remaining = Math.max(0, timeout - elapsed);

    return remaining;
  }, [timeout, isPaused]);

  const handleActivity = useCallback(
    (event: Event) => {
      if (isPaused) return;

      // Check if this is an immediate event that should reset timer immediately
      if (immediateEvents.includes(event.type)) {
        reset();
      }
    },
    [reset, immediateEvents, isPaused]
  );

  // Set up event listeners
  useEffect(() => {
    if (!element) return;

    events.forEach((event) => {
      element.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach((event) => {
        element.removeEventListener(event, handleActivity, true);
      });
    };
  }, [element, events, handleActivity]);

  // Handle pause/resume state changes
  useEffect(() => {
    if (!isPaused) {
      startTimer();
    } else {
      clearExistingTimeout();
    }

    return () => {
      clearExistingTimeout();
    };
  }, [isPaused, startTimer]);

  // Initial timer setup
  useEffect(() => {
    if (!isPaused) {
      reset();
    }

    return () => {
      clearExistingTimeout();
    };
  }, []); // Empty dependency array for initial setup only

  return {
    isIdle,
    lastActive,
    reset,
    activate,
    pause,
    resume,
    getRemainingTime
  };
};
