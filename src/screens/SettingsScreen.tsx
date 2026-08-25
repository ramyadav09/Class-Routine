import React, {useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '../utils/constants';

const SettingsScreen: React.FC = () => {
  const {colors, isDark, toggleTheme} = useTheme();
  const navigation = useNavigation<any>();

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset App',
      'This will clear all saved data including your roll number and theme preference. Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                STORAGE_KEYS.ROLL_NUMBER,
                STORAGE_KEYS.THEME,
              ]);
              Alert.alert('Reset Complete', 'App data has been cleared. Please restart the app.');
            } catch {
              Alert.alert('Error', 'Failed to reset app data.');
            }
          },
        },
      ],
    );
  }, []);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.section,
            {backgroundColor: colors.surface, borderColor: colors.border},
          ]}>
          <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>
            PREFERENCES
          </Text>

          <View style={[styles.row, {borderBottomColor: colors.border}]}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>{'\u2601'}</Text>
              <Text style={[styles.rowLabel, {color: colors.text}]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{false: '#CCC', true: colors.primaryDark}}
              thumbColor={isDark ? colors.primary : '#F4F4F4'}
              accessibilityLabel="Toggle dark mode"
            />
          </View>

          <TouchableOpacity
            style={[styles.row, {borderBottomColor: colors.border}]}
            onPress={() => navigation.navigate('About')}
            accessibilityLabel="About"
            accessibilityRole="button">
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>{'\u2139'}</Text>
              <Text style={[styles.rowLabel, {color: colors.text}]}>About</Text>
            </View>
            <Text style={[styles.arrow, {color: colors.textSecondary}]}>
              {'\u203A'}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.section,
            {backgroundColor: colors.surface, borderColor: colors.border},
          ]}>
          <Text style={[styles.sectionTitle, {color: colors.textSecondary}]}>
            DATA
          </Text>

          <TouchableOpacity
            style={styles.row}
            onPress={handleReset}
            accessibilityLabel="Reset app data"
            accessibilityRole="button">
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>{'\u26A0'}</Text>
              <Text style={[styles.dangerText, {color: colors.error}]}>
                Reset App Data
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, {backgroundColor: 'transparent'}]}>
          <Text style={[styles.versionText, {color: colors.textSecondary}]}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 24,
    fontWeight: '300',
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
});

export default SettingsScreen;
