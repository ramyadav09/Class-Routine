import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ClassInfo } from '../types';

interface ClassCardProps {
  item: {
    period: string;
    classInfo: ClassInfo;
    time: { start: string; end: string };
  };
  index: number;
  subjectColor: string;
  displayTime: string;
  hour: number;
  isLast: boolean;
  borderClr: string;
  cardBg: string;
  textPri: string;
  textSec: string;
  textTer: string;
  onPress: (classInfo: ClassInfo, day: string, period: string) => void;
  dayName: string;
}

const ClassCard: React.FC<ClassCardProps> = ({
  item, index, subjectColor, displayTime, hour, isLast,
  borderClr, cardBg, textPri, textSec, textTer,
  onPress, dayName,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 400, delay: index * 80, useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 400, delay: index * 80, useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 150, friction: 5 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 150, friction: 5 }).start();
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => onPress(item.classInfo, dayName, item.period)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessibilityLabel={`${item.classInfo.subject} ${displayTime}`}>
        <View style={styles.timelineRow}>
          <View style={styles.timeCol}>
            <Text style={[styles.timeHour, { color: textPri }]}>{hour}</Text>
            <Text style={[styles.timeMin, { color: textTer }]}>00</Text>
            {!isLast && <View style={[styles.timeLine, { backgroundColor: borderClr }]} />}
          </View>
          <View style={styles.nodeCol}>
            <View style={[styles.node, { backgroundColor: subjectColor }]} />
            {!isLast && <View style={[styles.connector, { backgroundColor: borderClr }]} />}
          </View>
          <View style={[styles.subjCard, {
            backgroundColor: cardBg,
            borderColor: borderClr,
            borderLeftColor: subjectColor,
            shadowColor: subjectColor,
          }]}>
            <View style={styles.subjInner}>
              <View style={styles.subjHeader}>
                <Text style={[styles.subjName, { color: textPri }]} numberOfLines={1}>
                  {item.classInfo.subject}
                </Text>
                <View style={[styles.subjBadge, { backgroundColor: subjectColor + '20' }]}>
                  <Text style={[styles.subjBadgeText, { color: subjectColor }]}>
                    {item.period}
                  </Text>
                </View>
              </View>
              <View style={styles.subjMeta}>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaIcon, { color: textSec }]}>{'\u{1F4CD}'}</Text>
                  <Text style={[styles.metaText, { color: textSec }]} numberOfLines={1}>
                    {item.classInfo.room || 'N/A'}
                  </Text>
                </View>
                {item.classInfo.faculty ? (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaIcon, { color: textSec }]}>{'\u{1F464}'}</Text>
                    <Text style={[styles.metaText, { color: textSec }]} numberOfLines={1}>
                      {item.classInfo.faculty}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.subjFooter}>
                <Text style={[styles.subjTime, { color: textTer }]}>{displayTime}</Text>
                <View style={[styles.durPill, { backgroundColor: subjectColor + '20' }]}>
                  <Text style={[styles.durText, { color: subjectColor }]}>1h</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  timelineRow: { flexDirection: 'row' },
  timeCol: { width: 28, alignItems: 'center', paddingTop: 2 },
  timeHour: { fontSize: 12, fontWeight: '800', lineHeight: 14 },
  timeMin: { fontSize: 8, fontWeight: '500', lineHeight: 9, marginBottom: 2 },
  timeLine: { flex: 1, width: 1, marginTop: 2 },
  nodeCol: { width: 16, alignItems: 'center', paddingTop: 4 },
  node: { width: 6, height: 6, borderRadius: 3 },
  connector: { flex: 1, width: 1, marginTop: 2 },
  subjCard: {
    flex: 1, borderRadius: 10, borderWidth: 1, borderLeftWidth: 3,
    marginBottom: 2, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 3,
  },
  subjInner: { padding: 8 },
  subjHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  subjName: { fontSize: 12, fontWeight: '800', letterSpacing: -0.2, flex: 1, marginRight: 6 },
  subjBadge: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  subjBadgeText: { fontSize: 8, fontWeight: '700' },
  subjMeta: { gap: 1, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaIcon: { fontSize: 8, marginRight: 4, width: 12, textAlign: 'center' },
  metaText: { fontSize: 10, fontWeight: '500', flex: 1 },
  subjFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjTime: { fontSize: 9, fontWeight: '600' },
  durPill: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  durText: { fontSize: 9, fontWeight: '700' },
});

export default memo(ClassCard);
