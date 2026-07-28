import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

const DOT_COUNT = 3;
const DOT_ANIMATION_DURATION_MS = 400;
const DOT_STAGGER_MS = 150;

/**
 * "La IA está pensando..." — solo feedback visual de que hay una
 * espera en curso mientras se genera la respuesta del turno, para que
 * la pantalla no se quede sin ningún cambio hasta que el texto
 * completo aparece de golpe. Nunca streaming real (eso queda anotado
 * en D-023 como mejora futura más grande, sin implementar todavía).
 */
export function TypingIndicator() {
  const dotValues = useRef(
    Array.from({ length: DOT_COUNT }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = dotValues.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * DOT_STAGGER_MS),
          Animated.timing(value, {
            toValue: 1,
            duration: DOT_ANIMATION_DURATION_MS,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: DOT_ANIMATION_DURATION_MS,
            useNativeDriver: true,
          }),
          Animated.delay((DOT_COUNT - 1 - index) * DOT_STAGGER_MS),
        ]),
      ),
    );
    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [dotValues]);

  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        {dotValues.map((value, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
                transform: [
                  {
                    translateY: value.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.space4,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.space16,
    paddingHorizontal: theme.spacing.space16,
    paddingVertical: theme.spacing.space12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textPrimary,
    opacity: 0.6,
  },
});
