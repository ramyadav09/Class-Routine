import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {useTheme} from '../context/ThemeContext';

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 2000,
}) => {
  const {colors} = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  const exitAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 40, friction: 7, useNativeDriver: true }),
      Animated.timing(slideUpAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dot1Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot2Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot3Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(200),
        Animated.timing(dot1Anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(dot2Anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(dot3Anim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 250, useNativeDriver: true }),
        Animated.timing(exitAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start(() => onFinish());
    }, duration);

    return () => clearTimeout(timer);
  }, [onFinish, duration]);

  const bgColor = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primary + '00', colors.primary],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.primary, opacity: fadeAnim }]}>
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }, { translateY: slideUpAnim }] }]}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoRing, { borderColor: 'rgba(255,255,255,0.2)' }]}>
            <View style={styles.logoInner}>
              <Text style={styles.logoText}>S5</Text>
            </View>
          </View>
        </View>
        <Text style={styles.title}>Semester 5</Text>
        <Text style={styles.subtitle}>Routine</Text>
      </Animated.View>

      <View style={styles.loaderRow}>
        <Animated.View style={[styles.dot, { opacity: dot1Anim, transform: [{ scale: dot1Anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }]} />
        <Animated.View style={[styles.dot, { opacity: dot2Anim, transform: [{ scale: dot2Anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }]} />
        <Animated.View style={[styles.dot, { opacity: dot3Anim, transform: [{ scale: dot3Anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }]} />
      </View>
      <Text style={styles.loadingText}>Loading</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFF',
    opacity: 0.85,
    marginTop: 2,
    textAlign: 'center',
  },
  loaderRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 48,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 13,
    opacity: 0.7,
    fontWeight: '500',
  },
});

export default SplashScreen;
