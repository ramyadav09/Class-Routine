import React, {useState, useCallback, useMemo} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {ClassInfo, CellDetail, DAYS, UPTO_PERIODS} from '../types';
import {useTheme} from '../context/ThemeContext';
import {useResponsiveDimensions} from '../utils/useWindowDimensions';
import RoutineCell from './RoutineCell';
import BottomSheet from './BottomSheet';
import SearchBar from './SearchBar';
import {getCurrentDay, getCurrentPeriod, searchClasses} from '../services/routineService';

interface RoutineTableProps {
  routine: Record<string, Record<string, ClassInfo | null>>;
  sectionLabel?: string;
}

const TIME_COL_WIDTH = 64;

const RoutineTable: React.FC<RoutineTableProps> = ({routine, sectionLabel = ''}) => {
  const {colors} = useTheme();
  const dims = useResponsiveDimensions();
  const [selectedCell, setSelectedCell] = useState<CellDetail | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const cellWidth = Math.max(80, (dims.width - TIME_COL_WIDTH - 32) / 6);

  const currentDay = getCurrentDay();
  const currentPeriod = getCurrentPeriod();

  const handleCellPress = useCallback(
    (classInfo: ClassInfo | null, day: string, period: string) => {
      if (classInfo) {
        setSelectedCell({
          subject: classInfo.subject,
          faculty: classInfo.faculty,
          room: classInfo.room,
          section: sectionLabel,
          day,
          period,
        });
        setSheetVisible(true);
      }
    },
    [sectionLabel],
  );

  const handleSearch = useCallback(
    (query: string) => {
      if (query.trim()) {
        const results = searchClasses(routine, query);
        const highlighted = new Set<string>();
        results.forEach(r => highlighted.add(`${r.day}-${r.period}`));
        setHighlightedCells(highlighted);
      } else {
        setHighlightedCells(new Set());
      }
    },
    [routine],
  );

  const handleClearSearch = useCallback(() => setHighlightedCells(new Set()), []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const filteredDays = useMemo(
    () => DAYS.filter(day => routine[day] && Object.keys(routine[day]).length > 0),
    [routine],
  );

  return (
    <View style={styles.container}>
      <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.headerRow}>
            <View style={[styles.timeCol, {backgroundColor: colors.primary}]}>
              <Text style={styles.headerText}>Day</Text>
            </View>
            {UPTO_PERIODS.map(p => (
              <View key={p} style={[styles.periodHeader, {backgroundColor: colors.primary}]}>
                <Text style={styles.headerText}>{p}</Text>
              </View>
            ))}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}>
            {filteredDays.map(day => (
              <View key={day} style={styles.dayRow}>
                <View style={[styles.dayLabel, {backgroundColor: day === currentDay ? colors.primary : colors.surface}]}>
                  <Text style={[styles.dayText, {color: day === currentDay ? colors.headerText : colors.text}]}>
                    {day.substring(0, 3)}
                  </Text>
                </View>
                {UPTO_PERIODS.map(period => {
                  const classInfo = routine[day]?.[period] || null;
                  return (
                    <RoutineCell
                      key={`${day}-${period}`}
                      classInfo={classInfo}
                      period={period}
                      day={day}
                      isCurrentDay={day === currentDay}
                      isCurrentClass={day === currentDay && period === currentPeriod}
                      isSearchHighlight={highlightedCells.has(`${day}-${period}`)}
                      isFree={!classInfo}
                      cellWidth={cellWidth}
                      onPress={handleCellPress}
                    />
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <BottomSheet
        visible={sheetVisible}
        cellDetail={selectedCell}
        onClose={() => { setSheetVisible(false); setSelectedCell(null); }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row' },
  timeCol: { width: TIME_COL_WIDTH, height: 34, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  periodHeader: { width: 85, height: 34, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 0.5, borderLeftColor: 'rgba(255,255,255,0.3)' },
  headerText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  dayRow: { flexDirection: 'row' },
  dayLabel: { width: TIME_COL_WIDTH, height: 68, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  dayText: { fontSize: 12, fontWeight: '700' },
});

export default RoutineTable;
