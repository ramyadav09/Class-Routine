import React, {memo} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {ClassInfo} from '../types';
import {useTheme} from '../context/ThemeContext';

interface RoutineCellProps {
  classInfo: ClassInfo | null;
  period: string;
  day: string;
  isCurrentDay: boolean;
  isCurrentClass: boolean;
  isSearchHighlight: boolean;
  isFree: boolean;
  cellWidth?: number;
  onPress: (classInfo: ClassInfo | null, day: string, period: string) => void;
}

const RoutineCell: React.FC<RoutineCellProps> = ({
  classInfo, period, day, isCurrentDay, isCurrentClass,
  isSearchHighlight, isFree, cellWidth = 85, onPress,
}) => {
  const {colors} = useTheme();

  const bgColor = () => {
    if (isSearchHighlight && classInfo) return colors.searchHighlight;
    if (isCurrentClass && classInfo) return colors.currentClass;
    if (isCurrentDay && isFree) return colors.highlight;
    if (!classInfo) return colors.freePeriod;
    if (isCurrentDay) return colors.currentDay;
    return colors.cellBackground;
  };

  return (
    <TouchableOpacity
      style={[styles.cell, {width: cellWidth, backgroundColor: bgColor(), borderColor: colors.border}]}
      onPress={() => onPress(classInfo, day, period)}
      activeOpacity={0.7}
      disabled={!classInfo}
      accessibilityLabel={classInfo ? `${classInfo.subject} ${classInfo.faculty} ${classInfo.room}` : 'Free'}
      accessibilityRole="button">
      {classInfo ? (
        <View style={styles.content}>
          <Text style={[styles.subject, {color: colors.text}]} numberOfLines={1}>{classInfo.subject}</Text>
          <Text style={[styles.faculty, {color: colors.textSecondary}]} numberOfLines={1}>{classInfo.faculty}</Text>
          <Text style={[styles.room, {color: colors.primary}]} numberOfLines={1}>{classInfo.room}</Text>
        </View>
      ) : (
        <Text style={[styles.free, {color: colors.textSecondary}]}>Free</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cell: { height: 66, borderWidth: 0.5, padding: 3, justifyContent: 'center' },
  content: {},
  subject: { fontSize: 10, fontWeight: '700', marginBottom: 1 },
  faculty: { fontSize: 8, fontWeight: '500', marginBottom: 1 },
  room: { fontSize: 8, fontWeight: '600' },
  free: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
});

export default memo(RoutineCell);
