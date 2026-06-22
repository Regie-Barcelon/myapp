import { View, Text, StyleSheet, Animated, Pressable, Platform, ViewStyle, TextStyle } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';

const HOLD_INTERVAL_SPEED = 150; 

// --- CHILD COMPONENT ---
interface CounterDisplayProps {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
}

const CounterDisplay: React.FC<CounterDisplayProps> = ({ count, setCount }) => {
  const scaleAdd = useRef(new Animated.Value(1)).current;
  const scaleMinus = useRef(new Animated.Value(1)).current;
  const scaleReset = useRef(new Animated.Value(1)).current;
  const soundRef = useRef<Audio.Sound | null>(null);
  
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadLaserSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/laser.wav'),
          { shouldPlay: false }
        );

        if (isMounted) {
          soundRef.current = sound;
        } else {
          await sound.unloadAsync();
        }
      } catch (error) {
        console.warn('Failed to load lazer sound', error);
      }
    };

    loadLaserSound();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playLazerSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }
    } catch (error) {
      console.warn('Failed to play lazer sound', error);
    }
  };

  const animateIn = (anim: Animated.Value) => {
    Animated.spring(anim, { toValue: 0.95, useNativeDriver: true }).start();
  };
  const animateOut = (anim: Animated.Value) => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true }).start();
  };

  const startContinuousAction = (direction: number, anim: Animated.Value) => {
    animateIn(anim);
    playLazerSound();
    setCount(prev => prev + direction);

    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);

    holdIntervalRef.current = setInterval(() => {
      playLazerSound();
      setCount(prev => prev + direction);
    }, HOLD_INTERVAL_SPEED);
  };

  const stopContinuousAction = (anim: Animated.Value) => {
    animateOut(anim);
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  return (
    <View style={styles.childContainer}>
      <View style={styles.childBadge}>
        <Text style={styles.childBadgeText}>CHILD COUNTER UNIT</Text>
      </View>

      <Text style={styles.childTitle}>Control Console</Text>
      <Text style={styles.subLabel}>Reflects the shared parent state in real time</Text>
      
      <View style={styles.countWrapper}>
        <Text style={styles.hugeCount}>{count}</Text>
      </View>
      
      <Text style={styles.subLabel}>Tap any module or hold to accelerate the delta</Text>
      <Text style={styles.holdInstruction}>Press and hold for continuous count shift</Text>
      <Animated.View style={{ transform: [{ scale: scaleAdd }], width: '100%' }}>
        <Pressable 
          style={({ pressed }) => [styles.button, styles.btnPink, pressed && styles.btnPressed]} 
          onPressIn={() => startContinuousAction(1, scaleAdd)}
          onPressOut={() => stopContinuousAction(scaleAdd)}
        >
          <Text style={styles.btnText}>Add Count</Text>
          <Text style={styles.btnIcon}>🚀</Text>
        </Pressable>
      </Animated.View>

      {/* Minus Button */}
      <Animated.View style={{ transform: [{ scale: scaleMinus }], width: '100%' }}>
        <Pressable 
          style={({ pressed }) => [styles.button, styles.btnRed, pressed && styles.btnPressed]} 
          onPressIn={() => startContinuousAction(-1, scaleMinus)}
          onPressOut={() => stopContinuousAction(scaleMinus)}
        >
          <Text style={styles.btnText}>Minus Count</Text>
          <Text style={styles.btnIcon}>🛸</Text>
        </Pressable>
      </Animated.View>

      {/* Reset Button */}
      <Animated.View style={{ transform: [{ scale: scaleReset }], width: '100%' }}>
        <Pressable 
          style={({ pressed }) => [styles.button, styles.btnGrey, pressed && styles.btnPressed]} 
          onPress={() => {
            setCount(100);
          }}
          onPressIn={() => animateIn(scaleReset)}
          onPressOut={() => animateOut(scaleReset)}
        >
          <Text style={styles.btnText}>Reset Count</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

// --- PARENT COMPONENT ---
export default function HomeScreen() {
  const [count, setCount] = useState<number>(100);

  return (
    <SafeAreaView style={styles.screenContainer}>
      <View style={styles.neonGlow1} />
      <View style={styles.neonGlow2} />

      <View style={[styles.parentContainer, styles.panelShadow]}>
          <View style={styles.parentHeaderBanner}>
          <Text style={styles.parentBannerText}>QUANTUM CONTROL CENTER</Text>
        </View>

        <Text style={styles.parentTitle}>Flux Counter Matrix</Text>

        <View style={styles.heroPanel}>
          <Text style={styles.heroText}>Live telemetry linked directly to the child control console.</Text>
          <View style={styles.heroTag}>
            <Text style={styles.heroTagText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.stateLocker}>
          <Text style={styles.stateLockerTitle}>CORE METRIC</Text>
          <View style={styles.matrixDisplay}>
            <Text style={styles.matrixText}>count</Text>
            <Text style={styles.matrixNumber}>{count}</Text>
          </View>
        </View>

        <CounterDisplay count={count} setCount={setCount} />
      </View>
    </SafeAreaView>
  );
}

// --- CLEAN STYLES ---
interface Styles {
  screenContainer: ViewStyle;
  neonGlow1: ViewStyle;
  neonGlow2: ViewStyle;
  parentContainer: ViewStyle;
  parentHeaderBanner: ViewStyle;
  parentBannerText: TextStyle;
  parentTitle: TextStyle;
  stateLocker: ViewStyle;
  stateLockerTitle: TextStyle;
  matrixDisplay: ViewStyle;
  matrixText: TextStyle;
  matrixNumber: TextStyle;
  childContainer: ViewStyle;
  childBadge: ViewStyle;
  childBadgeText: TextStyle;
  childTitle: TextStyle;
  subLabel: TextStyle;
  holdInstruction: TextStyle;
  countWrapper: ViewStyle;
  hugeCount: TextStyle;
  button: ViewStyle;
  btnPressed: ViewStyle;
  btnPink: ViewStyle;
  btnRed: ViewStyle;
  btnGrey: ViewStyle;
  btnText: TextStyle;
  btnIcon: TextStyle;
  panelShadow: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  screenContainer: {
    flex: 1,
    backgroundColor: '#070b1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  neonGlow1: {
    position: 'absolute',
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: '#4b6fff',
    opacity: 0.12,
    top: '10%',
    left: '-16%',
  },
  neonGlow2: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#ff5cc3',
    opacity: 0.1,
    bottom: '8%',
    right: '-12%',
  },
  parentContainer: {
    width: '94%',
    maxWidth: 420,
    backgroundColor: 'rgba(12, 20, 42, 0.96)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(108, 109, 255, 0.25)',
    padding: 26,
    alignItems: 'center',
    ...Platform.select<ViewStyle>({
      ios: { shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.24, shadowRadius: 24 },
      android: { elevation: 18 },
      default: {},
    }),
  },
  parentHeaderBanner: {
    backgroundColor: 'rgba(109, 93, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(109, 93, 255, 0.42)',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 24,
    marginBottom: 16,
  },
  parentBannerText: {
    color: '#d4d1ff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  parentTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#f8fbff',
    marginBottom: 18,
    letterSpacing: 0.8,
  },
  heroPanel: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heroText: {
    color: '#c8d2ff',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    flex: 1,
    marginRight: 12,
  },
  heroTag: {
    backgroundColor: '#5c70ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroTagText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  stateLocker: {
    backgroundColor: 'rgba(54, 71, 149, 0.18)',
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(112, 233, 210, 0.2)',
    marginBottom: 26,
  },
  stateLockerTitle: {
    color: '#66f2d8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  matrixDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  matrixText: {
    color: '#c2d0ff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginRight: 12,
  },
  matrixNumber: {
    color: '#79fff0',
    fontSize: 36,
    fontWeight: '900',
    textShadowColor: 'rgba(121, 255, 240, 0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  childContainer: {
    width: '100%',
    backgroundColor: 'rgba(20, 32, 58, 0.96)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(168, 138, 255, 0.18)',
    padding: 26,
    paddingTop: 36,
    alignItems: 'center',
    position: 'relative',
  },
  childBadge: {
    backgroundColor: 'rgba(94, 78, 255, 0.18)',
    borderColor: 'rgba(158, 124, 255, 0.32)',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
    position: 'absolute',
    top: -12,
  },
  childBadgeText: {
    color: '#d8ccff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  childTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#eef2ff',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    color: '#9cb2d8',
    fontWeight: '500',
    marginVertical: 4,
    textAlign: 'center',
  },
  holdInstruction: {
    fontSize: 10,
    color: '#cfa5ff',
    fontWeight: '700',
    marginBottom: 14,
  },
  countWrapper: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    width: '100%',
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    marginVertical: 12,
  },
  hugeCount: {
    fontSize: 64,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
    textShadowColor: 'rgba(255, 255, 255, 0.28)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(21, 31, 56, 0.95)',
    ...Platform.select<ViewStyle>({
      ios: { shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 16 },
      android: { elevation: 5 },
      default: {},
    }),
  },
  btnPressed: {
    opacity: 0.8,
  },
  btnPink: {
    backgroundColor: '#7b3ff5',
    borderColor: '#b888ff',
  },
  btnRed: {
    backgroundColor: '#db2b63',
    borderColor: '#ff8bb8',
  },
  btnGrey: {
    backgroundColor: '#1f3358',
    borderColor: '#6b86c5',
  },
  btnText: {
    color: '#f7f8ff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  btnIcon: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 18,
    fontWeight: '700',
  },
  panelShadow: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.28,
      shadowRadius: 22,
    },
    android: {
      elevation: 18,
    },
    default: {},
  }) as ViewStyle,
});
