import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { ClassInfo } from '../types';
import { useTheme } from '../context/ThemeContext';

const FULL_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MINI_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface CalendarViewProps {
  routine: Record<string, Record<string, ClassInfo | null>>;
  selectedDayName: string;
  onSelectDay: (dayName: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  routine, selectedDayName, onSelectDay,
}) => {
  const { colors, isDark } = useTheme();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDays = useMemo(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1 + weekOffset * 7);
    const days: { dateNum: number; dayName: string; fullDayName: string; dateObj: Date; isToday: boolean; dayIdx: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dayIdx = d.getDay();
      const todayStr = now.toDateString();
      days.push({
        dateNum: d.getDate(),
        dayName: SHORT_NAMES[dayIdx],
        fullDayName: FULL_NAMES[dayIdx],
        dateObj: d,
        isToday: d.toDateString() === todayStr,
        dayIdx,
      });
    }
    return days;
  }, [weekOffset]);

  const dayClassCount = useMemo(() => {
    const map: Record<string, number> = {};
    for (const dayName of FULL_NAMES) {
      if (routine[dayName]) {
        map[dayName] = Object.values(routine[dayName]).filter(Boolean).length;
      }
    }
    return map;
  }, [routine]);

  const monthLabel = useMemo(() => {
    const now = new Date();
    const d = weekDays[0]?.dateObj || now;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const endMonth = weekDays[6]?.dateObj || now;
    if (d.getMonth() === endMonth.getMonth()) {
      return months[d.getMonth()] + ' ' + d.getFullYear();
    }
    return months[d.getMonth()] + ' - ' + months[endMonth.getMonth()] + ' ' + endMonth.getFullYear();
  }, [weekDays]);

  const handlePrev = useCallback(() => setWeekOffset(o => o - 1), []);
  const handleNext = useCallback(() => setWeekOffset(o => o + 1), []);

  const { text, textSecondary, accent, border, cardBackground: cardBg } = colors;

  return (
    <View style={[styles.container, { backgroundColor: cardBg, borderColor: border }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrev} style={[styles.navBtn, { borderColor: border }]} activeOpacity={0.6}>
          <Text style={[styles.navText, { color: textSecondary }]}>{'\u2039'}</Text>
        </TouchableOpacity>
        <Text style={[styles.monthLabel, { color: text }]}>{monthLabel}</Text>
        <TouchableOpacity onPress={handleNext} style={[styles.navBtn, { borderColor: border }]} activeOpacity={0.6}>
          <Text style={[styles.navText, { color: textSecondary }]}>{'\u203A'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.daysRow}>
        {weekDays.map((d, index) => {
          const isSelected = d.fullDayName === selectedDayName;
          const isWeekend = d.fullDayName === 'Saturday' || d.fullDayName === 'Sunday';
          const hasClass = dayClassCount[d.fullDayName] > 0;
          const count = dayClassCount[d.fullDayName] || 0;

          return (
            <TouchableOpacity
              key={d.fullDayName}
              onPress={() => onSelectDay(d.fullDayName)}
              activeOpacity={0.7}
              style={styles.dayWrapper}
            >
              <View style={[
                styles.dayBtn,
                isSelected && { backgroundColor: accent },
                d.isToday && !isSelected && { borderWidth: 1.5, borderColor: accent, backgroundColor: accent + '10' },
                isWeekend && !isSelected && !d.isToday && { opacity: 0.5 },
              ]}>
                <Text style={[
                  styles.dayLabel,
                  { color: isSelected ? '#FFF' : textSecondary },
                  d.isToday && !isSelected && { color: accent },
                ]                }>{MINI_NAMES[d.dayIdx]}</Text>
                <Text style={[
                  styles.dayNum,
                  { color: isSelected ? '#FFF' : text },
                  d.isToday && !isSelected && { color: accent },
                ]}>{d.dateNum}</Text>
                <View style={[
                  styles.badge,
                  { backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : (hasClass ? accent : (isDark ? 'rgba(255,255,255,0.08)' : '#E0E0E0')) },
                ]}>
                  <Text style={[
                    styles.badgeText,
                    { color: isSelected ? '#FFF' : (hasClass ? '#FFF' : textSecondary) },
                  ]}>{count}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 6,
  },
  navBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  monthLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  dayWrapper: {
    alignItems: 'center',
  },
  dayBtn: {
    width: 36,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 10,
  },
  dayLabel: {
    fontSize: 8,
    fontWeight: '700',
    marginBottom: 1,
    letterSpacing: 0.2,
  },
  dayNum: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  badge: {
    minWidth: 14,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 7,
    fontWeight: '800',
  },
});

export default React.memo(CalendarView);
