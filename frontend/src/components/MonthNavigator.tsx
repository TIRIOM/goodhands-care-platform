import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PreIcon, PostIcon } from '../styles/images.tsx';

interface MonthNavigatorProps {
  monthLabel: string;
  onPrev: () => void;
  onNext: () => void;
  isPrevDisabled?: boolean;
  isNextDisabled?: boolean;
  style?: any;
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({
  monthLabel,
  onPrev,
  onNext,
  isPrevDisabled,
  isNextDisabled,
  style
}) => (
  <View style={[styles.monthNavigation, style]}>
    <TouchableOpacity
      onPress={isPrevDisabled ? undefined : onPrev}
      style={[styles.navButton, { opacity: isPrevDisabled ? 0.3 : 1 }]}
    >
      <PreIcon />
    </TouchableOpacity>
    <Text style={styles.currentMonth}>{monthLabel}</Text>
    <TouchableOpacity
      onPress={isNextDisabled ? undefined : onNext}
      style={[styles.navButton, { opacity: isNextDisabled ? 0.3 : 1 }]}
    >
      <PostIcon />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  monthNavigation: {
    borderStyle: "solid",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#CDD5DB",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  navButton: {
    padding: 10,
  },
  currentMonth: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 20,
    color: '#333',
  },
});

export default MonthNavigator; 