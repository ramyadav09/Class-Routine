import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClassInfo, UPTO_PERIODS } from '../types';
import { useTheme } from '../context/ThemeContext';
import BottomSheet from './BottomSheet';
import ClassCard from './ClassCard';
import CalendarView from './CalendarView';
import SearchBar from './SearchBar';

const SUBJECT_COLORS: Record<string, string> = {
  DAA: '#AFA5FF', DAAL: '#AFA5FF', SE: '#FF6AB8',
  EE: '#42B9FF', CN: '#F26BB5', CNL: '#F26BB5',
  IPA: '#19E6C1', HPC: '#FFB347', DOS: '#6C5CE7',
  DMDW: '#00CEC9', MC: '#FD79A8', EPP: '#FDCB6E',
  BD: '#E17055', CD: '#A29BFE', CI: '#55EFC4',
  SVP: '#FFEAA7', BDS: '#DFE6E9', PSIOT: '#74B9FF', AI: '#81ECEC',
};

const PERIOD_TIMES: Record<string, { start: string; end: string }> = {
  P1: { start: '8:00', end: '9:00' }, P2: { start: '9:00', end: '10:00' },
  P3: { start: '10:00', end: '11:00' }, P4: { start: '11:00', end: '12:00' },
  P5: { start: '12:00', end: '13:00' }, P6: { start: '13:00', end: '14:00' },
};

const getSubjectColor = (subject: string): string => {
  const base = subject.replace(/[0-9]/g, '').trim();
  const sorted = Object.entries(SUBJECT_COLORS).sort((a, b) => b[0].length - a[0].length);
  for (const [key, color] of sorted) {
    if (base.includes(key)) return color;
  }
  return '#19E6C1';
};

interface TimelineEntry {
  period: string;
  classInfo: ClassInfo | null;
  time: { start: string; end: string };
  isBreak: boolean;
}

const getTimelineWithBreaks = (
  day: string,
  routine: Record<string, Record<string, ClassInfo | null>>
): TimelineEntry[] => {
  if (!routine[day]) return [];

  const classPeriods = UPTO_PERIODS.filter(p => routine[day]?.[p] != null);
  if (classPeriods.length === 0) return [];

  const firstIdx = UPTO_PERIODS.indexOf(classPeriods[0]);
  const lastIdx = UPTO_PERIODS.indexOf(classPeriods[classPeriods.length - 1]);

  const entries: TimelineEntry[] = [];
  for (let i = firstIdx; i <= lastIdx; i++) {
    const period = UPTO_PERIODS[i];
    const cls = routine[day]?.[period];
    if (cls) {
      entries.push({ period, classInfo: cls, time: PERIOD_TIMES[period] || { start: '', end: '' }, isBreak: false });
    } else {
      entries.push({ period, classInfo: null, time: PERIOD_TIMES[period] || { start: '', end: '' }, isBreak: true });
    }
  }
  return entries;
};

const getTodayName = (): string =>
  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

interface PremiumScheduleProps {
  routine: Record<string, Record<string, ClassInfo | null>>;
  studentInfo: { section: string; ipa: string; svp: string };
  rollNumber: string;
  onBack: () => void;
  onChangeRoutine: () => void;
}

