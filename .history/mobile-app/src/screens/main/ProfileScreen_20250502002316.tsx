import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function ProfileScreen() {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-[#0A0F1C]">
      <StyledView className="px-6 pt-4">
        <StyledText className="text-2xl font-bold text-white">
          Profile
        </StyledText>
      </StyledView>
      
      <StyledScrollView className="flex-1 px-6 pt-4">
        <StyledView className="space-y-6">
          {/* Profile information will be displayed here */}
          <StyledView className="items-center">
            <StyledView className="w-24 h-24 rounded-full bg-[#1C2438] items-center justify-center mb-4">
              <Ionicons name="person" size={48} color="#6B7280" />
            </StyledView>
            <StyledText className="text-white text-xl font-semibold">
              Loading...
            </StyledText>
            <StyledText className="text-gray-400">
              @username
            </StyledText>
          </StyledView>

          <StyledTouchableOpacity
            onPress={handleSignOut}
            className="flex-row items-center justify-center space-x-2 py-4"
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <StyledText className="text-red-500 font-medium">
              Sign Out
            </StyledText>
          </StyledTouchableOpacity>
        </StyledView>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
} 