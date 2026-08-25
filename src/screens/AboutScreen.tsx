import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { APP_VERSION } from '../utils/constants';

const AboutScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.appTitle, { color: colors.primary }]}>Class Routine</Text>
          <Text style={[styles.version, { color: colors.textSecondary }]}>Version {APP_VERSION}</Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {'⚙'} Version
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>{APP_VERSION}</Text>
          </View>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {'📱'} Platform
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>React Native</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {'📦'} Type
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>Academic</Text>
          </View>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <Text style={[styles.description, { color: colors.textSecondary }]}>This application displays the semester 5 timetable for CSE students.
            Enter your roll number to view your personalized schedule including
            core subjects and elective choices.
          </Text>
        </View>

        <View style={styles.footerSection}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            {'©'} {new Date().getFullYear()} Class Routine. All rights reserved.
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
    padding: 20,
    paddingTop: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
  },
});

export default AboutScreen;