const PremiumSchedule: React.FC<PremiumScheduleProps> = ({
  routine, studentInfo, rollNumber, onBack, onChangeRoutine,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ classInfo: ClassInfo; day: string; period: string } | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const [selectedDayName, setSelectedDayName] = useState<string>(getTodayName());
  const [searchQuery, setSearchQuery] = useState('');
  const timelineEntries = useMemo(() => getTimelineWithBreaks(selectedDayName, routine), [selectedDayName, routine]);
  const todayClasses = useMemo(() => timelineEntries.filter(e => !e.isBreak).map(e => ({
    period: e.period,
    classInfo: e.classInfo!,
    time: e.time,
  })), [timelineEntries]);
  const todayTimeRange = useMemo(() => {
    if (todayClasses.length === 0) return '';
    return `${todayClasses[0].time.start}\u2013${todayClasses[todayClasses.length - 1].time.end}`;
  }, [todayClasses]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return timelineEntries;
    const q = searchQuery.toLowerCase();
    return timelineEntries.filter(e => {
      if (e.isBreak) return false;
      const s = e.classInfo!.subject.toLowerCase();
      const f = e.classInfo!.faculty.toLowerCase();
      const r = e.classInfo!.room.toLowerCase();
      return s.includes(q) || f.includes(q) || r.includes(q);
    });
  }, [timelineEntries, searchQuery]);

  const summarySlide = useRef(new Animated.Value(10)).current;
  const weekSlide = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(summarySlide, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.timing(weekSlide, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    summarySlide.setValue(10);
    weekSlide.setValue(8);
    Animated.stagger(80, [
      Animated.timing(summarySlide, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(weekSlide, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [selectedDayName]);

  const handleDaySelect = useCallback((dayName: string) => {
    setSelectedDayName(dayName);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleCellPress = useCallback((classInfo: ClassInfo, day: string, period: string) => {
    setSelectedCell({ classInfo, day, period });
    setSheetVisible(true);
  }, []);

  const { accent, border, text, textSecondary, background, surface, cardBackground: cardBg } = colors;
  const topBarHeight = insets.top + 44;

  return (
    <View style={[styles.root, { backgroundColor: background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={background} />

      {/* Top bar with safe area inset */}
      <View style={[styles.topBar, {
        height: topBarHeight,
        paddingTop: insets.top,
        backgroundColor: isDark ? 'rgba(10,10,12,0.95)' : surface,
        borderBottomColor: border,
      }]}>
        <View style={styles.topBarInner}>
          <TouchableOpacity
            onPress={onBack}
            style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(28,28,30,0.8)' : background, borderColor: border }]}
            accessibilityLabel="Go back">
            <Text style={[styles.iconText, { color: text }]}>{'\u2190'}</Text>
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: text }]}>Classes</Text>
          <TouchableOpacity
            onPress={onChangeRoutine}
            style={[styles.changePill, { backgroundColor: accent + '15', borderColor: accent + '25' }]}
            activeOpacity={0.7}>
            <Text style={[styles.changePillText, { color: accent }]}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Fixed header: summary + week picker */}
      <Animated.View style={{ transform: [{ translateY: summarySlide }] }}>
        <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor: border }]}>
          <View style={[styles.pill, { backgroundColor: accent + '12', borderColor: accent + '20' }]}>
            <View style={[styles.pillDot, { backgroundColor: accent }]} />
            <Text style={[styles.pillText, { color: accent }]}>{todayTimeRange || 'No classes today'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryItem, { color: textSecondary }]}>
              Section <Text style={[styles.summaryVal, { color: text }]}>{studentInfo.section}</Text>
            </Text>
            <Text style={[styles.summaryItem, { color: textSecondary }]}>
              Roll <Text style={[styles.summaryVal, { color: text }]}>{rollNumber}</Text>
            </Text>
          </View>
          <View style={styles.chipRow}>
            {studentInfo.ipa ? (
              <View style={[styles.chip, { backgroundColor: '#6C5CE7' + '18' }]}>
                <View style={[styles.chipDot, { backgroundColor: '#6C5CE7' }]} />
                <Text style={[styles.chipText, { color: '#6C5CE7' }]}>{studentInfo.ipa}</Text>
              </View>
            ) : null}
            {studentInfo.svp ? (
              <View style={[styles.chip, { backgroundColor: '#00CEC9' + '18' }]}>
                <View style={[styles.chipDot, { backgroundColor: '#00CEC9' }]} />
                <Text style={[styles.chipText, { color: '#00CEC9' }]}>{studentInfo.svp}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Animated.View>

      {/* Calendar */}
      <Animated.View style={{ transform: [{ translateY: weekSlide }] }}>
        <CalendarView
          routine={routine}
          selectedDayName={selectedDayName}
          onSelectDay={handleDaySelect}
        />
      </Animated.View>

      {/* Search */}
      {timelineEntries.length > 0 && (
        <SearchBar
          onSearch={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />
      )}

      {/* Scrollable timeline */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} colors={[accent]} />}>
        <View style={styles.timelineSection}>
          <View style={styles.timelineLabel}>
            <Text style={[styles.timelineTitle, { color: text }]}>
              {selectedDayName === getTodayName() ? "Today" : selectedDayName}
            </Text>
            <Text style={[styles.timelineCount, { color: textSecondary }]}>
              {searchQuery ? `${filteredEntries.length} of ${todayClasses.length} classes` : `${todayClasses.length} classes`}
            </Text>
          </View>

          {todayClasses.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: cardBg, borderColor: border }]}>
              <Text style={{ fontSize: 36, marginBottom: 10 }}>{'\u{1F389}'}</Text>
              <Text style={[styles.emptyText, { color: text }]}>No classes today</Text>
              <Text style={[styles.emptySubtext, { color: textSecondary }]}>Enjoy your day off!</Text>
            </View>
          ) : (
            <View style={styles.timelineContainer}>
              {filteredEntries.map((entry, index) => {
                if (entry.isBreak) {
                  return (
                    <View key={entry.period} style={styles.breakRow}>
                      <View style={styles.breakTimeCol}>
                        <Text style={[styles.breakTimeHour, { color: textSecondary }]}>
                          {parseInt(entry.period.substring(1), 10) + 7}
                        </Text>
                        <Text style={[styles.breakTimeMin, { color: textSecondary }]}>00</Text>
                        {index < timelineEntries.length - 1 && (
                          <View style={[styles.breakTimeLine, { backgroundColor: border }]} />
                        )}
                      </View>
                      <View style={styles.breakNodeCol}>
                        <View style={styles.breakNode} />
                        {index < timelineEntries.length - 1 && (
                          <View style={[styles.breakConnector, { backgroundColor: border }]} />
                        )}
                      </View>
                      <View style={[styles.breakCard, { borderColor: border }]}>
                        <Text style={[styles.breakLabel, { color: textSecondary }]}>Break</Text>
                      </View>
                    </View>
                  );
                }
                return (
                  <ClassCard
                    key={entry.period}
                    item={entry as { period: string; classInfo: ClassInfo; time: { start: string; end: string } }}
                    index={index}
                    subjectColor={getSubjectColor(entry.classInfo!.subject)}
                    displayTime={entry.time.start ? `${entry.time.start}\u2013${entry.time.end}` : ''}
                    hour={parseInt(entry.period.substring(1), 10) + 7}
                    isLast={index === timelineEntries.length - 1}
                    borderClr={border}
                    cardBg={cardBg}
                    textPri={text}
                    textSec={textSecondary}
                    textTer={textSecondary}
                    onPress={handleCellPress}
                    dayName={selectedDayName}
                  />
                );
              })}
            </View>
          )}
          <View style={{ height: insets.bottom + 20 }} />
        </View>
      </ScrollView>

      <BottomSheet
        visible={sheetVisible}
        cellDetail={selectedCell ? {
          subject: selectedCell.classInfo.subject,
          faculty: selectedCell.classInfo.faculty,
          room: selectedCell.classInfo.room,
          section: studentInfo.section,
          day: selectedCell.day,
          period: selectedCell.period,
        } : null}
        onClose={() => { setSheetVisible(false); setSelectedCell(null); }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { borderBottomWidth: 1 },
  topBarInner: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconBtn: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  iconText: { fontSize: 15 },
  pageTitle: { fontSize: 22, fontWeight: '800', marginLeft: 10, marginRight: 6 },
  changePill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, marginLeft: 'auto' },
  changePillText: { fontSize: 11, fontWeight: '600' },

  summaryCard: {
    marginHorizontal: 12, marginTop: 6, borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, marginBottom: 4 },
  pillDot: { width: 4, height: 4, borderRadius: 2, marginRight: 5 },
  pillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },
  summaryRow: { flexDirection: 'row', gap: 16, marginBottom: 4 },
  summaryItem: { fontSize: 10, fontWeight: '500' },
  summaryVal: { fontSize: 11, fontWeight: '800' },
  chipRow: { flexDirection: 'row', gap: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  chipDot: { width: 3, height: 3, borderRadius: 1.5, marginRight: 4 },
  chipText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.2 },

  scroll: { flex: 1 },
  scrollContent: { paddingTop: 8 },
  timelineSection: { paddingHorizontal: 12 },
  timelineLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  timelineTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
  timelineCount: { fontSize: 10, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 24, borderRadius: 12, borderWidth: 1 },
  emptyText: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  emptySubtext: { fontSize: 11, fontWeight: '400' },
  timelineContainer: { gap: 0 },
  breakRow: { flexDirection: 'row', opacity: 0.5 },
  breakTimeCol: { width: 28, alignItems: 'center', paddingTop: 6 },
  breakTimeHour: { fontSize: 11, fontWeight: '600', lineHeight: 13 },
  breakTimeMin: { fontSize: 8, fontWeight: '500', lineHeight: 9, marginBottom: 2 },
  breakTimeLine: { flex: 1, width: 1, marginTop: 2 },
  breakNodeCol: { width: 16, alignItems: 'center', paddingTop: 8 },
  breakNode: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  breakConnector: { flex: 1, width: 1, marginTop: 2, borderStyle: 'dashed' },
  breakCard: {
    flex: 1, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed',
    marginBottom: 1, marginVertical: 3, paddingVertical: 6, paddingHorizontal: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  breakLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
});

export default React.memo(PremiumSchedule);
