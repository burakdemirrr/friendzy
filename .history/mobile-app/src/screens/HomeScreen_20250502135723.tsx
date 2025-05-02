import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { PostCard } from '../components/PostCard';
import { BottomNavBar } from '../components/BottomNavBar';
import { colors } from '../styles/theme';

export const HomeScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'friends' | 'calendar' | 'profile'>('home');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <PostCard
          username="User"
          timestamp="02.05.2025 13:37:15"
          location="NABERRRR"
          likes={0}
          comments={0}
        />
        {/* Add more PostCard components as needed */}
      </ScrollView>
      
      <BottomNavBar
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    flex: 1,
  },
}); 