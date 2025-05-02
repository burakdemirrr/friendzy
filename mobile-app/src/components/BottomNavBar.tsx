import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styled } from 'nativewind';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
} from 'react-native-reanimated';

const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledBlurView = styled(BlurView);
const AnimatedView = Animated.createAnimatedComponent(styled(View));

interface BottomNavBarProps {
  activeTab: 'home' | 'friends' | 'calendar' | 'profile';
  onTabPress: (tab: 'home' | 'friends' | 'calendar' | 'profile') => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabPress,
}) => {
  const tabs = [
    { name: 'home', icon: 'home', label: 'Home' },
    { name: 'friends', icon: 'people', label: 'Friends' },
    { name: 'calendar', icon: 'calendar', label: 'Calendar' },
    { name: 'profile', icon: 'person', label: 'Profile' },
  ] as const;

  return (
    <StyledView className="absolute bottom-0 left-0 right-0">
      <StyledBlurView
        intensity={80}
        tint="light"
        className="overflow-hidden rounded-t-3xl border-t border-gray-100"
      >
        <StyledView className="flex-row justify-around items-center py-2 px-4">
          {tabs.map((tab) => (
            <TabButton
              key={tab.name}
              icon={tab.icon}
              label={tab.label}
              isActive={activeTab === tab.name}
              onPress={() => onTabPress(tab.name)}
            />
          ))}
        </StyledView>
      </StyledBlurView>
    </StyledView>
  );
};

interface TabButtonProps {
  icon: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({
  icon,
  label,
  isActive,
  onPress,
}) => {
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(isActive ? 1.1 : 1, {
            damping: 10,
            stiffness: 100,
          }),
        },
      ],
      opacity: withTiming(isActive ? 1 : 0.7, {
        duration: 200,
      }),
    };
  });

  const indicatorStyles = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isActive ? 1 : 0, {
        duration: 200,
      }),
      transform: [
        {
          translateY: withSpring(isActive ? 0 : 10, {
            damping: 10,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  return (
    <StyledTouchableOpacity
      onPress={onPress}
      className="items-center justify-center py-2 px-4"
      style={{ minWidth: 64 }}
    >
      <AnimatedView style={animatedStyles}>
        <Ionicons
          name={isActive ? icon as any : `${icon}-outline` as any}
          size={24}
          color={isActive ? '#6366F1' : '#64748B'}
        />
      </AnimatedView>

      {/* Active Indicator */}
      <AnimatedView 
        className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary-500"
        style={[{ left: '50%', marginLeft: -2 }, indicatorStyles]}
      />
    </StyledTouchableOpacity>
  );
}; 