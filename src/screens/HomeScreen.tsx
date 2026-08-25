import React, {useState, useCallback, useEffect, useLayoutEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../context/ThemeContext';
import {useRoutine} from '../hooks/useRoutine';
import PremiumSchedule from '../components/PremiumSchedule';
import LoadingIndicator from '../components/LoadingIndicator';

const HomeScreen: React.FC = () => {
  const {colors, isDark, toggleTheme} = useTheme();
  const insets = useSafeAreaInsets();
  const {
    rollNumber,
    setRollNumber,
    loadRoutine,
    loading,
    error,
    studentInfo,
    mergedRoutine,
    savedRollNumber,
    deleteSavedRoll,
    reset,
    cancelLoad,
  } = useRoutine();

  const [inputValue, setInputValue] = useState('');
  const [showRoutine, setShowRoutine] = useState(false);
  const autoNavigated = useRef(false);

  const headerSlide = useRef(new Animated.Value(20)).current;
  const cardSlide = useRef(new Animated.Value(16)).current;
  const quickFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (savedRollNumber && !autoNavigated.current) {
      autoNavigated.current = true;
      setInputValue(savedRollNumber);
      setRollNumber(savedRollNumber);
      loadRoutine(savedRollNumber);
      setShowRoutine(true);
    }
  }, [savedRollNumber, loadRoutine, setRollNumber]);

  useLayoutEffect(() => {
    Animated.stagger(150, [
      Animated.timing(headerSlide, { toValue: 0, duration: 500, useNativeDriver: true, isInteraction: false }),
      Animated.timing(cardSlide, { toValue: 0, duration: 400, useNativeDriver: true, isInteraction: false }),
    ]).start();
  }, [headerSlide, cardSlide]);

  useEffect(() => {
    if (savedRollNumber && !showRoutine) {
      Animated.timing(quickFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } else {
      quickFade.setValue(0);
    }
  }, [savedRollNumber, showRoutine, quickFade]);

  const handleShowRoutine = useCallback(() => {
    const roll = inputValue.trim();
    if (roll) {
      setRollNumber(roll);
      loadRoutine(roll);
      setShowRoutine(true);
    }
  }, [inputValue, setRollNumber, loadRoutine]);

  const handleBack = useCallback(() => {
    cancelLoad();
    setShowRoutine(false);
    setInputValue('');
    autoNavigated.current = false;
    reset();
    deleteSavedRoll();
  }, [cancelLoad, reset, deleteSavedRoll]);

  const handleChangeRoutine = useCallback(() => {
    cancelLoad();
    setShowRoutine(false);
    setInputValue('');
    autoNavigated.current = false;
    reset();
  }, [cancelLoad, reset]);

  if (loading) {
    return <LoadingIndicator message="Loading your routine..." />;
  }

  if (showRoutine && mergedRoutine && studentInfo) {
    return (
      <PremiumSchedule
        routine={mergedRoutine}
        studentInfo={studentInfo}
        rollNumber={rollNumber}
        onBack={handleBack}
        onChangeRoutine={handleChangeRoutine}
      />
    );
  }

  return (
    <View style={[styles.container, {
      backgroundColor: colors.background,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Animated.View style={{ transform: [{ translateY: headerSlide }] }}>
            <View style={styles.headerSection}>
              <Text style={[styles.greeting, {color: colors.textSecondary}]}>Welcome back</Text>
              <Text style={[styles.appTitle, {color: colors.primary}]}>Semester 5</Text>
              <Text style={[styles.appSubtitle, {color: colors.text}]}>Class Routine</Text>
            </View>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateY: cardSlide }] }}>
            <View style={[styles.card, {
              backgroundColor: isDark ? '#16161C' : colors.cardBackground,
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
            }]}>
              <Text style={[styles.cardTitle, {color: colors.text}]}>Enter Roll Number</Text>
              <Text style={[styles.cardSubtitle, {color: colors.textSecondary}]}>
                Enter your KIIT roll number to view your schedule
              </Text>

              <TextInput
                style={[styles.input, {
                  backgroundColor: isDark ? '#22222A' : colors.surface,
                  color: colors.text,
                  borderColor: isDark ? 'rgba(255,255,255,0.15)' : colors.border,
                }]}
                placeholder="e.g. 2405001"
                placeholderTextColor={colors.textSecondary}
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType="number-pad"
                returnKeyType="go"
                onSubmitEditing={handleShowRoutine}
                autoCapitalize="none"
                accessibilityLabel="Roll number input"
              />

              {error ? (
                <View style={[styles.errorBox, {backgroundColor: colors.error + '12'}]}>
                  <Text style={[styles.errorText, {color: colors.error}]}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary, opacity: inputValue.trim() ? 1 : 0.45 }]}
                onPress={handleShowRoutine}
                disabled={!inputValue.trim()}
                accessibilityLabel="Show Routine"
                activeOpacity={0.85}>
                <Text style={styles.buttonText}>Show Routine</Text>
              </TouchableOpacity>

              <View style={[styles.divider, {borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : colors.border}]} />

              <View style={styles.themeRow}>
                <View style={styles.themeLabelRow}>
                  <Text style={{fontSize: 13, color: colors.textSecondary}}>{'\u2601'}</Text>
                  <Text style={[styles.themeLabel, {color: colors.text}]}>Dark Mode</Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{false: '#CCC', true: colors.primaryDark}}
                  thumbColor={isDark ? colors.primary : '#F4F4F4'}
                  accessibilityLabel="Toggle dark mode"
                />
              </View>
            </View>
          </Animated.View>

          {savedRollNumber && !showRoutine ? (
            <Animated.View style={{ opacity: quickFade }}>
              <TouchableOpacity
                onPress={deleteSavedRoll}
                style={[styles.forgetBtn, { borderColor: isDark ? 'rgba(255,255,255,0.12)' : colors.border }]}
                activeOpacity={0.6}>
                <Text style={[styles.forgetBtnText, { color: colors.error }]}>Forget my roll number</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : null}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20 },
  headerSection: { marginBottom: 24 },
  greeting: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
  appTitle: { fontSize: 34, fontWeight: '800', letterSpacing: 0.5 },
  appSubtitle: { fontSize: 18, fontWeight: '600', marginTop: 2 },
  card: { borderRadius: 16, padding: 24, borderWidth: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 18, fontWeight: '500', marginBottom: 12 },
  errorBox: { borderRadius: 8, padding: 10, marginBottom: 8 },
  errorText: { fontSize: 13, textAlign: 'center', fontWeight: '500' },
  button: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#FFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  divider: { borderTopWidth: 1, marginTop: 20, marginBottom: 16 },
  themeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  themeLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  themeLabel: { fontSize: 15, fontWeight: '500' },
  forgetBtn: { marginTop: 12, borderRadius: 10, borderWidth: 1, paddingVertical: 10, alignItems: 'center' },
  forgetBtnText: { fontSize: 13, fontWeight: '600' },
  footer: { alignItems: 'center', marginTop: 24, marginBottom: 16 },
  footerText: { fontSize: 12, textAlign: 'center' },
});

export default HomeScreen;
