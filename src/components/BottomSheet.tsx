import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import {useTheme} from '../context/ThemeContext';
import {CellDetail} from '../types';

interface BottomSheetProps {
  visible: boolean;
  cellDetail: CellDetail | null;
  onClose: () => void;
}

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const BottomSheet: React.FC<BottomSheetProps> = ({visible, cellDetail, onClose}) => {
  const {colors} = useTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
      fadeAnim.setValue(0);
    }
  }, [visible, slideAnim, fadeAnim]);

  if (!cellDetail) return null;

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const details = [
    {label: 'Subject', value: cellDetail.subject, icon: '\u{1F4D6}'},
    {label: 'Faculty', value: cellDetail.faculty, icon: '\u{1F464}'},
    {label: 'Room', value: cellDetail.room, icon: '\u{1F4CD}'},
    {label: 'Section', value: cellDetail.section || 'N/A', icon: '\u{1F465}'},
    {label: 'Day', value: cellDetail.day, icon: '\u{1F4C5}'},
    {label: 'Period', value: cellDetail.period, icon: '\u23F0'},
  ];

  return (
    <Modal visible={visible} transparent onRequestClose={handleClose} accessibilityViewIsModal>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.touchArea} activeOpacity={1} onPress={handleClose} />
        <Animated.View style={[styles.sheet, {
          backgroundColor: colors.bottomSheetBackground,
          transform: [{ translateY: slideAnim }],
        }]}>
          <View style={[styles.handle, {backgroundColor: colors.textSecondary + '35'}]} />
          <Text style={[styles.title, {color: colors.text}]}>Class Details</Text>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {details.map((item, idx) => (
              <View key={idx} style={[styles.row, {borderBottomColor: colors.border}]}>
                <View style={styles.labelRow}>
                  <Text style={{fontSize: 12}}>{item.icon}</Text>
                  <Text style={[styles.label, {color: colors.textSecondary}]}>{item.label}</Text>
                </View>
                <Text style={[styles.value, {color: colors.text}]} numberOfLines={2}>{item.value}</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[styles.closeBtn, {backgroundColor: colors.primary}]}
            onPress={handleClose}
            activeOpacity={0.85}
            accessibilityLabel="Close">
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  touchArea: { flex: 1 },
  sheet: {
    maxHeight: SCREEN_HEIGHT * 0.48,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 6,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 6, marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  content: { marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  label: { fontSize: 13, fontWeight: '500' },
  value: { fontSize: 13, fontWeight: '600', flex: 1.5, textAlign: 'right' },
  closeBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  closeBtnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});

export default BottomSheet;
