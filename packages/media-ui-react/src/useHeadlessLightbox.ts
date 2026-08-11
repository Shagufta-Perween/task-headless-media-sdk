import { useEffect, useRef, useCallback } from 'react';

export interface UseHeadlessLightboxOptions {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  totalItems: number;
}

export function useHeadlessLightbox({
  isOpen,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  totalItems
}: UseHeadlessLightboxOptions) {
  const containerRef = useRef<HTMLElement | null>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Keep references to latest functions to prevent redundant effect triggers
  const onCloseRef = useRef(onClose);
  const onNextRef = useRef(onNext);
  const onPrevRef = useRef(onPrev);
  onCloseRef.current = onClose;
  onNextRef.current = onNext;
  onPrevRef.current = onPrev;

  // Set up container ref callback to get access to the element
  const setContainerRef = useCallback((node: HTMLElement | null) => {
    containerRef.current = node;
  }, []);

  // Keyboard navigation & Focus management
  useEffect(() => {
    if (!isOpen) return;

    // Save previous focus
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Focus the lightbox container
    if (containerRef.current) {
      containerRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onCloseRef.current();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (totalItems > 1) {
            onNextRef.current();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (totalItems > 1) {
            onPrevRef.current();
          }
          break;
        case 'Tab': {
          // Focus trapping
          const focusableElements = containerRef.current.querySelectorAll(
            'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
          );
          if (focusableElements.length === 0) {
            e.preventDefault();
            return;
          }

          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus on close
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen, totalItems]);

  const getLightboxProps = useCallback(() => {
    return {
      ref: setContainerRef,
      role: 'dialog',
      'aria-modal': 'true' as const,
      'aria-label': 'Media lightbox overlay',
      tabIndex: -1,
      style: {
        outline: 'none'
      }
    };
  }, [setContainerRef]);

  const getOverlayProps = useCallback(() => {
    return {
      onClick: (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }
    };
  }, [onClose]);

  const getCloseButtonProps = useCallback(() => {
    return {
      onClick: onClose,
      'aria-label': 'Close lightbox',
      role: 'button'
    };
  }, [onClose]);

  const getNextButtonProps = useCallback(() => {
    return {
      onClick: onNext,
      'aria-label': 'Next slide',
      role: 'button',
      disabled: currentIndex === totalItems - 1
    };
  }, [onNext, currentIndex, totalItems]);

  const getPrevButtonProps = useCallback(() => {
    return {
      onClick: onPrev,
      'aria-label': 'Previous slide',
      role: 'button',
      disabled: currentIndex === 0
    };
  }, [onPrev, currentIndex]);

  const getMediaContainerProps = useCallback(() => {
    return {
      role: 'document',
      'aria-label': `Media index ${currentIndex + 1} of ${totalItems}`
    };
  }, [currentIndex, totalItems]);

  return {
    getLightboxProps,
    getOverlayProps,
    getCloseButtonProps,
    getNextButtonProps,
    getPrevButtonProps,
    getMediaContainerProps
  };
}
