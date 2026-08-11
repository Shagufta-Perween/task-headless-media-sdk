import { useCallback } from 'react';

export interface UseHeadlessLightboxRNOptions {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  totalItems: number;
}

export function useHeadlessLightboxRN({
  isOpen,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  totalItems
}: UseHeadlessLightboxRNOptions) {

  const getModalProps = useCallback(() => {
    return {
      visible: isOpen,
      onRequestClose: onClose,
      animationType: 'fade' as const,
      transparent: true,
      accessibilityViewIsModal: true,
      accessibilityRole: 'alert' as const
    };
  }, [isOpen, onClose]);

  const getCloseButtonProps = useCallback(() => {
    return {
      onPress: onClose,
      accessibilityLabel: 'Close lightbox',
      accessibilityRole: 'button' as const,
      accessible: true
    };
  }, [onClose]);

  const getNextButtonProps = useCallback(() => {
    return {
      onPress: onNext,
      accessibilityLabel: 'Next slide',
      accessibilityRole: 'button' as const,
      disabled: currentIndex === totalItems - 1,
      accessible: true
    };
  }, [onNext, currentIndex, totalItems]);

  const getPrevButtonProps = useCallback(() => {
    return {
      onPress: onPrev,
      accessibilityLabel: 'Previous slide',
      accessibilityRole: 'button' as const,
      disabled: currentIndex === 0,
      accessible: true
    };
  }, [onPrev, currentIndex]);

  const getGestureProps = () => {
    // Standard swipe handlers can be attached here in RN
    return {
      accessible: true,
      accessibilityLabel: `Slide ${currentIndex + 1} of ${totalItems}`
    };
  };

  return {
    getModalProps,
    getCloseButtonProps,
    getNextButtonProps,
    getPrevButtonProps,
    getGestureProps
  };
}
