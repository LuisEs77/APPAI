import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Hook seguro para usar Haptics en web y nativo
 * En web, las llamadas se ignoran sin errores
 */
export const useHaptics = () => {
  const impactAsync = async (style: Haptics.ImpactFeedbackStyle) => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(style);
      } catch (error) {
        // Silenciar errores de haptics
      }
    }
  };

  const notificationAsync = async (type: Haptics.NotificationFeedbackType) => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(type);
      } catch (error) {
        // Silenciar errores de haptics
      }
    }
  };

  const selectionAsync = async () => {
    if (Platform.OS !== 'web') {
      try {
        await Haptics.selectionAsync();
      } catch (error) {
        // Silenciar errores de haptics
      }
    }
  };

  return {
    impactAsync,
    notificationAsync,
    selectionAsync,
    ImpactFeedbackStyle: Haptics.ImpactFeedbackStyle,
    NotificationFeedbackType: Haptics.NotificationFeedbackType,
  };
};
